import { BookingsService } from "../modules/bookings/bookings.service"
import { prisma } from "../config/database"

/**
 * Cleanup expired bookings
 * This script should be run periodically (e.g., every 5 minutes)
 */
export async function cleanupExpiredBookings() {
  try {
    console.log("Starting cleanup of expired bookings...")

    // Find all pending bookings older than 15 minutes
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        },
      },
    })

    console.log(`Found ${expiredBookings.length} expired bookings`)

    // Cancel each expired booking
    for (const booking of expiredBookings) {
      try {
        await BookingsService.cancelExpiredBooking(booking.id)
        console.log(`Cancelled expired booking: ${booking.bookingReference}`)
      } catch (error) {
        console.error(`Failed to cancel booking ${booking.id}:`, error)
      }
    }

    console.log("Cleanup completed successfully")
  } catch (error) {
    console.error("Cleanup failed:", error)
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupExpiredBookings()
    .then(() => {
      console.log("Cleanup job finished")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Cleanup job failed:", error)
      process.exit(1)
    })
}
