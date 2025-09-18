import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Booking } from "../../types";

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  userBookings: Booking[];
  eventBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status: string;
    eventId: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  userBookings: [],
  eventBookings: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: "",
    eventId: "",
    dateRange: {
      start: "",
      end: "",
    },
  },
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload;
    },
    setUserBookings: (state, action: PayloadAction<Booking[]>) => {
      state.userBookings = action.payload;
    },
    setEventBookings: (state, action: PayloadAction<Booking[]>) => {
      state.eventBookings = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<BookingsState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<BookingsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateBooking: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex(
        (booking) => booking.id === action.payload.id
      );
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }

      const userIndex = state.userBookings.findIndex(
        (booking) => booking.id === action.payload.id
      );
      if (userIndex !== -1) {
        state.userBookings[userIndex] = action.payload;
      }

      const eventIndex = state.eventBookings.findIndex(
        (booking) => booking.id === action.payload.id
      );
      if (eventIndex !== -1) {
        state.eventBookings[eventIndex] = action.payload;
      }

      if (state.currentBooking?.id === action.payload.id) {
        state.currentBooking = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBookingsState: (state) => {
      state.bookings = [];
      state.currentBooking = null;
      state.userBookings = [];
      state.eventBookings = [];
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },
  },
});

export const {
  setBookings,
  setCurrentBooking,
  setUserBookings,
  setEventBookings,
  setLoading,
  setError,
  setPagination,
  setFilters,
  updateBooking,
  clearError,
  resetBookingsState,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
