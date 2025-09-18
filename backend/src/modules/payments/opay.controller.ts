import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { OpayService } from "../../services/opayService";
import { HttpResponse } from "../../utils/http";
import { asyncHandler } from "../../middleware/error";
import type { AuthenticatedRequest } from "../../types";
import { prisma } from "../../config/database";

export class OpayController {
  /**
   * Create OPay payment validation rules
   */
  static createPaymentValidation = [
    body("bookingId")
      .isString()
      .notEmpty()
      .withMessage("Booking ID is required"),
    body("amount")
      .isNumeric()
      .isFloat({ min: 1 })
      .withMessage("Amount must be a positive number"),
  ];

  /**
   * Create OPay Wallet QR Payment
   */
  static createPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const mapped = errors
          .array()
          .reduce<Record<string, string[]>>((acc, e) => {
            const key = (e as any).path || "form";
            (acc[key] ||= []).push(e.msg);
            return acc;
          }, {});
        return HttpResponse.validationError(res, "Validation failed", mapped);
      }

      const { bookingId, amount } = req.body;
      const userId = req.user!.id;

      try {
        // Get booking details
        const booking = await prisma.booking.findFirst({
          where: {
            id: bookingId,
            userId: userId,
            status: "PENDING",
          },
          include: {
            event: true,
            user: true,
          },
        });

        if (!booking) {
          return HttpResponse.notFound(
            res,
            "Booking not found or already processed"
          );
        }

        // Generate unique reference
        const reference = `OPAY_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Create OPay payment
        const opayResponse = await OpayService.createWalletPayment({
          reference,
          amount: Math.round(amount * 100), // Convert to kobo
          currency: "NGN",
          callbackUrl: `${process.env.BASE_URL}/api/webhooks/opay`,
          productName: `Event Ticket - ${booking.event.title}`,
          productDescription: `Ticket for ${booking.event.title} on ${new Date(
            booking.event.startDate
          ).toLocaleDateString()}`,
        });

        if (opayResponse.code !== "00000") {
          return HttpResponse.badRequest(
            res,
            opayResponse.message || "Failed to create payment"
          );
        }

        // Update booking with payment reference
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentReference: reference,
            status: "PENDING",
          },
        });

        // Create payment record
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: amount,
            currency: "NGN",
            paymentMethod: "OPAY_WALLET_QR",
            paymentReference: reference,
            paystackReference: null, // OPay doesn't use Paystack reference
            status: "PENDING",
          },
        });

        return HttpResponse.success(res, "Payment created successfully", {
          reference,
          qrCode: opayResponse.data.nextAction.qrCode,
          amount: opayResponse.data.amount,
          status: opayResponse.data.status,
          orderNo: opayResponse.data.orderNo,
        });
      } catch (error: any) {
        console.error("OPay payment creation error:", error);
        return HttpResponse.internalError(res, "Failed to create payment");
      }
    }
  );

  /**
   * Query payment status
   */
  static queryPaymentStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { reference } = req.params;

      if (!reference) {
        return HttpResponse.badRequest(res, "Payment reference is required");
      }

      try {
        // Query from OPay
        const opayResponse = await OpayService.queryPaymentStatus(reference);

        if (opayResponse.code !== "00000") {
          return HttpResponse.badRequest(
            res,
            opayResponse.message || "Failed to query payment status"
          );
        }

        // Update local payment status
        const payment = await prisma.payment.findFirst({
          where: { paymentReference: reference },
          include: { booking: true },
        });

        if (payment) {
          const newStatus =
            opayResponse.data.status === "SUCCESSFUL"
              ? "SUCCESSFUL"
              : opayResponse.data.status === "FAILED"
              ? "FAILED"
              : "PENDING";

          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: newStatus,
              paidAt: newStatus === "SUCCESSFUL" ? new Date() : null,
            },
          });

          // Update booking status if payment successful
          if (newStatus === "SUCCESSFUL") {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: { status: "CONFIRMED" },
            });
          }
        }

        return HttpResponse.success(
          res,
          "Payment status retrieved successfully",
          {
            reference: opayResponse.data.reference,
            status: opayResponse.data.status,
            amount: opayResponse.data.amount,
          }
        );
      } catch (error: any) {
        console.error("OPay status query error:", error);
        return HttpResponse.internalError(
          res,
          "Failed to query payment status"
        );
      }
    }
  );

  /**
   * Cancel payment
   */
  static cancelPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { reference } = req.params;

      if (!reference) {
        return HttpResponse.badRequest(res, "Payment reference is required");
      }

      try {
        // Cancel with OPay
        const opayResponse = await OpayService.cancelPayment(reference);

        if (opayResponse.code !== "00000") {
          return HttpResponse.badRequest(
            res,
            opayResponse.message || "Failed to cancel payment"
          );
        }

        // Update local records
        await prisma.payment.updateMany({
          where: { paymentReference: reference },
          data: { status: "FAILED" },
        });

        await prisma.booking.updateMany({
          where: { paymentReference: reference },
          data: { status: "CANCELLED" },
        });

        return HttpResponse.success(res, "Payment cancelled successfully");
      } catch (error: any) {
        console.error("OPay payment cancellation error:", error);
        return HttpResponse.internalError(res, "Failed to cancel payment");
      }
    }
  );

  /**
   * Get supported payment methods
   */
  static getPaymentMethods = asyncHandler(
    async (req: Request, res: Response) => {
      const methods = OpayService.getSupportedPaymentMethods();
      return HttpResponse.success(
        res,
        "Payment methods retrieved successfully",
        methods
      );
    }
  );
}
