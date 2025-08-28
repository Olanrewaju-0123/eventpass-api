import { prisma } from "../../config/database"
import { CacheService } from "../../services/cache"
import { QRService } from "../../services/qrService"
import type { CreateEventData, UpdateEventData, EventFilters, PaginationOptions } from "../../types"


interface Stat {
  _count: { id: number }
  _sum: { quantity: number, totalAmount: number }
  status: string
}
export class EventsService {
  private static CACHE_PREFIX = "event:"
  private static CACHE_TTL = 1800 // 30 minutes

  /**
   * Create new event
   */
  static async createEvent(eventData: CreateEventData, createdById: string) {
    const event = await prisma.event.create({
      data: {
        ...eventData,
        available: eventData.capacity, // Initially all tickets are available
        createdById,
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
      },
    })

    // Cache the event
    await CacheService.set(`${this.CACHE_PREFIX}${event.id}`, event, { ttl: this.CACHE_TTL })

    // Clear events list cache
    await this.clearEventsListCache()

    return event
  }

  /**
   * Get event by ID
   */
  static async getEventById(eventId: string) {
    // Try cache first
    const cachedEvent = await CacheService.get(`${this.CACHE_PREFIX}${eventId}`)
    if (cachedEvent) {
      return cachedEvent
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
    })

    if (!event) {
      throw new Error("Event not found")
    }

    // Cache the event
    await CacheService.set(`${this.CACHE_PREFIX}${event.id}`, event, { ttl: this.CACHE_TTL })

