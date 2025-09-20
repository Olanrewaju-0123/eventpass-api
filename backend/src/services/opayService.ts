import axios from "axios";
import crypto from "crypto";
import { config } from "../config/env";

export class OpayService {
  private static BASE_URL =
    config.NODE_ENV === "production"
      ? "https://liveapi.opaycheckout.com"
      : "https://testapi.opaycheckout.com";

  /**
   * Generate OPay signature for API authentication
   */
  private static generateSignature(data: any, secretKey: string): string {
    // OPay requires flattening nested objects and sorting all keys
    const flattenObject = (obj: any, prefix = ""): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (
          obj[key] !== null &&
          typeof obj[key] === "object" &&
          !Array.isArray(obj[key])
        ) {
          Object.assign(flattened, flattenObject(obj[key], prefix + key + "."));
        } else {
          flattened[prefix + key] = obj[key];
        }
      }
      return flattened;
    };

    const flatData = flattenObject(data);
    const sortedKeys = Object.keys(flatData).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${flatData[key]}`)
      .join("&");

    console.log("OPay signature string:", queryString);

    return crypto
      .createHmac("sha256", secretKey)
      .update(queryString)
      .digest("hex");
  }

  /**
   * Check if OPay is configured
   */
  private static isConfigured(): boolean {
    return !!(
      config.OPAY_SECRET_KEY &&
      config.OPAY_MERCHANT_ID &&
      config.OPAY_PUBLIC_KEY
    );
  }

  /**
   * Get OPay headers with authentication
   */
  private static getHeaders(data: any) {
    if (!this.isConfigured()) {
      throw new Error(
        "OPay is not configured. Please set OPAY_SECRET_KEY, OPAY_MERCHANT_ID, and OPAY_PUBLIC_KEY environment variables."
      );
    }
    const signature = this.generateSignature(data, config.OPAY_SECRET_KEY!);
    return {
      Authorization: `Bearer ${config.OPAY_PUBLIC_KEY}`,
      MerchantId: config.OPAY_MERCHANT_ID!,
      "Content-Type": "application/json",
      Signature: signature,
    };
  }

  /**
   * Initialize OPay Transaction
   */
  static async initializeTransaction(paymentData: {
    amount: number;
    currency: string;
    reference: string;
    callbackUrl?: string;
    metadata?: any;
  }) {
    try {
      console.log("OPay initializeTransaction called with:", paymentData);

      // For development, return a mock successful response
      if (config.NODE_ENV !== "production") {
        console.log("Using mock OPay response for development");
        return {
          success: true,
          data: {
            reference: paymentData.reference,
            authorization_url: `${config.FRONTEND_URL}/mock-payment-success?ref=${paymentData.reference}&amount=${paymentData.amount}&provider=opay`,
            access_code: paymentData.reference,
          },
        };
      }

      const payload = {
        reference: paymentData.reference,
        country: "NG",
        amount: {
          currency: paymentData.currency || "NGN",
          total: paymentData.amount * 100, // Convert to kobo
        },
        payMethod: "AccountWallet", // Use AccountWallet for web payments
        callbackUrl:
          paymentData.callbackUrl || `${config.BASE_URL}/api/webhooks/opay`,
        product: {
          name: "Event Creation Fee",
          description: "Payment for creating a new event",
        },
        metadata: paymentData.metadata,
      };

      console.log("OPay payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/international/payment/create`,
        payload,
        {
          headers: this.getHeaders(payload),
        }
      );

      return {
        success: true,
        data: {
          reference: response.data.data.reference,
          authorization_url:
            response.data.data.qrCode || response.data.data.paymentUrl,
          access_code: response.data.data.reference,
        },
      };
    } catch (error: any) {
      console.error(
        "OPay initialize transaction error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to initialize OPay transaction");
    }
  }

  /**
   * Create OPay Wallet QR Payment
   */
  static async createWalletPayment(paymentData: {
    reference: string;
    amount: number; // Amount in kobo (e.g., 60000 for ₦600)
    currency?: string;
    callbackUrl?: string;
    productName: string;
    productDescription?: string;
  }) {
    try {
      const payload = {
        reference: paymentData.reference,
        country: "NG",
        amount: {
          currency: paymentData.currency || "NGN",
          total: paymentData.amount,
        },
        payMethod: "AccountWallet", // Use AccountWallet for web payments
        callbackUrl:
          paymentData.callbackUrl || `${config.BASE_URL}/api/webhooks/opay`,
        product: {
          name: paymentData.productName,
          description:
            paymentData.productDescription || paymentData.productName,
        },
      };

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/international/payment/create`,
        payload,
        {
          headers: this.getHeaders(payload),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "OPay create payment error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create OPay payment");
    }
  }

  /**
   * Query payment status
   */
  static async queryPaymentStatus(reference: string) {
    try {
      const payload = { reference };

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/international/payment/status`,
        payload,
        {
          headers: this.getHeaders(payload),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "OPay query status error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to query payment status");
    }
  }

  /**
   * Cancel payment
   */
  static async cancelPayment(reference: string) {
    try {
      const payload = { reference };

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/international/payment/cancel`,
        payload,
        {
          headers: this.getHeaders(payload),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "OPay cancel payment error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to cancel payment");
    }
  }

  /**
   * Refund payment
   */
  static async refundPayment(refundData: {
    reference: string;
    refundAmount: number;
    refundReason?: string;
  }) {
    try {
      const payload = {
        reference: refundData.reference,
        refundAmount: refundData.refundAmount,
        refundReason: refundData.refundReason || "Customer request",
      };

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/international/payment/refund`,
        payload,
        {
          headers: this.getHeaders(payload),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "OPay refund error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to process refund");
    }
  }

  /**
   * Query refund status
   */
  static async queryRefundStatus(reference: string) {
    try {
      const payload = { reference };

      const response = await axios.post(
        `${this.BASE_URL}/api/v1/international/payment/refund/status`,
        payload,
        {
          headers: this.getHeaders(payload),
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "OPay query refund status error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to query refund status");
    }
  }

  /**
   * Verify callback signature
   */
  static verifyCallbackSignature(data: any, signature: string): boolean {
    try {
      const expectedSignature = this.generateSignature(
        data,
        config.OPAY_SECRET_KEY || ""
      );
      return crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expectedSignature, "hex")
      );
    } catch (error) {
      console.error("OPay signature verification error:", error);
      return false;
    }
  }

  /**
   * Get supported payment methods
   */
  static getSupportedPaymentMethods() {
    return [
      {
        id: "opay_wallet_qr",
        name: "OPay Wallet QR",
        description: "Pay with OPay wallet by scanning QR code",
        icon: "qr-code",
        enabled: true,
      },
    ];
  }
}
