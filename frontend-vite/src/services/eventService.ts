import { apiService } from "./api";
import {
  type Event,
  type CreateEventRequest,
  type ApiResponse,
  type PaginatedResponse,
  type EventStatistics,
} from "../types";

export const eventService = {
  // Get all events with pagination and filters
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    city?: string;
    state?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Event>> => {
    return apiService.getPaginated<Event>("/events", params);
  },

  // Get single event by ID
  getEventById: async (eventId: string): Promise<ApiResponse<Event>> => {
    return apiService.get<Event>(`/events/${eventId}`);
  },

  // Get event categories
  getEventCategories: async (): Promise<ApiResponse<string[]>> => {
    return apiService.get<string[]>("/events/categories");
  },

  // Get event statistics (for organizers)
  getEventStatistics: async (
    eventId: string
  ): Promise<ApiResponse<EventStatistics>> => {
    return apiService.get<EventStatistics>(`/events/${eventId}/statistics`);
  },

  // Create new event (for organizers)
  createEvent: async (
    eventData: CreateEventRequest
  ): Promise<ApiResponse<Event>> => {
    return apiService.post<Event>("/events", eventData);
  },

  // Update event (for organizers)
  updateEvent: async (
    eventId: string,
    eventData: Partial<CreateEventRequest>
  ): Promise<ApiResponse<Event>> => {
    return apiService.put<Event>(`/events/${eventId}`, eventData);
  },

  // Delete event (for organizers)
  deleteEvent: async (
    eventId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.delete<{ message: string }>(`/events/${eventId}`);
  },

  // Get events by organizer
  getMyEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Event>> => {
    return apiService.getPaginated<Event>("/events/my", params);
  },

  // Generate event promotion QR code
  generateEventQR: async (
    eventId: string
  ): Promise<ApiResponse<{ qrCode: string }>> => {
    return apiService.get<{ qrCode: string }>(`/qr/event/${eventId}`);
  },
};
