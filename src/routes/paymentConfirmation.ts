import { Router, Request, Response } from "express"
import { PaymentsService } from "../modules/payments/payments.service"
import { HttpResponse } from "../utils/http"
import { asyncHandler } from "../middleware/error"

const router = Router()

/**
 * Payment confirmation page data
 */
router.get(
  "/:paymentReference",
  asyncHandler(async (req: Request, res: Response) => {
    const { paymentReference } = req.params

    const payment = await PaymentsService.getPaymentByReference(paymentReference)

    const confirmationData = {
      payment: {
        reference: payment.paymentReference,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paidAt,
        currency: payment.currency,
      },
      booking: {
        reference: payment.booking.bookingReference,
        quantity: payment.booking.quantity,
        status: payment.booking.status,
      },
      event: {
        title: payment.booking.event.title,
        venue: payment.booking.event.venue,
        startDate: payment.booking.event.startDate,
        endDate: payment.booking.event.endDate,
      },
      user: {
        name: `${payment.booking.user.firstName} ${payment.booking.user.lastName}`,
        email: payment.booking.user.email,
      },
    }

    return HttpResponse.success(res, "Payment confirmation data retrieved successfully", confirmationData)
  }),
)

export { router as paymentConfirmationRoutes }
