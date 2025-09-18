import api from "./api";
import type { ApiResponse } from "../types";

export interface EventPromotionData {
  eventId: string;
  eventTitle: string;
  eventDescription?: string;
  eventDate: string;
  eventVenue: string;
  qrCode: string;
  shareUrl: string;
  promotionText: string;
}

export const eventPromotionService = {
  /**
   * Get event promotion data with QR code
   */
  getEventPromotion: async (
    eventId: string
  ): Promise<ApiResponse<EventPromotionData>> => {
    const response = await api.get(`/event-promotion/${eventId}`);
    return response.data;
  },
};
