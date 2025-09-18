import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Payment } from "../../types";

interface PaymentsState {
  payments: Payment[];
  currentPayment: Payment | null;
  userPayments: Payment[];
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
    method: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
  paymentMethods: {
    paystack: boolean;
    opay: boolean;
  };
}

const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  userPayments: [],
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
    method: "",
    dateRange: {
      start: "",
      end: "",
    },
  },
  paymentMethods: {
    paystack: true,
    opay: true,
  },
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
    },
    setCurrentPayment: (state, action: PayloadAction<Payment | null>) => {
      state.currentPayment = action.payload;
    },
    setUserPayments: (state, action: PayloadAction<Payment[]>) => {
      state.userPayments = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPagination: (
      state,
      action: PayloadAction<Partial<PaymentsState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<PaymentsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updatePayment: (state, action: PayloadAction<Payment>) => {
      const index = state.payments.findIndex(
        (payment) => payment.id === action.payload.id
      );
      if (index !== -1) {
        state.payments[index] = action.payload;
      }

      const userIndex = state.userPayments.findIndex(
        (payment) => payment.id === action.payload.id
      );
      if (userIndex !== -1) {
        state.userPayments[userIndex] = action.payload;
      }

      if (state.currentPayment?.id === action.payload.id) {
        state.currentPayment = action.payload;
      }
    },
    setPaymentMethods: (
      state,
      action: PayloadAction<Partial<PaymentsState["paymentMethods"]>>
    ) => {
      state.paymentMethods = { ...state.paymentMethods, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPaymentsState: (state) => {
      state.payments = [];
      state.currentPayment = null;
      state.userPayments = [];
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = initialState.filters;
    },
  },
});

export const {
  setPayments,
  setCurrentPayment,
  setUserPayments,
  setLoading,
  setError,
  setPagination,
  setFilters,
  updatePayment,
  setPaymentMethods,
  clearError,
  resetPaymentsState,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
