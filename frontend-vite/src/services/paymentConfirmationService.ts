import api from "./api";
import type { ApiResponse } from "../types";

export interface PaymentConfirmationData {
  payment: {
    reference: string;
    amount: number;
    status: string;
    paidAt: string | null;
    currency: string;
  };
  booking: {
    reference: string;
    quantity: number;
    status: string;
  };
  event: {
    title: string;
    venue: string;
    startDate: string;
    endDate: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export const paymentConfirmationService = {
  /**
   * Get payment confirmation data by payment reference
   */
  getPaymentConfirmation: async (
    paymentReference: string
  ): Promise<ApiResponse<PaymentConfirmationData>> => {
    const response = await api.get(`/payment-confirmation/${paymentReference}`);
    return response.data;
  },
};
