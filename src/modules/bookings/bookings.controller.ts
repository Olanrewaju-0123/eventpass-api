import type { Request, Response } from "express"
import { body, validationResult } from "express-validator"
import { BookingsService } from "./bookings.service"
import { HttpResponse } from "../../utils/http"
import { asyncHandler } from "../../middleware/error"
import type { AuthenticatedRequest, CreateBookingData } from "../../types"

export class BookingsController {
  /**
   * Start booking validation rules
   */
  static startBookingValidation = [
    body("eventId").isUUID().withMessage("Valid event ID is required"),
    body("quantity").isInt({ min: 1, max: 10 }).withMessage("Quantity must be between 1 and 10"),
  ]

  /**
   * Complete booking validation rules
   */
  static completeBookingValidation = [
    body("paymentReference").trim().isLength({ min: 1 }).withMessage("Payment reference is required"),
  ]

  /**
   * Start booking process
   */
  static startBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return HttpResponse.validationError(res, "Validation failed", errors.mapped())
    }

    const bookingData: CreateBookingData = {
      eventId: req.body.eventId,
      quantity: Number.parseInt(req.body.quantity),
    }

    const result = await BookingsService.startBooking(bookingData, req.user!.id)

    return HttpResponse.success(res, result.message, result, 201)
  })

  /**
   * Complete booking process
   */
  static completeBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return HttpResponse.validationError(res, "Validation failed", errors.mapped())
    }

    const { bookingId } = req.params
    const { paymentReference } = req.body

    const booking = await BookingsService.completeBooking(bookingId, paymentReference)

    return HttpResponse.success(res, "Booking completed successfully", booking)
  })

  /**
   * Cancel booking
   */
  static cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bookingId } = req.params
    const { reason } = req.body

    const booking = await BookingsService.cancelBooking(bookingId, req.user!.id, reason)

    return HttpResponse.success(res, "Booking cancelled successfully", booking)
  })

  /**
   * Get booking by ID
   */
  static getBookingById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { bookingId } = req.params

    const booking = await BookingsService.getBookingById(bookingId, req.user!.id)

    return HttpResponse.success(res, "Booking retrieved successfully", booking)
  })

  /**
   * Get booking by reference (public endpoint for ticket verification)
   */
  static getBookingByReference = asyncHandler(async (req: Request, res: Response) => {
    const { bookingReference } = req.params

    const booking = await BookingsService.getBookingByReference(bookingReference)

    return HttpResponse.success(res, "Booking retrieved successfully", booking)
  })

  /**
   * Get my bookings
   */
  static getMyBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Math.min(Number.parseInt(req.query.limit as string) || 10, 50)
    const sortBy = (req.query.sortBy as string) || "createdAt"
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc"

    const filters = {
      status: req.query.status as string,
      eventId: req.query.eventId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    }

    const { bookings, total } = await BookingsService.getUserBookings(req.user!.id, filters, {
      page,
      limit,
      sortBy,
      sortOrder,
    })

    return HttpResponse.paginated(res, bookings, page, limit, total, "Your bookings retrieved successfully")
  })

  /**
   * Get all bookings (admin only)
   */
  static getAllBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Math.min(Number.parseInt(req.query.limit as string) || 10, 50)
    const sortBy = (req.query.sortBy as string) || "createdAt"
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc"

    const filters = {
      status: req.query.status as string,
      eventId: req.query.eventId as string,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    }

    const { bookings, total } = await BookingsService.getAllBookings(filters, {
      page,
      limit,
      sortBy,
      sortOrder,
    })

    return HttpResponse.paginated(res, bookings, page, limit, total, "All bookings retrieved successfully")
  })

  /**
   * Verify ticket
   */
  static verifyTicket = asyncHandler(async (req: Request, res: Response) => {
    const { bookingReference } = req.params

    const result = await BookingsService.verifyTicket(bookingReference)

    return HttpResponse.success(res, result.message, result)
  })

  /**
   * Get booking statistics
   */
  static getBookingStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await BookingsService.getBookingStatistics(req.user!.id)

    return HttpResponse.success(res, "Booking statistics retrieved successfully", stats)
  })

  /**
   * Get all booking statistics (admin only)
   */
  static getAllBookingStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await BookingsService.getBookingStatistics()

    return HttpResponse.success(res, "All booking statistics retrieved successfully", stats)
  })
}