    return event
  }

  /**
   * Get all events with filters and pagination
   */
  static async getEvents(filters: EventFilters = {}, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (filters.category) {
      where.category = filters.category
    }

    if (filters.status) {
      where.status = filters.status
    } else {
      where.status = "ACTIVE" // Default to active events
    }

    if (filters.venue) {
      where.venue = {
        contains: filters.venue,
        mode: "insensitive",
      }
    }

    if (filters.startDate || filters.endDate) {
      where.startDate = {}
      if (filters.startDate) {
        where.startDate.gte = filters.startDate
      }
      if (filters.endDate) {
        where.startDate.lte = filters.endDate
      }
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice
      }
    }

    // Try cache for this specific query
    const cacheKey = `events_list:${JSON.stringify({ where, skip, limit, sortBy, sortOrder })}`
    const cachedResult = await CacheService.get(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
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
      }),
      prisma.event.count({ where }),
    ])

    const result = { events, total }

    // Cache the result
    await CacheService.set(cacheKey, result, { ttl: this.CACHE_TTL })

    return result
  }

  /**
   * Update event
   */
  static async updateEvent(eventId: string, updateData: UpdateEventData, userId: string) {
    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!existingEvent) {
      throw new Error("Event not found")
    }

    // Check if user is the creator or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (existingEvent.createdById !== userId && user.role !== "ADMIN") {
      throw new Error("Unauthorized to update this event")
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Update cache
    await CacheService.set(`${this.CACHE_PREFIX}${eventId}`, updatedEvent, { ttl: this.CACHE_TTL })

    // Clear events list cache
    await this.clearEventsListCache()

    return updatedEvent
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId: string, userId: string) {
    // Check if event exists and user has permission
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        bookings: true,
      },
    })

    if (!existingEvent) {
      throw new Error("Event not found")
    }

    // Check if user is the creator or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    if (existingEvent.createdById !== userId && user.role !== "ADMIN") {
      throw new Error("Unauthorized to delete this event")
    }

    // Check if there are confirmed bookings
    const confirmedBookings = existingEvent.bookings.filter((booking:any) => booking.status === "CONFIRMED")
    if (confirmedBookings.length > 0) {
      throw new Error("Cannot delete event with confirmed bookings")
    }

    // Delete the event
    await prisma.event.delete({
      where: { id: eventId },
    })

    // Remove from cache
    await CacheService.delete(`${this.CACHE_PREFIX}${eventId}`)

    // Clear events list cache
    await this.clearEventsListCache()

    return true
  }

  /**
   * Get events by creator
   */
  static async getEventsByCreator(creatorId: string, pagination: PaginationOptions = {}) {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = pagination
    const skip = (page - 1) * limit

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { createdById: creatorId },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
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
      }),
      prisma.event.count({
        where: { createdById: creatorId },
      }),
    ])

    return { events, total }
  }

  /**
   * Update event availability
   */
  static async updateEventAvailability(eventId: string, quantityBooked: number) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error("Event not found")
    }

    if (event.available < quantityBooked) {
      throw new Error("Not enough tickets available")
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        available: event.available - quantityBooked,
      },
    })

    // Update cache
    await CacheService.set(`${this.CACHE_PREFIX}${eventId}`, updatedEvent, { ttl: this.CACHE_TTL })

    return updatedEvent
  }

  /**
   * Restore event availability (for cancelled bookings)
   */
  static async restoreEventAvailability(eventId: string, quantityToRestore: number) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new Error("Event not found")
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        available: Math.min(event.available + quantityToRestore, event.capacity),
      },
    })

    // Update cache
    await CacheService.set(`${this.CACHE_PREFIX}${eventId}`, updatedEvent, { ttl: this.CACHE_TTL })

    return updatedEvent
  }

  /**
   * Generate event promotion QR code
   */
  static async generateEventPromotionQR(eventId: string) {
    const event = await this.getEventById(eventId)
    const qrCode = await QRService.generateEventPromotionQR(eventId)

    return {
      event,
      qrCode,
    }
  }

  /**
   * Get event categories
   */
  static async getEventCategories() {
    const cacheKey = "event_categories"
    const cachedCategories = await CacheService.get(cacheKey)
    if (cachedCategories) {
      return cachedCategories
    }

    const categories = await prisma.event.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      where: {
        status: "ACTIVE",
      },
    })

    const categoryList = categories.map((c:{ category: string }) => c.category).filter(Boolean)

    // Cache for 1 hour
    await CacheService.set(cacheKey, categoryList, { ttl: 3600 })

    return categoryList
  }

  /**
   * Get event statistics
   */
  static async getEventStatistics(eventId: string) {
    const event = await this.getEventById(eventId)

    const stats = await prisma.booking.groupBy({
      by: ["status"],
      where: {
        eventId,
      },
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
    })

    const totalBookings = stats.reduce((sum: number, stat: Stat) => sum + stat._count.id, 0)
    const totalTicketsSold = stats.reduce((sum: number, stat: Stat) => sum + (stat._sum.quantity || 0), 0)
    const totalRevenue = stats.reduce((sum: number, stat: Stat) => sum + Number(stat._sum.totalAmount || 0), 0)

    const confirmedBookings = stats.find((s: Stat) => s.status === "CONFIRMED")
    const pendingBookings = stats.find((s: Stat) => s.status === "PENDING")
    const cancelledBookings = stats.find((s: Stat) => s.status === "CANCELLED")

    return {
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
        available: event.available,
        price: Number(event.price),
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings?._count.id || 0,
        pending: pendingBookings?._count.id || 0,
        cancelled: cancelledBookings?._count.id || 0,
      },
      tickets: {
        sold: totalTicketsSold,
        available: event.available,
        capacity: event.capacity,
        soldPercentage: ((totalTicketsSold / event.capacity) * 100).toFixed(2),
      },
      revenue: {
        total: totalRevenue,
        confirmed: Number(confirmedBookings?._sum.totalAmount || 0),
        pending: Number(pendingBookings?._sum.totalAmount || 0),
      },
    }
  }

  /**
   * Clear events list cache
   */
  private static async clearEventsListCache() {
    const keys = await CacheService.getKeys("events_list:*")
    if (keys.length > 0) {
      await CacheService.deleteMany(keys)
    }
  }
}
