import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Event } from "../../types";

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  userEvents: Event[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    search: string;
    category: string;
    status: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  userEvents: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: "",
    category: "",
    status: "",
    dateRange: {
      start: "",
      end: "",
    },
  },
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
    },
    setUserEvents: (state, action: PayloadAction<Event[]>) => {
      state.userEvents = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<EventsState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<EventsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetEventsState: (state) => {
      state.events = [];
      state.currentEvent = null;
      state.userEvents = [];
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },
  },
});

export const {
  setEvents,
  setCurrentEvent,
  setUserEvents,
  setLoading,
  setError,
  setPagination,
  setFilters,
  clearError,
  resetEventsState,
} = eventsSlice.actions;

export default eventsSlice.reducer;
