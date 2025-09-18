import cron, { ScheduledTask } from "node-cron";
import { cleanupExpiredBookings } from "./cleanup-expired-bookings";

/**
 * Booking scheduler for periodic tasks
 */
export class BookingScheduler {
  private static tasks: ScheduledTask[] = [];

  /**
   * Start all scheduled tasks
   */
  static start() {
    console.log("Starting booking scheduler...");

    // Cleanup expired bookings every 5 minutes
    const task = cron.schedule("*/5 * * * *", async () => {
      console.log("Running expired bookings cleanup...");
      await cleanupExpiredBookings();
    });

    this.tasks.push(task);
    console.log("Booking scheduler started successfully");
  }

  /**
   * Stop all scheduled tasks
   */
  static stop() {
    this.tasks.forEach((task) => task.destroy());
    this.tasks = [];
    console.log("Booking scheduler stopped");
  }
}

// Auto-start scheduler in production
if (process.env.NODE_ENV === "production") {
  BookingScheduler.start();
}
