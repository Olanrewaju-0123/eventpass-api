import { prisma } from "../../config/database";
import { CacheService } from "../../services/cache";
import { EventsService } from "../events/events.service";
import { QRService } from "../../services/qrService";
import { emailService } from "../../services/emailService";
import { CryptoUtils } from "../../utils/crypto";
import type {
  CreateBookingData,
  BookingWithDetails,
  BookingFilters,
  PaginationOptions,
} from "../../types";
import { Prisma } from "@prisma/client";

interface Stat {
  _count: { id: number };
  _sum: { quantity: number | null; totalAmount: any };
  status: string;
}
export class BookingsService {
  private static CACHE_PREFIX = "booking:";
  private static CACHE_TTL = 1800; // 30 minutes
  private static BOOKING_HOLD_TIME = 900; // 15 minutes to complete booking

  /**
   * Start booking process - creates pending booking and holds tickets
   */
  static async startBooking(bookingData: CreateBookingData, userId: string) {
    const { eventId, quantity } = bookingData;

    // Get event details
    const event = await EventsService.getEventById(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    if ((event as any).status !== "ACTIVE") {
      throw new Error("Event is not available for booking");
    }

    if ((event as any).startDate <= new Date()) {
      throw new Error("Cannot book tickets for past events");
    }

    if ((event as any).available < quantity) {
      throw new Error(`Only ${(event as any).available} tickets available`);
    }

    // Calculate total amount
    const totalAmount = Number((event as any).price) * quantity;

    // Generate booking reference
    const bookingReference = CryptoUtils.generateBookingReference();

    // Start database transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create pending booking
      const newBooking = await tx.booking.create({
        data: {
          userId,
          eventId,
          quantity,
          totalAmount,
          status: "PENDING",
          bookingReference,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              venue: true,
              address: true,
              startDate: true,
              endDate: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update event availability (hold tickets)
      await tx.event.update({
        where: { id: eventId },
        data: {
          available: {
            decrement: quantity,
          },
        },
      });

      return newBooking;
    });

    // Cache booking with expiration
    await CacheService.set(`${this.CACHE_PREFIX}${booking.id}`, booking, {
      ttl: this.BOOKING_HOLD_TIME,
    });

    // Set booking expiration timer
    await CacheService.set(`booking_hold:${booking.id}`, true, {
      ttl: this.BOOKING_HOLD_TIME,
    });

    return {
      booking,
      holdExpiresAt: new Date(Date.now() + this.BOOKING_HOLD_TIME * 1000),
      message:
        "Booking started successfully. Complete payment within 15 minutes.",
    };
  }

  /**
   * Complete booking process - confirms booking after successful payment
   */
  static async completeBooking(bookingId: string, paymentReference: string) {
    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            address: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Booking is not in pending status");
    }

    // Check if booking hold has expired
    const holdExists = await CacheService.exists(`booking_hold:${bookingId}`);
    if (!holdExists) {
      // Restore event availability and cancel booking
      await this.cancelExpiredBooking(bookingId);
      throw new Error("Booking has expired. Please start a new booking.");
    }

    // Generate QR code for the ticket
    const qrData = {
      bookingId: booking.id,
      eventId: booking.eventId,
      userId: booking.userId,
      bookingReference: booking.bookingReference,
    };

    const qrCode = await QRService.generateBookingQR(qrData);
    const qrCodeBuffer = await QRService.generateBookingQRBuffer(qrData);

    // Update booking status
    const confirmedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        paymentReference,
        qrCode,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            address: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Clear booking hold
    await CacheService.delete(`booking_hold:${bookingId}`);

    // Update cache
    await CacheService.set(
      `${this.CACHE_PREFIX}${bookingId}`,
      confirmedBooking,
      {
        ttl: this.CACHE_TTL,
      }
    );

    // Send confirmation email with QR code
    await emailService.sendBookingConfirmation(
      confirmedBooking.user.email,
      {
        bookingReference: confirmedBooking.bookingReference,
        eventTitle: confirmedBooking.event.title,
        eventDate: confirmedBooking.event.startDate.toISOString(),
        eventVenue: confirmedBooking.event.venue,
        quantity: confirmedBooking.quantity,
        totalAmount: Number(confirmedBooking.totalAmount),
      },
      qrCodeBuffer
    );

    return confirmedBooking;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(
    bookingId: string,
    userId: string,
    reason = "Cancelled by user"
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        user: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled");
    }

    if (booking.status === "COMPLETED") {
      throw new Error("Cannot cancel completed booking");
    }

    // Start transaction
    const cancelledBooking = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Update booking status
        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CANCELLED",
          },
          include: {
            event: true,
            user: true,
          },
        });

        // Restore event availability
        await tx.event.update({
          where: { id: booking.eventId },
          data: {
            available: {
              increment: booking.quantity,
            },
          },
        });

        return updated;
      }
    );

    // Clear cache
    await CacheService.delete(`${this.CACHE_PREFIX}${bookingId}`);
    await CacheService.delete(`booking_hold:${bookingId}`);

    return cancelledBooking;
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(
    bookingId: string,
    userId?: string
  ): Promise<BookingWithDetails> {
    // Try cache first
    const cachedBooking = await CacheService.get<BookingWithDetails>(
      `${this.CACHE_PREFIX}${bookingId}`
    );
    if (cachedBooking) {
      return cachedBooking;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            address: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check authorization if userId is provided
    if (userId && booking.userId !== userId) {
      throw new Error("Unauthorized to view this booking");
    }

    // Cache the booking
    await CacheService.set(`${this.CACHE_PREFIX}${bookingId}`, booking, {
      ttl: this.CACHE_TTL,
    });

    return {
      ...booking,
      totalAmount: Number(booking.totalAmount),
      event: {
        ...booking.event,
        price: Number(booking.event.price),
      },
    } as BookingWithDetails;
  }

  /**
   * Get booking by reference
   */
  static async getBookingByReference(
    bookingReference: string
  ): Promise<BookingWithDetails> {
    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            address: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return {
      ...booking,
      totalAmount: Number(booking.totalAmount),
      event: {
        ...booking.event,
        price: Number(booking.event.price),
      },
    } as BookingWithDetails;
  }

  /**
   * Get user bookings
   */
  static async getUserBookings(
    userId: string,
    filters: BookingFilters = {},
    pagination: PaginationOptions = {}
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              venue: true,
              address: true,
              startDate: true,
              endDate: true,
              price: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total };
  }

  /**
   * Get all bookings (admin only)
   */
  static async getAllBookings(
    filters: BookingFilters = {},
    pagination: PaginationOptions = {}
  ) {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              venue: true,
              address: true,
              startDate: true,
              endDate: true,
              price: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return { bookings, total };
  }

  /**
   * Verify ticket QR code
   */
  static async verifyTicket(bookingReference: string) {
    const booking = await this.getBookingByReference(bookingReference);

    if (booking.status !== "CONFIRMED") {
      throw new Error("Invalid ticket - booking not confirmed");
    }

    // Check if event has started
    const now = new Date();
    const eventStart = new Date(booking.event.startDate);
    const eventEnd = new Date(booking.event.endDate);

    if (now < eventStart) {
      return {
        valid: true,
        status: "EARLY",
        message: "Ticket is valid but event hasn't started yet",
        booking,
      };
    }

    if (now > eventEnd) {
      return {
        valid: false,
        status: "EXPIRED",
        message: "Event has ended",
        booking,
      };
    }

    // Mark as completed if not already
    if (booking.status !== ("COMPLETED" as any)) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" },
      });
    }

    return {
      valid: true,
      status: "VALID",
      message: "Ticket verified successfully",
      booking,
    };
  }

  /**
   * Cancel expired bookings (cleanup job)
   */
  static async cancelExpiredBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status !== "PENDING") {
      return;
    }

    // Start transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Cancel booking
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      // Restore event availability
      await tx.event.update({
        where: { id: booking.eventId },
        data: {
          available: {
            increment: booking.quantity,
          },
        },
      });
    });

    // Clear cache
    await CacheService.delete(`${this.CACHE_PREFIX}${bookingId}`);
    await CacheService.delete(`booking_hold:${bookingId}`);
  }

  /**
   * Get booking statistics
   */
  static async getBookingStatistics(userId?: string) {
    const where = userId ? { userId } : {};

    const stats = await prisma.booking.groupBy({
      by: ["status"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
    });

    const totalBookings = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const totalTickets = stats.reduce(
      (sum, stat) => sum + (stat._sum.quantity || 0),
      0
    );
    const totalAmount = stats.reduce(
      (sum, stat) => sum + Number(stat._sum.totalAmount || 0),
      0
    );

    return {
      totalBookings,
      totalTickets,
      totalAmount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = {
          count: stat._count.id,
          tickets: stat._sum.quantity || 0,
          amount: Number(stat._sum.totalAmount || 0),
        };
        return acc;
      }, {} as Record<string, any>),
    };
  }
}
