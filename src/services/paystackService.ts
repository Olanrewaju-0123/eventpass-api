import axios from "axios"
import { config } from "../config/env"

export class PaystackService {
  private static BASE_URL = "https://api.paystack.co"

  /**
   * Get Paystack headers
   */
  private static getHeaders() {
    return {
      Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    }
  }

  /**
   * Initialize transaction
   */
  static async initializeTransaction(data: any) {
    try {
      const response = await axios.post(`${this.BASE_URL}/transaction/initialize`, data, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error("Paystack initialize error:", error.response?.data || error.message)
      throw new Error("Failed to initialize transaction")
    }
  }

  /**
   * Verify transaction
   */
  static async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/transaction/verify/${reference}`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error("Paystack verify error:", error.response?.data || error.message)
      throw new Error("Failed to verify transaction")
    }
  }

  /**
   * List transactions
   */
  static async listTransactions(params: any = {}) {
    try {
      const response = await axios.get(`${this.BASE_URL}/transaction`, {
        headers: this.getHeaders(),
        params,
      })
      return response.data
    } catch (error: any) {
      console.error("Paystack list transactions error:", error.response?.data || error.message)
      throw new Error("Failed to list transactions")
    }
  }

  /**
   * Refund transaction
   */
  static async refundTransaction(data: any) {
    try {
      const response = await axios.post(`${this.BASE_URL}/refund`, data, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error("Paystack refund error:", error.response?.data || error.message)
      throw new Error("Failed to process refund")
    }
  }

  /**
   * Get transaction
   */
  static async getTransaction(transactionId: string) {
    try {
      const response = await axios.get(`${this.BASE_URL}/transaction/${transactionId}`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error("Paystack get transaction error:", error.response?.data || error.message)
      throw new Error("Failed to get transaction")
    }
  }

  /**
   * Get banks
   */
  static async getBanks(country = "nigeria") {
    try {
      const response = await axios.get(`${this.BASE_URL}/bank`, {
        headers: this.getHeaders(),
        params: { country },
      })
      return response.data
    } catch (error: any) {
      console.error("Paystack get banks error:", error.response?.data || error.message)
      throw new Error("Failed to get banks")
    }
  }
}
