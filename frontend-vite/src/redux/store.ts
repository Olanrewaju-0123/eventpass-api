import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";
import authReducer from "./auth/authSlice";
import eventsReducer from "./events/eventsSlice";
import bookingsReducer from "./bookings/bookingsSlice";
import paymentsReducer from "./payments/paymentsSlice";
import uiReducer from "./ui/uiSlice";

export const store = configureStore({
  reducer: {
    // API slice for RTK Query
    [apiSlice.reducerPath]: apiSlice.reducer,

    // Feature slices
    auth: authReducer,
    events: eventsReducer,
    bookings: bookingsReducer,
    payments: paymentsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
