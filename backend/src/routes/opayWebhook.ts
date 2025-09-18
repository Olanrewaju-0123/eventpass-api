import { Router, type Request, type Response } from "express";
import { OpayService } from "../services/opayService";
import { prisma } from "../config/database";
import { HttpResponse } from "../utils/http";
import { asyncHandler } from "../middleware/error";

const router = Router();

/**
 * OPay webhook handler
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const signature = req.headers["authorization"]?.replace("Bearer ", "");
      const webhookData = req.body;

      if (!signature) {
        return HttpResponse.unauthorized(res, "Missing signature");
      }

      // Verify webhook signature
      if (!OpayService.verifyCallbackSignature(webhookData, signature)) {
        return HttpResponse.unauthorized(res, "Invalid signature");
      }

      const { reference, status, orderNo } = webhookData;

      if (!reference) {
        return HttpResponse.badRequest(res, "Missing payment reference");
      }

      // Find payment record
      const payment = await prisma.payment.findFirst({
        where: { paymentReference: reference },
        include: { booking: { include: { event: true, user: true } } },
      });

      if (!payment) {
        return HttpResponse.notFound(res, "Payment not found");
      }

      // Update payment status
      const newPaymentStatus =
        status === "SUCCESSFUL"
          ? "SUCCESSFUL"
          : status === "FAILED"
          ? "FAILED"
          : "PENDING";

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newPaymentStatus,
          paidAt: newPaymentStatus === "SUCCESSFUL" ? new Date() : null,
        },
      });

      // Update booking status if payment successful
      if (newPaymentStatus === "SUCCESSFUL") {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED" },
        });

        // TODO: Send confirmation email to user
        // TODO: Generate QR code for event entry
      } else if (newPaymentStatus === "FAILED") {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CANCELLED" },
        });
      }

      console.log(`OPay webhook processed: ${reference} - ${status}`);

      return HttpResponse.success(res, "Webhook processed successfully");
    } catch (error: any) {
      console.error("OPay webhook error:", error);
      return HttpResponse.internalError(res, "Webhook processing failed");
    }
  })
);

export { router as opayWebhookRoutes };
