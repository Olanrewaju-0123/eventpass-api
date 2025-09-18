import axios from "axios";
import { prisma } from "../../config/database";
import { config } from "../../config/env";
import { CryptoUtils } from "../../utils/crypto";
import { BookingsService } from "../bookings/bookings.service";
import { emailService } from "../../services/emailService";
import type {
  PaystackInitializeData,
  PaystackVerifyResponse,
} from "../../types";
import { EventsService } from "../events/events.service";

export class PaymentsService {
  private static PAYSTACK_BASE_URL = "https://api.paystack.co";

  /**
   * Initialize payment with Paystack
   */
  static async initializePayment(bookingId: string, callbackUrl?: string) {
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        event: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status !== "PENDING") {
      throw new Error("Booking is not in pending status");
    }

    // Generate payment reference
    const paymentReference = CryptoUtils.generatePaymentReference();

    // Prepare Paystack initialization data
    const initData: PaystackInitializeData = {
      email: booking.user.email,
      amount: Math.round(Number(booking.totalAmount) * 100), // Convert to kobo
      reference: paymentReference,
      callback_url: callbackUrl || `${config.FRONTEND_URL}/payment/callback`,
      metadata: {
        bookingId: booking.id,
        eventId: booking.eventId,
        userId: booking.userId,
        bookingReference: booking.bookingReference,
        eventTitle: booking.event.title,
        quantity: booking.quantity,
      },
    };

