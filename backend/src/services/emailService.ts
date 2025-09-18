import nodemailer from "nodemailer";
import { config } from "../config/env";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject: "Welcome to EventPass!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to EventPass, ${firstName}!</h2>
          <p>Thank you for joining EventPass. You can now discover and book amazing events.</p>
          <p>Start exploring events and book your tickets today!</p>
          <p>Best regards,<br>The EventPass Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("sendWelcomeEmail failed:", error);
      // swallow in dev to avoid breaking core flows
    }
  }

  async sendBookingConfirmation(
    to: string,
    bookingDetails: {
      bookingReference: string;
      eventTitle: string;
      eventDate: string;
      eventVenue: string;
      quantity: number;
      totalAmount: number;
    },
    qrCodeBuffer?: Buffer
  ): Promise<void> {
    const attachments = qrCodeBuffer
      ? [
          {
            filename: "ticket-qr.png",
            content: qrCodeBuffer,
            contentType: "image/png",
          },
        ]
      : [];

    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject: `Booking Confirmed - ${bookingDetails.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Booking Confirmed!</h2>
          <p><strong>Booking Reference:</strong> ${
            bookingDetails.bookingReference
          }</p>
          <p><strong>Event:</strong> ${bookingDetails.eventTitle}</p>
          <p><strong>Date:</strong> ${new Date(
            bookingDetails.eventDate
          ).toLocaleDateString()}</p>
          <p><strong>Venue:</strong> ${bookingDetails.eventVenue}</p>
          <p><strong>Quantity:</strong> ${bookingDetails.quantity} ticket(s)</p>
          <p><strong>Total Amount:</strong> ₦${bookingDetails.totalAmount.toFixed(
            2
          )}</p>
          ${
            qrCodeBuffer
              ? "<p>Your QR code ticket is attached. Please present this at the event entrance.</p>"
              : ""
          }
          <p>We look forward to seeing you at the event!</p>
          <p>Best regards,<br>The EventPass Team</p>
        </div>
      `,
      attachments,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("sendBookingConfirmation failed:", error);
    }
  }

  async sendPaymentConfirmation(
    to: string,
    paymentDetails: {
      paymentReference: string;
      amount: number;
      bookingReference: string;
      eventTitle: string;
    }
  ): Promise<void> {
    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject: `Payment Confirmed - ${paymentDetails.eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Payment Confirmed!</h2>
          <p>Your payment has been successfully processed.</p>
          <p><strong>Payment Reference:</strong> ${
            paymentDetails.paymentReference
          }</p>
          <p><strong>Booking Reference:</strong> ${
            paymentDetails.bookingReference
          }</p>
          <p><strong>Event:</strong> ${paymentDetails.eventTitle}</p>
          <p><strong>Amount Paid:</strong> ₦${paymentDetails.amount.toFixed(
            2
          )}</p>
          <p>Your booking is now confirmed and your tickets will be sent shortly.</p>
          <p>Best regards,<br>The EventPass Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("sendPaymentConfirmation failed:", error);
    }
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    firstName: string
  ): Promise<void> {
    const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The EventPass Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("sendPasswordResetEmail failed:", error);
    }
  }

  async sendEmailVerification(
    to: string,
    verificationToken: string,
    firstName: string
  ): Promise<void> {
    const verificationUrl = `${config.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject: "Verify Your Email - EventPass",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to EventPass!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering with EventPass. Please verify your email address by clicking the button below:</p>
          <p><a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <p>Best regards,<br>The EventPass Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("sendEmailVerification failed:", error);
    }
  }

  async sendOTPEmail(
    to: string,
    otp: string,
    firstName: string,
    type: "email_verification" | "login" | "password_reset"
  ): Promise<void> {
    const subject =
      type === "email_verification"
        ? "Verify Your Email - EventPass"
        : type === "login"
        ? "Login Verification Code - EventPass"
        : "Password Reset Code - EventPass";

    const title =
      type === "email_verification"
        ? "Email Verification Code"
        : type === "login"
        ? "Login Verification Code"
        : "Password Reset Code";

    const description =
      type === "email_verification"
        ? "Please use the following code to verify your email address:"
        : type === "login"
        ? "Please use the following code to complete your login:"
        : "Please use the following code to reset your password:";

    const mailOptions = {
      from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">EventPass</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">${title}</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Hi ${firstName},</p>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">${description}</p>
            
            <div style="background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>
            
            <p style="color: #e74c3c; font-size: 14px; margin-top: 20px;">
              <strong>⚠️ This code will expire in 15 minutes</strong>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Best regards,<br>The EventPass Team</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("sendOTPEmail failed:", error);
      throw error;
    }
  }
  /**
   * Generic method to send custom emails
   */
  async sendEmail(mailOptions: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: any[];
  }): Promise<boolean> {
    try {
      const options = {
        from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
        ...mailOptions,
      };

      await this.transporter.sendMail(options);
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
export { EmailService };
