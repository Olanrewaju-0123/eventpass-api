// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "USER" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TempUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerificationToken: string;
  emailVerificationExpires: string;
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    tempUserId: string;
    email: string;
    success: boolean;
    verificationRequired: boolean;
  };
}

// OTP Types
export interface OTPRequest {
  email: string;
  otp: string;
}

export interface LoginOTPResponse {
  success: boolean;
  message: string;
  data: {
    email: string;
    otpRequired: boolean;
  };
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  price: number;
  capacity: number;
  available: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  price: number;
  capacity: number;
  category: string;
  imageUrl?: string;
}

// Booking Types
export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  user: User;
  event: Event;
  qrCode?: string;
}

export interface CreateBookingRequest {
  eventId: string;
  quantity: number;
}

// Payment Types
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  method: "PAYSTACK";
  reference: string;
  createdAt: string;
  booking: Booking;
}

export interface InitializePaymentRequest {
  bookingId: string;
  amount: number;
  email: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// QR Code Types
export interface QRCodeData {
  bookingId: string;
  eventId: string;
  userId: string;
  bookingReference: string;
}

// Statistics Types
export interface BookingStatistics {
  totalBookings: number;
  totalTickets: number;
  totalRevenue: number;
  statusBreakdown: {
    [key: string]: {
      count: number;
      tickets: number;
      amount: number;
    };
  };
  recentBookings: Booking[];
}

export interface EventStatistics {
  eventId: string;
  eventTitle: string;
  totalCapacity: number;
  ticketsSold: number;
  ticketsAvailable: number;
  occupancyRate: number;
  totalRevenue: number;
  bookingBreakdown: {
    [key: string]: number;
  };
  recentBookings: Booking[];
}

export interface PaymentStatistics {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  statusBreakdown: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
  methodBreakdown: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
  recentPayments: Payment[];
}

// Form Types
export interface FormError {
  [key: string]: string[];
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

// Toast Types
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}
