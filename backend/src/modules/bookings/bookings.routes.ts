import { Router } from "express"
import { BookingsController } from "./bookings.controller"
import { authenticateToken, requireAdmin } from "../../middleware/auth"

const router = Router()

// Public routes
router.get("/reference/:bookingReference", BookingsController.getBookingByReference)
router.get("/verify/:bookingReference", BookingsController.verifyTicket)

// Protected routes - require authentication
router.use(authenticateToken)

// User routes
router.post("/start", BookingsController.startBookingValidation, BookingsController.startBooking)
router.post("/:bookingId/complete", BookingsController.completeBookingValidation, BookingsController.completeBooking)
router.post("/:bookingId/cancel", BookingsController.cancelBooking)
router.get("/my/bookings", BookingsController.getMyBookings)
router.get("/my/statistics", BookingsController.getBookingStatistics)
router.get("/:bookingId", BookingsController.getBookingById)

// Admin routes
router.get("/admin/all", requireAdmin, BookingsController.getAllBookings)
router.get("/admin/statistics", requireAdmin, BookingsController.getAllBookingStatistics)

export { router as bookingRoutes }
