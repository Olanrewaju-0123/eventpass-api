import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { EventsService } from "./events.service";
import { HttpResponse } from "../../utils/http";
import { asyncHandler } from "../../middleware/error";
import type {
  AuthenticatedRequest,
  CreateEventData,
  UpdateEventData,
} from "../../types";
import { prisma } from "../../config/database";

export class EventsController {
  /**
   * Create event validation rules
   */
  static createEventValidation = [
    body("title")
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("venue")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Venue must be at least 3 characters"),
    body("address")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Address must be at least 5 characters"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("category")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Category is required"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("Valid image URL is required"),
  ];

  /**
   * Update event validation rules
   */
  static updateEventValidation = [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage("Title must be between 3 and 200 characters"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("venue")
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage("Venue must be at least 3 characters"),
    body("address")
      .optional()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Address must be at least 5 characters"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Valid start date is required"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("Valid end date is required"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("capacity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("category")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Category is required"),
    body("imageUrl")
      .optional()
      .isURL()
      .withMessage("Valid image URL is required"),
  ];

  /**
   * Create event
   */
  static createEvent = asyncHandler(
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

      // Validate dates
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);

      if (startDate <= new Date()) {
        return HttpResponse.badRequest(res, "Start date must be in the future");
      }

      if (endDate <= startDate) {
        return HttpResponse.badRequest(
          res,
          "End date must be after start date"
        );
      }

      const eventData: CreateEventData = {
        title: req.body.title,
        description: req.body.description,
        venue: req.body.venue,
        address: req.body.address,
        startDate,
        endDate,
        price: Number.parseFloat(req.body.price),
        capacity: Number.parseInt(req.body.capacity),
        category: req.body.category,
        imageUrl: req.body.imageUrl,
      };

      const event = await EventsService.createEvent(eventData, req.user!.id);

      return HttpResponse.success(
        res,
        "Event created successfully",
        event,
        201
      );
    }
  );

  /**
   * Get event by creation reference
   */
  static getEventByCreationReference = asyncHandler(
    async (req: Request, res: Response) => {
      const { reference } = req.params;

      // Find event by creation reference
      const event = await prisma.event.findFirst({
        where: {
          creationReference: reference,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              bookings: {
                where: {
                  status: "CONFIRMED",
                },
              },
            },
          },
        },
      });

      if (!event) {
        return HttpResponse.notFound(res, "Event not found");
      }

      // Generate QR code for the event
      const { QRService } = await import("../../services/qrService");
      const qrCode = await QRService.generateEventPromotionQR(event.id);

      // Calculate statistics
      const totalBookings = event._count.bookings;
      const totalRevenue = totalBookings * Number(event.price);
      const availableTickets = event.available;
      const soldPercentage =
        ((event.capacity - availableTickets) / event.capacity) * 100;

      const eventData = {
        id: event.id,
        title: event.title,
        description: event.description,
        venue: event.venue,
        address: event.address,
        startDate: event.startDate,
        endDate: event.endDate,
        price: Number(event.price),
        capacity: event.capacity,
        category: event.category,
        imageUrl: event.imageUrl,
        bookingUrl: `${process.env.FRONTEND_URL}/events/${event.id}`,
        qrCode: qrCode,
        statistics: {
          totalBookings,
          totalRevenue,
          availableTickets,
          soldPercentage: Math.round(soldPercentage * 100) / 100,
        },
      };

      return HttpResponse.success(
        res,
        "Event retrieved successfully",
        eventData
      );
    }
  );

  /**
   * Get all events
   */
  static getEvents = asyncHandler(async (req: Request, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Math.min(
      Number.parseInt(req.query.limit as string) || 10,
      50
    ); // Max 50 per page
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const filters = {
      category: req.query.category as string,
      venue: req.query.venue as string,
      status: req.query.status as string,
      startDate: req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined,
      endDate: req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined,
      minPrice: req.query.minPrice
        ? Number.parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? Number.parseFloat(req.query.maxPrice as string)
        : undefined,
    };

    const { events, total } = await EventsService.getEvents(filters, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return HttpResponse.paginated(
      res,
      events,
      page,
      limit,
      total,
      "Events retrieved successfully"
    );
  });

  /**
   * Get event by ID
   */
  static getEventById = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const event = await EventsService.getEventById(eventId);

    return HttpResponse.success(res, "Event retrieved successfully", event);
  });

  /**
   * Update event
   */
  static updateEvent = asyncHandler(
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

      const { eventId } = req.params;

      // Validate dates if provided
      if (req.body.startDate && req.body.endDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);

        if (endDate <= startDate) {
          return HttpResponse.badRequest(
            res,
            "End date must be after start date"
          );
        }
      }

      const updateData: UpdateEventData = {};

      // Only include fields that are provided
      const fields = [
        "title",
        "description",
        "venue",
        "address",
        "category",
        "imageUrl",
      ];
      for (const field of fields) {
        if (req.body[field] !== undefined) {
          updateData[field as keyof UpdateEventData] = req.body[field];
        }
      }

      if (req.body.startDate)
        updateData.startDate = new Date(req.body.startDate);
      if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
      if (req.body.price !== undefined)
        updateData.price = Number.parseFloat(req.body.price);
      if (req.body.capacity !== undefined)
        updateData.capacity = Number.parseInt(req.body.capacity);

      const event = await EventsService.updateEvent(
        eventId,
        updateData,
        req.user!.id
      );

      return HttpResponse.success(res, "Event updated successfully", event);
    }
  );

  /**
   * Delete event
   */
  static deleteEvent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { eventId } = req.params;

      await EventsService.deleteEvent(eventId, req.user!.id);

      return HttpResponse.success(res, "Event deleted successfully");
    }
  );

  /**
   * Get my events
   */
  static getMyEvents = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const page = Number.parseInt(req.query.page as string) || 1;
      const limit = Math.min(
        Number.parseInt(req.query.limit as string) || 10,
        50
      );
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      const { events, total } = await EventsService.getEventsByCreator(
        req.user!.id,
        {
          page,
          limit,
          sortBy,
          sortOrder,
        }
      );

      return HttpResponse.paginated(
        res,
        events,
        page,
        limit,
        total,
        "Your events retrieved successfully"
      );
    }
  );

  /**
   * Generate event promotion QR code
   */
  static generatePromotionQR = asyncHandler(
    async (req: Request, res: Response) => {
      const { eventId } = req.params;

      const result = await EventsService.generateEventPromotionQR(eventId);

      return HttpResponse.success(
        res,
        "Event promotion QR code generated successfully",
        result
      );
    }
  );

  /**
   * Get event categories
   */
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await EventsService.getEventCategories();

    return HttpResponse.success(
      res,
      "Event categories retrieved successfully",
      categories
    );
  });

  /**
   * Get event statistics
   */
  static getEventStatistics = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { eventId } = req.params;

      const stats = await EventsService.getEventStatistics(eventId);

      return HttpResponse.success(
        res,
        "Event statistics retrieved successfully",
        stats
      );
    }
  );
}
