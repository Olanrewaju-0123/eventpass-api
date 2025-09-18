import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { PaymentsService } from "./payments.service";
import { HttpResponse } from "../../utils/http";
import { asyncHandler } from "../../middleware/error";
import type { AuthenticatedRequest } from "../../types";
import { prisma } from "../../config/database";

export class PaymentsController {
  /**
   * Initialize payment validation rules
   */
  static initializePaymentValidation = [
    body("bookingId").isUUID().withMessage("Valid booking ID is required"),
    body("callbackUrl")
      .optional()
      .isURL()
      .withMessage("Valid callback URL is required"),
  ];

  /**
   * Initialize event creation payment validation rules
   */
  static initializeEventCreationPaymentValidation = [
    body("amount").isNumeric().withMessage("Amount is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("reference").isString().withMessage("Reference is required"),
    body("provider")
      .isIn(["paystack", "opay"])
      .withMessage("Provider must be paystack or opay"),
    body("metadata").isObject().withMessage("Metadata is required"),
  ];

  /**
   * Initialize payment
   */
  static initializePayment = asyncHandler(
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

      const { bookingId, callbackUrl } = req.body;

      const result = await PaymentsService.initializePayment(
        bookingId,
        callbackUrl
      );

      return HttpResponse.success(
        res,
        "Payment initialized successfully",
        result,
        201
      );
    }
  );

  /**
   * Initialize event creation payment
   */
  static initializeEventCreationPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      console.log(
        "Event creation payment request body:",
        JSON.stringify(req.body, null, 2)
      );
      console.log("User from request:", req.user);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        const mapped = errors
          .array()
          .reduce<Record<string, string[]>>((acc, e) => {
            const key = (e as any).path || "form";
            (acc[key] ||= []).push(e.msg);
            return acc;
          }, {});
        return HttpResponse.validationError(res, "Validation failed", mapped);
      }

      const {
        amount,
        email,
        currency,
        reference,
        provider,
        metadata,
        callback_url,
      } = req.body;

      // For testing, use userId from metadata if no authenticated user
      const userId = req.user?.id || metadata.userId;

      if (!userId) {
        return HttpResponse.badRequest(res, "User ID is required");
      }

      const result = await PaymentsService.initializeEventCreationPayment({
        amount,
        email,
        currency: currency || "NGN",
        reference,
        provider,
        metadata,
        callback_url,
        userId,
      });

      return HttpResponse.success(
        res,
        "Event creation payment initialized successfully",
        result,
        201
      );
    }
  );

  /**
   * Verify payment
   */
  static verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { paymentReference } = req.params;

    if (!paymentReference) {
      return HttpResponse.badRequest(res, "Payment reference is required");
    }

    const result = await PaymentsService.verifyPayment(paymentReference);

    return HttpResponse.success(res, result.message, result);
  });

  /**
   * Handle Paystack webhook
   */
  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const event = req.body;

    await PaymentsService.handleWebhook(event);

    return HttpResponse.success(res, "Webhook processed successfully");
  });

  /**
   * Get payment by reference
   */
  static getPaymentByReference = asyncHandler(
    async (req: Request, res: Response) => {
      const { paymentReference } = req.params;

      const payment = await PaymentsService.getPaymentByReference(
        paymentReference
      );

      return HttpResponse.success(
        res,
        "Payment retrieved successfully",
        payment
      );
    }
  );

  /**
   * Get my payments
   */
  static getMyPayments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Math.min(
        Number.parseInt(req.query.limit as string) || 10,
        50
      );

      const { payments, total } = await PaymentsService.getUserPayments(
        req.user!.id,
        page,
        limit
      );

      return HttpResponse.paginated(
        res,
        payments,
        page,
        limit,
        total,
        "Your payments retrieved successfully"
      );
    }
  );

  /**
   * Get all payments (admin only)
   */
  static getAllPayments = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Math.min(
        Number.parseInt(req.query.limit as string) || 10,
        50
      );
      const status = req.query.status as any as
        | "PENDING"
        | "SUCCESSFUL"
        | "FAILED"
        | "REFUNDED"
        | undefined;

      const { payments, total } = await PaymentsService.getAllPayments(
        page,
        limit,
        status
      );

      return HttpResponse.paginated(
        res,
        payments,
        page,
        limit,
        total,
        "All payments retrieved successfully"
      );
    }
  );

  /**
   * Get payment statistics
   */
  static getPaymentStatistics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const stats = await PaymentsService.getPaymentStatistics(req.user!.id);

      return HttpResponse.success(
        res,
        "Payment statistics retrieved successfully",
        stats
      );
    }
  );

  /**
   * Get all payment statistics (admin only)
   */
  static getAllPaymentStatistics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const stats = await PaymentsService.getPaymentStatistics();

      return HttpResponse.success(
        res,
        "All payment statistics retrieved successfully",
        stats
      );
    }
  );

  /**
   * Refund payment (admin only)
   */
  static refundPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { paymentId } = req.params;
      const { reason } = req.body;

      const result = await PaymentsService.refundPayment(paymentId, reason);

      return HttpResponse.success(res, result.message, result);
    }
  );

  /**
   * Process mock payment for development
   */
  static processMockPayment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { reference, amount, provider } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return HttpResponse.error(res, "User not authenticated", 401);
      }

      if (!reference || !amount || !provider) {
        return HttpResponse.error(res, "Missing required fields", 400);
      }

      try {
        // For event creation payments, we don't store them in the Payment table
        // Instead, we process the payment directly and create the event
        // The payment data is stored in the payment provider's metadata

        // Since this is a mock payment for event creation, we'll process it directly
        // In a real scenario, this would be called by the payment provider's webhook

        // Process the payment (create event)
        await PaymentsService.processPaymentSuccess(reference, "SUCCESSFUL", {
          type: "event_creation",
          eventData: JSON.parse(
            JSON.stringify({
              startDate: "2025-09-19T08:00:00.000Z",
              endDate: "2025-09-19T16:00:00.000Z",
              startTime: "09:00",
              endTime: "17:00",
              price: 1500,
              capacity: 50,
              title: "Alaafin Oyo",
              description: "Alaafin Oyo",
              venue: "Oyo",
              address: "Oyo",
              category: "Arts & Culture",
              imageUrl: "",
            })
          ),
          userId: userId,
          reference: reference,
        });

        return HttpResponse.success(
          res,
          "Mock payment processed successfully",
          { reference, status: "SUCCESSFUL" }
        );
      } catch (error: any) {
        console.error("Mock payment processing error:", error);
        return HttpResponse.error(res, "Failed to process mock payment", 500);
      }
    }
  );
}
