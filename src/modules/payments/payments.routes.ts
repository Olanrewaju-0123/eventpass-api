import { Router } from "express"
import { PaymentsController } from "./payments.controller"
import { authenticateToken, requireAdmin } from "../../middleware/auth"
import { verifyPaystackWebhook } from "../../middleware/webhook"

const router = Router()

// Public routes
router.get("/reference/:paymentReference", PaymentsController.getPaymentByReference)
router.get("/verify/:paymentReference", PaymentsController.verifyPayment)

// Webhook route (with signature verification)
router.post("/webhook", verifyPaystackWebhook, PaymentsController.handleWebhook)

// Protected routes - require authentication
router.use(authenticateToken)

// User routes
router.post("/initialize", PaymentsController.initializePaymentValidation, PaymentsController.initializePayment)
router.get("/my/payments", PaymentsController.getMyPayments)
router.get("/my/statistics", PaymentsController.getPaymentStatistics)

// Admin routes
router.get("/admin/all", requireAdmin, PaymentsController.getAllPayments)
router.get("/admin/statistics", requireAdmin, PaymentsController.getAllPaymentStatistics)
router.post("/admin/:paymentId/refund", requireAdmin, PaymentsController.refundPayment)

export { router as paymentRoutes }
