import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;

  // Modal states
  modals: {
    login: boolean;
    register: boolean;
    forgotPassword: boolean;
    resetPassword: boolean;
    createEvent: boolean;
    editEvent: boolean;
    deleteEvent: boolean;
    createBooking: boolean;
    cancelBooking: boolean;
    payment: boolean;
    qrScanner: boolean;
  };

  // Toast notifications
  toasts: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    duration?: number;
  }>;

  // Sidebar and navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;

  // Theme and appearance
  theme: "light" | "dark";
  sidebarCollapsed: boolean;

  // Search and filters
  globalSearch: string;
  searchHistory: string[];

  // Pagination
  defaultPageSize: number;

  // Form states
  forms: {
    [key: string]: {
      isSubmitting: boolean;
      errors: Record<string, string>;
      touched: Record<string, boolean>;
    };
  };
}

const initialState: UIState = {
  globalLoading: false,
  pageLoading: false,
  modals: {
    login: false,
    register: false,
    forgotPassword: false,
    resetPassword: false,
    createEvent: false,
    editEvent: false,
    deleteEvent: false,
    createBooking: false,
    cancelBooking: false,
    payment: false,
    qrScanner: false,
  },
  toasts: [],
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: "light",
  sidebarCollapsed: false,
  globalSearch: "",
  searchHistory: [],
  defaultPageSize: 10,
  forms: {},
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState["modals"]] = false;
      });
    },

    // Toast actions
    addToast: (
      state,
      action: PayloadAction<Omit<UIState["toasts"][0], "id">>
    ) => {
      const id = Date.now().toString();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    clearToasts: (state) => {
      state.toasts = [];
    },

    // Sidebar and navigation actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },

    // Theme actions
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Search actions
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload;
    },
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      if (
        action.payload.trim() &&
        !state.searchHistory.includes(action.payload.trim())
      ) {
        state.searchHistory.unshift(action.payload.trim());
        // Keep only last 10 searches
        if (state.searchHistory.length > 10) {
          state.searchHistory = state.searchHistory.slice(0, 10);
        }
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
    },

    // Pagination actions
    setDefaultPageSize: (state, action: PayloadAction<number>) => {
      state.defaultPageSize = action.payload;
    },

    // Form actions
    setFormSubmitting: (
      state,
      action: PayloadAction<{ formId: string; isSubmitting: boolean }>
    ) => {
      const { formId, isSubmitting } = action.payload;
      if (!state.forms[formId]) {
        state.forms[formId] = { isSubmitting: false, errors: {}, touched: {} };
      }
      state.forms[formId].isSubmitting = isSubmitting;
    },
    setFormErrors: (
      state,
      action: PayloadAction<{ formId: string; errors: Record<string, string> }>
    ) => {
      const { formId, errors } = action.payload;
      if (!state.forms[formId]) {
        state.forms[formId] = { isSubmitting: false, errors: {}, touched: {} };
      }
      state.forms[formId].errors = errors;
    },
    setFormTouched: (
      state,
      action: PayloadAction<{
        formId: string;
        touched: Record<string, boolean>;
      }>
    ) => {
      const { formId, touched } = action.payload;
      if (!state.forms[formId]) {
        state.forms[formId] = { isSubmitting: false, errors: {}, touched: {} };
      }
      state.forms[formId].touched = {
        ...state.forms[formId].touched,
        ...touched,
      };
    },
    clearForm: (state, action: PayloadAction<string>) => {
      delete state.forms[action.payload];
    },
    clearAllForms: (state) => {
      state.forms = {};
    },

    // Reset actions
    resetUIState: (state) => {
      state.globalLoading = false;
      state.pageLoading = false;
      state.modals = initialState.modals;
      state.toasts = [];
      state.sidebarOpen = true;
      state.mobileMenuOpen = false;
      state.globalSearch = "";
      state.forms = {};
    },
  },
});

export const {
  setGlobalLoading,
  setPageLoading,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  toggleTheme,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  setGlobalSearch,
  addToSearchHistory,
  clearSearchHistory,
  setDefaultPageSize,
  setFormSubmitting,
  setFormErrors,
  setFormTouched,
  clearForm,
  clearAllForms,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
