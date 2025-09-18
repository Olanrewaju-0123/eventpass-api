// Redux store and hooks
export { store } from "./store";
export { useAppDispatch, useAppSelector } from "./hooks";

// Auth slice
export { default as authReducer } from "./auth/authSlice";
export {
  initializeAuth,
  loginUser,
  completeLoginWithOTP,
  registerUser,
  verifyEmailWithOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  updateUserProfile,
  resendEmailVerificationOTP,
  resendLoginOTP,
  logout,
  clearError,
  setLoginStep,
  resetAuthState,
  setShowOTP,
  setRegisteredEmail,
} from "./auth/authSlice";

// Events slice
export { default as eventsReducer } from "./events/eventsSlice";
export {
  setEvents,
  setCurrentEvent,
  setUserEvents,
  setLoading as setEventsLoading,
  setError as setEventsError,
  setPagination as setEventsPagination,
  setFilters as setEventsFilters,
  clearError as clearEventsError,
  resetEventsState,
} from "./events/eventsSlice";

// Bookings slice
export { default as bookingsReducer } from "./bookings/bookingsSlice";
export {
  setBookings,
  setCurrentBooking,
  setUserBookings,
  setEventBookings,
  setLoading as setBookingsLoading,
  setError as setBookingsError,
  setPagination as setBookingsPagination,
  setFilters as setBookingsFilters,
  updateBooking,
  clearError as clearBookingsError,
  resetBookingsState,
} from "./bookings/bookingsSlice";

// Payments slice
export { default as paymentsReducer } from "./payments/paymentsSlice";
export {
  setPayments,
  setCurrentPayment,
  setUserPayments,
  setLoading as setPaymentsLoading,
  setError as setPaymentsError,
  setPagination as setPaymentsPagination,
  setFilters as setPaymentsFilters,
  updatePayment,
  setPaymentMethods,
  clearError as clearPaymentsError,
  resetPaymentsState,
} from "./payments/paymentsSlice";

// UI slice
export { default as uiReducer } from "./ui/uiSlice";
export {
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
} from "./ui/uiSlice";

// API slice
export { apiSlice } from "./api/apiSlice";
export * from "./api/apiSlice";
