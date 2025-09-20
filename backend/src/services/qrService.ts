import QRCode from "qrcode";
import type { QRCodeData } from "../types";
import { config } from "../config/env";

export class QRService {
  /**
   * Generate QR code for booking
   */
  static async generateBookingQR(qrData: QRCodeData): Promise<string> {
    try {
      // Create verification URL
      const verificationUrl = `${config.FRONTEND_URL}/verify-ticket/${qrData.bookingReference}`;

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("QR code generation failed:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  /**
   * Generate QR code as buffer
   */
  static async generateBookingQRBuffer(qrData: QRCodeData): Promise<Buffer> {
    try {
      const verificationUrl = `${config.FRONTEND_URL}/verify-ticket/${qrData.bookingReference}`;

      const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: "M",
        type: "png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      });

      return qrCodeBuffer;
    } catch (error) {
      console.error("QR code buffer generation failed:", error);
      throw new Error("Failed to generate QR code buffer");
    }
  }

  /**
   * Generate event promotion QR code
   */
  static async generateEventPromotionQR(eventId: string): Promise<string> {
    try {
      const eventUrl = `${config.FRONTEND_URL}/events/${eventId}`;

      const qrCodeDataUrl = await QRCode.toDataURL(eventUrl, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        width: 256,
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Event promotion QR code generation failed:", error);
      throw new Error("Failed to generate event promotion QR code");
    }
  }

  /**
   * Validate QR code data
   */
  static validateQRData(qrData: QRCodeData): boolean {
    return !!(
      qrData.bookingId &&
      qrData.eventId &&
      qrData.userId &&
      qrData.bookingReference
    );
  }
}
