import { apiService } from "./api";
import {
  type Booking,
  type CreateBookingRequest,
  type ApiResponse,
  type PaginatedResponse,
  type BookingStatistics,
} from "../types";

export const bookingService = {
  // Start booking process
  startBooking: async (
    bookingData: CreateBookingRequest
  ): Promise<ApiResponse<Booking>> => {
    return apiService.post<Booking>("/bookings", bookingData);
  },

  // Get booking by ID
  getBookingById: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    return apiService.get<Booking>(`/bookings/${bookingId}`);
  },

  // Get booking by reference
  getBookingByReference: async (
    reference: string
  ): Promise<ApiResponse<Booking>> => {
    return apiService.get<Booking>(`/bookings/reference/${reference}`);
  },

  // Get user's bookings
  getMyBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Booking>> => {
    return apiService.getPaginated<Booking>("/bookings/my", params);
  },

  // Cancel booking
  cancelBooking: async (
    bookingId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>(
      `/bookings/${bookingId}/cancel`
    );
  },

  // Get booking statistics (for users)
  getBookingStatistics: async (): Promise<ApiResponse<BookingStatistics>> => {
    return apiService.get<BookingStatistics>("/bookings/my/statistics");
  },

  // Get all bookings (admin only)
  getAllBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
    userId?: string;
  }): Promise<PaginatedResponse<Booking>> => {
    return apiService.getPaginated<Booking>("/bookings/admin/all", params);
  },

  // Get all booking statistics (admin only)
  getAllBookingStatistics: async (): Promise<
    ApiResponse<BookingStatistics>
  > => {
    return apiService.get<BookingStatistics>("/bookings/admin/statistics");
  },

  // Generate booking QR code
  generateBookingQR: async (
    bookingId: string
  ): Promise<ApiResponse<{ qrCode: string }>> => {
    return apiService.get<{ qrCode: string }>(`/bookings/${bookingId}/qr`);
  },

  // Download ticket
  downloadTicket: async (bookingId: string): Promise<Blob> => {
    const response = await apiService.getBlob(`/bookings/${bookingId}/ticket`);
    return response;
  },
};
