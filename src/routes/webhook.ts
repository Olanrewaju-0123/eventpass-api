import { Router } from "express"
import { PaymentsController } from "../modules/payments/payments.controller"
import { verifyPaystackWebhook } from "../middleware/webhook"

const router = Router()

/**
 * Paystack webhook endpoint
 */
router.post("/paystack", verifyPaystackWebhook, PaymentsController.handleWebhook)

export { router as webhookRoutes }
