import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type {
  User,
  Event,
  Booking,
  Payment,
  CreateEventRequest,
  CreateBookingRequest,
  ApiResponse,
  PaginatedResponse,
} from "../../types";

// Define missing types
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  price?: number;
  capacity?: number;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  email: string;
  method?: "PAYSTACK" | "OPAY";
}

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    headers.set("content-type", "application/json");
    return headers;
  },
});

// Base query with re-authentication
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);
    if (refreshResult.data) {
      // Store the new token
      const { token } = refreshResult.data as any;
      api.dispatch({ type: "auth/setToken", payload: token });
      // Retry the original query with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Event", "Booking", "Payment", "Admin"],
  endpoints: (builder) => ({
    // Auth endpoints
    getCurrentUser: builder.query<ApiResponse<User>, void>({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (userData) => ({
        url: "/auth/profile",
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    getAllUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => "/auth/users",
      providesTags: ["Admin"],
    }),

    // Events endpoints
    getEvents: builder.query<
      PaginatedResponse<Event>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/events",
        params: { page, limit, search },
      }),
      providesTags: ["Event"],
    }),

    getEventById: builder.query<ApiResponse<Event>, string>({
      query: (eventId) => `/events/${eventId}`,
      providesTags: (_, __, eventId) => [{ type: "Event", id: eventId }],
    }),

    createEvent: builder.mutation<ApiResponse<Event>, CreateEventRequest>({
      query: (eventData) => ({
        url: "/events",
        method: "POST",
        body: eventData,
      }),
      invalidatesTags: ["Event"],
    }),

    updateEvent: builder.mutation<
      ApiResponse<Event>,
      { eventId: string; data: UpdateEventRequest }
    >({
      query: ({ eventId, data }) => ({
        url: `/events/${eventId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { eventId }) => [
        { type: "Event", id: eventId },
        "Event",
      ],
    }),

    deleteEvent: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (eventId) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Event"],
    }),

    getUserEvents: builder.query<
      ApiResponse<Event[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/events/my-events",
        params: { page, limit },
      }),
      providesTags: ["Event"],
    }),

    getEventCategories: builder.query<ApiResponse<string[]>, void>({
      query: () => "/events/categories",
      providesTags: ["Event"],
    }),

    // Bookings endpoints
    getBookings: builder.query<
      ApiResponse<Booking[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/bookings",
        params: { page, limit },
      }),
      providesTags: ["Booking"],
    }),

    getBookingById: builder.query<ApiResponse<Booking>, string>({
      query: (bookingId) => `/bookings/${bookingId}`,
      providesTags: (_, __, bookingId) => [{ type: "Booking", id: bookingId }],
    }),

    createBooking: builder.mutation<ApiResponse<Booking>, CreateBookingRequest>(
      {
        query: (bookingData) => ({
          url: "/bookings",
          method: "POST",
          body: bookingData,
        }),
        invalidatesTags: ["Booking", "Event"],
      }
    ),

    cancelBooking: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}/cancel`,
        method: "PUT",
      }),
      invalidatesTags: (_, __, bookingId) => [
        { type: "Booking", id: bookingId },
        "Booking",
        "Event",
      ],
    }),

    getUserBookings: builder.query<
      ApiResponse<Booking[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/bookings/my-bookings",
        params: { page, limit },
      }),
      providesTags: ["Booking"],
    }),

    getEventBookings: builder.query<
      ApiResponse<Booking[]>,
      { eventId: string; page?: number; limit?: number }
    >({
      query: ({ eventId, page = 1, limit = 10 }) => ({
        url: `/events/${eventId}/bookings`,
        params: { page, limit },
      }),
      providesTags: (_, __, { eventId }) => [
        { type: "Booking", id: `event-${eventId}` },
        "Booking",
      ],
    }),

    // Payments endpoints
    getPayments: builder.query<
      ApiResponse<Payment[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/payments",
        params: { page, limit },
      }),
      providesTags: ["Payment"],
    }),

    getPaymentById: builder.query<ApiResponse<Payment>, string>({
      query: (paymentId) => `/payments/${paymentId}`,
      providesTags: (_, __, paymentId) => [{ type: "Payment", id: paymentId }],
    }),

    createPayment: builder.mutation<ApiResponse<Payment>, PaymentRequest>({
      query: (paymentData) => ({
        url: "/payments",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Payment", "Booking"],
    }),

    verifyPayment: builder.mutation<
      ApiResponse<Payment>,
      { paymentId: string; reference: string }
    >({
      query: ({ paymentId, reference }) => ({
        url: `/payments/${paymentId}/verify`,
        method: "POST",
        body: { reference },
      }),
      invalidatesTags: (_, __, { paymentId }) => [
        { type: "Payment", id: paymentId },
        "Payment",
        "Booking",
      ],
    }),

    getUserPayments: builder.query<
      ApiResponse<Payment[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/payments/my-payments",
        params: { page, limit },
      }),
      providesTags: ["Payment"],
    }),

    // OPay endpoints
    createOPayPayment: builder.mutation<
      ApiResponse<any>,
      { bookingId: string; amount: number }
    >({
      query: (paymentData) => ({
        url: "/payments/opay/create",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Payment", "Booking"],
    }),

    queryOPayPayment: builder.query<ApiResponse<any>, string>({
      query: (reference) => `/payments/opay/query/${reference}`,
      providesTags: (_, __, reference) => [{ type: "Payment", id: reference }],
    }),

    // Admin endpoints
    getAdminStats: builder.query<ApiResponse<any>, void>({
      query: () => "/admin/stats",
      providesTags: ["Admin"],
    }),

    getAdminUsers: builder.query<
      ApiResponse<User[]>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/admin/users",
        params: { page, limit, search },
      }),
      providesTags: ["Admin"],
    }),

    getAdminEvents: builder.query<
      ApiResponse<Event[]>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/admin/events",
        params: { page, limit, search },
      }),
      providesTags: ["Admin"],
    }),

    getAdminBookings: builder.query<
      ApiResponse<Booking[]>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/admin/bookings",
        params: { page, limit, search },
      }),
      providesTags: ["Admin"],
    }),

    getAdminPayments: builder.query<
      ApiResponse<Payment[]>,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/admin/payments",
        params: { page, limit, search },
      }),
      providesTags: ["Admin"],
    }),

    // QR Code endpoints
    generateQRCode: builder.mutation<ApiResponse<{ qrCode: string }>, string>({
      query: (bookingId) => ({
        url: `/qr/generate/${bookingId}`,
        method: "POST",
      }),
    }),

    verifyQRCode: builder.mutation<
      ApiResponse<{ message: string; booking: Booking }>,
      string
    >({
      query: (qrCode) => ({
        url: "/qr/verify",
        method: "POST",
        body: { qrCode },
      }),
      invalidatesTags: ["Booking"],
    }),

    // Cache management endpoints
    clearCache: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (key) => ({
        url: `/cache/clear/${key}`,
        method: "DELETE",
      }),
    }),

    getCacheStats: builder.query<ApiResponse<any>, void>({
      query: () => "/cache/stats",
    }),

    // Email testing endpoint
    sendTestEmail: builder.mutation<
      ApiResponse<{ message: string }>,
      { to: string; subject: string; message: string }
    >({
      query: (emailData) => ({
        url: "/email/test",
        method: "POST",
        body: emailData,
      }),
    }),
  }),
});

export const {
  // Auth hooks
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useGetAllUsersQuery,

  // Events hooks
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetUserEventsQuery,
  useGetEventCategoriesQuery,

  // Bookings hooks
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useGetUserBookingsQuery,
  useGetEventBookingsQuery,

  // Payments hooks
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useGetUserPaymentsQuery,

  // OPay hooks
  useCreateOPayPaymentMutation,
  useQueryOPayPaymentQuery,

  // Admin hooks
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminEventsQuery,
  useGetAdminBookingsQuery,
  useGetAdminPaymentsQuery,

  // QR Code hooks
  useGenerateQRCodeMutation,
  useVerifyQRCodeMutation,

  // Cache hooks
  useClearCacheMutation,
  useGetCacheStatsQuery,

  // Email hooks
  useSendTestEmailMutation,
} = apiSlice;
