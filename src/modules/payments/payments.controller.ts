import type { Request, Response } from "express"
import { body, validationResult } from "express-validator"
import { PaymentsService } from "./payments.service"
import { HttpResponse } from "../../utils/http"
import { asyncHandler } from "../../middleware/error"
import type { AuthenticatedRequest } from "../../types"

export class PaymentsController {
  /**
   * Initialize payment validation rules
   */
  static initializePaymentValidation = [
    body("bookingId").isUUID().withMessage("Valid booking ID is required"),
    body("callbackUrl").optional().isURL().withMessage("Valid callback URL is required"),
  ]

  /**
   * Initialize payment
   */
  static initializePayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return HttpResponse.validationError(res, "Validation failed", errors.mapped())
    }

    const { bookingId, callbackUrl } = req.body

    const result = await PaymentsService.initializePayment(bookingId, callbackUrl)

    return HttpResponse.success(res, "Payment initialized successfully", result, 201)
  })

  /**
   * Verify payment
   */
  static verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { paymentReference } = req.params

    if (!paymentReference) {
      return HttpResponse.badRequest(res, "Payment reference is required")
    }

    const result = await PaymentsService.verifyPayment(paymentReference)

    return HttpResponse.success(res, result.message, result)
  })

  /**
   * Handle Paystack webhook
   */
  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const event = req.body

    await PaymentsService.handleWebhook(event)

    return HttpResponse.success(res, "Webhook processed successfully")
  })

  /**
   * Get payment by reference
   */
  static getPaymentByReference = asyncHandler(async (req: Request, res: Response) => {
    const { paymentReference } = req.params

    const payment = await PaymentsService.getPaymentByReference(paymentReference)

    return HttpResponse.success(res, "Payment retrieved successfully", payment)
  })

  /**
   * Get my payments
   */
  static getMyPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Math.min(Number.parseInt(req.query.limit as string) || 10, 50)

    const { payments, total } = await PaymentsService.getUserPayments(req.user!.id, page, limit)

    return HttpResponse.paginated(res, payments, page, limit, total, "Your payments retrieved successfully")
  })

  /**
   * Get all payments (admin only)
   */
  static getAllPayments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Math.min(Number.parseInt(req.query.limit as string) || 10, 50)
    const status = req.query.status as string

    const { payments, total } = await PaymentsService.getAllPayments(page, limit, status)

    return HttpResponse.paginated(res, payments, page, limit, total, "All payments retrieved successfully")
  })

  /**
   * Get payment statistics
   */
  static getPaymentStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await PaymentsService.getPaymentStatistics(req.user!.id)

    return HttpResponse.success(res, "Payment statistics retrieved successfully", stats)
  })

  /**
   * Get all payment statistics (admin only)
   */
  static getAllPaymentStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await PaymentsService.getPaymentStatistics()

    return HttpResponse.success(res, "All payment statistics retrieved successfully", stats)
  })

  /**
   * Refund payment (admin only)
   */
  static refundPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { paymentId } = req.params
    const { reason } = req.body

    const result = await PaymentsService.refundPayment(paymentId, reason)

    return HttpResponse.success(res, result.message, result)
  })
}
