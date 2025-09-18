import api from "./api";
import type { ApiResponse } from "../types";

export interface OpayPaymentRequest {
  bookingId: string;
  amount: number;
}

export interface OpayPaymentResponse {
  reference: string;
  qrCode: string;
  amount: {
    total: number;
    currency: string;
  };
  status: string;
  orderNo: string;
}

export interface OpayPaymentStatus {
  reference: string;
  status: string;
  amount: {
    total: number;
    currency: string;
  };
}

export interface OpayPaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export const opayService = {
  /**
   * Create OPay Wallet QR Payment
   */
  createPayment: async (
    data: OpayPaymentRequest
  ): Promise<ApiResponse<OpayPaymentResponse>> => {
    const response = await api.post("/opay/create", data);
    return response.data;
  },

  /**
   * Query payment status
   */
  queryPaymentStatus: async (
    reference: string
  ): Promise<ApiResponse<OpayPaymentStatus>> => {
    const response = await api.get(`/opay/status/${reference}`);
    return response.data;
  },

  /**
   * Cancel payment
   */
  cancelPayment: async (reference: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/opay/cancel/${reference}`);
    return response.data;
  },

  /**
   * Get supported payment methods
   */
  getPaymentMethods: async (): Promise<ApiResponse<OpayPaymentMethod[]>> => {
    const response = await api.get("/opay/methods");
    return response.data;
  },
};
