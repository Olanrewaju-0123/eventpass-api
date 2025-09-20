import { emailService } from "./emailService";
import { PaymentsService } from "../modules/payments/payments.service";

export class PaymentConfirmationService {
  /**
   * Send payment confirmation
   */
  static async sendPaymentConfirmation(paymentReference: string) {
    try {
      const payment = await PaymentsService.getPaymentByReference(
        paymentReference
      );

      if (payment.status !== "SUCCESSFUL") {
        throw new Error("Payment is not successful");
      }

      await emailService.sendPaymentConfirmation(payment.booking.user.email, {
        paymentReference: payment.paymentReference,
        amount: Number(payment.amount),
        bookingReference: payment.booking.bookingReference,
        eventTitle: payment.booking.event.title,
      });

      return {
        success: true,
        payment,
        message: "Payment confirmation sent successfully",
      };
    } catch (error) {
      console.error("Payment confirmation error:", error);
      throw error;
    }
  }

  /**
   * Get payment confirmation data
   */
  static async getPaymentConfirmationData(paymentReference: string) {
    const payment = await PaymentsService.getPaymentByReference(
      paymentReference
    );

    return {
      payment: {
        reference: payment.paymentReference,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paidAt,
        currency: payment.currency,
        method: payment.paymentMethod,
      },
      booking: {
        reference: payment.booking.bookingReference,
        quantity: payment.booking.quantity,
        totalAmount: Number(payment.booking.totalAmount),
        status: payment.booking.status,
        qrCode: payment.booking.qrCode,
      },
      event: {
        id: payment.booking.event.id,
        title: payment.booking.event.title,
        venue: payment.booking.event.venue,
        startDate: payment.booking.event.startDate,
        endDate: payment.booking.event.endDate,
      },
      user: {
        name: `${payment.booking.user.firstName} ${payment.booking.user.lastName}`,
        email: payment.booking.user.email,
      },
    };
  }

  /**
   * Resend payment confirmation
   */
  static async resendPaymentConfirmation(paymentReference: string) {
    return this.sendPaymentConfirmation(paymentReference);
  }
}