    try {
      // Initialize payment with Paystack
      const response = await axios.post(
        `${this.PAYSTACK_BASE_URL}/transaction/initialize`,
        initData,
        {
          headers: {
            Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.status) {
        throw new Error(
          response.data.message || "Payment initialization failed"
        );
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: "NGN",
          paymentMethod: "paystack",
          paymentReference,
          paystackReference: response.data.data.reference,
          status: "PENDING",
        },
      });

      return {
        payment,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: paymentReference,
      };
    } catch (error: any) {
      console.error(
        "Paystack initialization error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to initialize payment");
    }
  }

  /**
   * Verify payment with Paystack
   */
  static async verifyPayment(paymentReference: string) {
    try {
      const response = await axios.get(
        `${this.PAYSTACK_BASE_URL}/transaction/verify/${paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Payment verification failed");
      }

      const paymentData: PaystackVerifyResponse = response.data;

      // Get payment record
      const payment = await prisma.payment.findUnique({
        where: { paymentReference },
        include: {
          booking: {
            include: {
              user: true,
              event: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error("Payment record not found");
      }

      // Check if payment was successful
      if (paymentData.data.status === "success") {
        // Update payment status
        const updatedPayment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESSFUL",
            paidAt: new Date(paymentData.data.paid_at),
            paystackReference: paymentData.data.reference,
          },
          include: {
            booking: {
              include: {
                user: true,
                event: true,
              },
            },
          },
        });

        // Complete the booking
        const completedBooking = await BookingsService.completeBooking(
          payment.bookingId,
          paymentReference
        );

        // Send payment confirmation email
        await emailService.sendPaymentConfirmation(
          updatedPayment.booking.user.email,
          {
            paymentReference,
            amount: Number(updatedPayment.amount),
            bookingReference: updatedPayment.booking.bookingReference,
            eventTitle: updatedPayment.booking.event.title,
          }
        );

        return {
          payment: updatedPayment,
          booking: completedBooking,
          status: "success",
          message: "Payment verified and booking completed successfully",
        };
      } else {
        // Update payment status to failed
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
          },
        });

        return {
          payment,
          status: "failed",
          message: "Payment verification failed",
        };
      }
    } catch (error: any) {
      console.error(
        "Payment verification error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to verify payment");
    }
  }

  /**
   * Handle Paystack webhook
   */
  static async handleWebhook(event: any) {
    const { event: eventType, data } = event;

    try {
      switch (eventType) {
        case "charge.success":
          // Check if this is an event creation payment
          if (data.metadata && data.metadata.type === "event_creation") {
            await this.handleEventCreationPaymentSuccess(data);
          } else {
            await this.handleSuccessfulCharge(data);
          }
          break;

        case "charge.failed":
          await this.handleFailedCharge(data);
          break;

        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }
    } catch (error) {
      console.error("Webhook handling error:", error);
      throw error;
    }
  }

  /**
   * Handle successful charge webhook
   */
  private static async handleSuccessfulCharge(data: any) {
    const paymentReference = data.reference;

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { paymentReference },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });

    if (!payment) {
      console.error(`Payment not found for reference: ${paymentReference}`);
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      console.log(`Payment already processed: ${paymentReference}`);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESSFUL",
        paidAt: new Date(data.paid_at),
        paystackReference: data.reference,
      },
    });

    // Complete booking if not already completed
    if (payment.booking.status === "PENDING") {
      await BookingsService.completeBooking(
        payment.bookingId,
        paymentReference
      );
    }

    console.log(`Payment processed successfully: ${paymentReference}`);
  }

  /**
   * Handle failed charge webhook
   */
  private static async handleFailedCharge(data: any) {
    const paymentReference = data.reference;

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { paymentReference },
    });

    if (!payment) {
      console.error(`Payment not found for reference: ${paymentReference}`);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
      },
    });

    console.log(`Payment failed: ${paymentReference}`);
  }

  /**
   * Get payment by reference
   */
  static async getPaymentByReference(paymentReference: string) {
    const payment = await prisma.payment.findUnique({
      where: { paymentReference },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
                venue: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  }

  /**
   * Get user payments
   */
  static async getUserPayments(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          booking: {
            userId,
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          booking: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  venue: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({
        where: {
          booking: {
            userId,
          },
        },
      }),
    ]);

    return { payments, total };
  }

  /**
   * Get all payments (admin only)
   */
  static async getAllPayments(
    page = 1,
    limit = 10,
    status?: "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED"
  ) {
    const skip = (page - 1) * limit;
    const where = status ? { status: { equals: status } } : undefined;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          booking: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              event: {
                select: {
                  id: true,
                  title: true,
                  venue: true,
                  startDate: true,
                  endDate: true,
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStatistics(userId?: string) {
    const where = userId
      ? {
          booking: {
            userId,
          },
        }
      : {};

    const stats = await prisma.payment.groupBy({
      by: ["status"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    const totalPayments = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const totalAmount = stats.reduce(
      (sum, stat) => sum + Number(stat._sum.amount || 0),
      0
    );

    return {
      totalPayments,
      totalAmount,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = {
          count: stat._count.id,
          amount: Number(stat._sum.amount || 0),
        };
        return acc;
      }, {} as Record<string, any>),
    };
  }

  /**
   * Refund payment (for cancelled bookings)
   */
  static async refundPayment(paymentId: string, reason = "Booking cancelled") {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            user: true,
            event: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "SUCCESSFUL") {
      throw new Error("Cannot refund unsuccessful payment");
    }

    try {
      // Initiate refund with Paystack
      const response = await axios.post(
        `${this.PAYSTACK_BASE_URL}/refund`,
        {
          transaction: payment.paystackReference,
          amount: Math.round(Number(payment.amount) * 100), // Convert to kobo
        },
        {
          headers: {
            Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.status) {
        throw new Error(response.data.message || "Refund initiation failed");
      }

      // Update payment status
      const refundedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "REFUNDED",
        },
        include: {
          booking: {
            include: {
              user: true,
              event: true,
            },
          },
        },
      });

      return {
        payment: refundedPayment,
        refundData: response.data.data,
        message: "Refund initiated successfully",
      };
    } catch (error: any) {
      console.error("Refund error:", error.response?.data || error.message);
      throw new Error("Failed to initiate refund");
    }
  }

  /**
   * Initialize event creation payment
   */
  static async initializeEventCreationPayment(data: {
    amount: number;
    email: string;
    currency: string;
    reference: string;
    provider: "paystack" | "opay";
    metadata: any;
    callback_url?: string;
    userId: string;
  }) {
    console.log(
      "Payment service called with data:",
      JSON.stringify(data, null, 2)
    );

    const {
      amount,
      email,
      currency,
      reference,
      provider,
      metadata,
      callback_url,
      userId,
    } = data;

    // For event creation payments, we'll store the data in metadata and use a different approach
    // Since the existing Payment model is tied to bookings, we'll create a temporary record
    // and handle the event creation in the webhook

    try {
      let paymentResult;

      if (provider === "paystack") {
        // Initialize Paystack payment
        const initData: PaystackInitializeData = {
          email: email,
          amount: Math.round(amount * 100), // Convert to kobo
          reference: reference,
          callback_url:
            callback_url ||
            `${config.FRONTEND_URL}/event-created-success?ref=${reference}`,
          metadata: {
            type: "event_creation",
            eventData: JSON.stringify(metadata.eventData),
            userId: userId,
            reference: reference,
          },
        };

        const response = await axios.post(
          `${this.PAYSTACK_BASE_URL}/transaction/initialize`,
          initData,
          {
            headers: {
              Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        paymentResult = response.data;
      } else if (provider === "opay") {
        // Initialize OPay payment
        const opayData = {
          amount: amount,
          currency: currency,
          reference: reference,
          callbackUrl:
            callback_url ||
            `${config.FRONTEND_URL}/event-created-success?ref=${reference}`,
          metadata: {
            type: "event_creation",
            eventData: JSON.stringify(metadata.eventData),
            userId: userId,
            reference: reference,
          },
        };

        // Use OPay service to initialize payment
        try {
          const { OpayService } = await import("../../services/opayService");
          paymentResult = await OpayService.initializeTransaction(opayData);
        } catch (opayError: any) {
          console.error("OPay initialization error:", opayError);
          throw new Error(
            `OPay payment initialization failed: ${opayError.message}`
          );
        }
      } else {
        throw new Error("Unsupported payment provider");
      }

      return {
        reference: reference,
        authorization_url:
          paymentResult.data?.authorization_url ||
          paymentResult.authorization_url,
        access_code:
          paymentResult.data?.access_code || paymentResult.access_code,
        provider: provider,
      };
    } catch (error: any) {
      throw new Error(`Payment initialization failed: ${error.message}`);
    }
  }

  /**
   * Handle event creation payment success
   */
  static async handleEventCreationPaymentSuccess(data: any) {
    const { reference, metadata } = data;

    if (!metadata || !metadata.eventData) {
      throw new Error("Event data not found in payment metadata");
    }

    try {
      // Create the event
      const eventData = JSON.parse(metadata.eventData);
      const event = await EventsService.createEvent(
        eventData,
        metadata.userId,
        reference
      );

      // Send confirmation email
      try {
        const user = await prisma.user.findUnique({
          where: { id: metadata.userId },
        });

        if (user) {
          await emailService.sendEventCreationConfirmation(
            user.email,
            event.title,
            event.id
          );
        }
      } catch (error) {
        console.error(
          "Failed to send event creation confirmation email:",
          error
        );
      }

      return {
        message: "Event created successfully",
        event: event,
        reference: reference,
      };
    } catch (error: any) {
      console.error("Event creation error:", error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }
}
