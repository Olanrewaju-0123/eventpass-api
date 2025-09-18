import api from "./api";
import type { ApiResponse } from "../types";

export interface QRCodeResponse {
  qrCode: string;
  eventId: string;
  eventTitle?: string;
  eventUrl?: string;
}

export const qrService = {
  /**
   * Generate QR code for event promotion
   */
  generateEventQR: async (
    eventId: string
  ): Promise<ApiResponse<QRCodeResponse>> => {
    const response = await api.get(`/qr/event/${eventId}`);
    return response.data;
  },
};
