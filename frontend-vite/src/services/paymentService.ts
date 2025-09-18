import { apiService } from "./api";
import {
  type Payment,
  type InitializePaymentRequest,
  type PaymentResponse,
  type ApiResponse,
  type PaginatedResponse,
  type PaymentStatistics,
} from "../types";

export const paymentService = {
  // Initialize payment
  initializePayment: async (
    paymentData: InitializePaymentRequest
  ): Promise<PaymentResponse> => {
    return apiService.post<PaymentResponse["data"]>(
      "/payments/initialize",
      paymentData
    );
  },

  // Verify payment
  verifyPayment: async (reference: string): Promise<ApiResponse<Payment>> => {
    return apiService.get<Payment>(`/payments/verify/${reference}`);
  },

  // Get user's payments
  getMyPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    return apiService.getPaginated<Payment>("/payments/my", params);
  },

  // Get payment statistics (for users)
  getPaymentStatistics: async (): Promise<ApiResponse<PaymentStatistics>> => {
    return apiService.get<PaymentStatistics>("/payments/my/statistics");
  },

  // Get all payments (admin only)
  getAllPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    return apiService.getPaginated<Payment>("/payments/admin/all", params);
  },

  // Get all payment statistics (admin only)
  getAllPaymentStatistics: async (): Promise<
    ApiResponse<PaymentStatistics>
  > => {
    return apiService.get<PaymentStatistics>("/payments/admin/statistics");
  },

  // Process refund (admin only)
  processRefund: async (
    paymentId: string,
    reason: string,
    amount?: number
  ): Promise<
    ApiResponse<{
      refundId: string;
      paymentId: string;
      amount: number;
      status: string;
      reason: string;
    }>
  > => {
    return apiService.post<{
      refundId: string;
      paymentId: string;
      amount: number;
      status: string;
      reason: string;
    }>(`/payments/admin/${paymentId}/refund`, { reason, amount });
  },
};
