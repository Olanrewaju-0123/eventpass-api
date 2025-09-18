import type { Request } from "express"
import type { JwtPayload } from "jsonwebtoken"

// Extend Express Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

// JWT Payload interface
export interface JWTPayload extends JwtPayload {
  userId: string
  email: string
  role: string
  iat: number
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Event interfaces
export interface CreateEventData {
  title: string
  description: string
  venue: string
  address: string
  startDate: Date
  endDate: Date
  price: number
  capacity: number
  category: string
  imageUrl?: string
}

export interface UpdateEventData extends Partial<CreateEventData> {}

// Booking interfaces
export interface CreateBookingData {
  eventId: string
  quantity: number
}

export interface BookingWithDetails {
  id: string
  userId: string
  eventId: string
  quantity: number
  totalAmount: number
  status: string
  bookingReference: string
  qrCode?: string
  createdAt: Date
  event: {
    title: string
    venue: string
    startDate: Date
    endDate: Date
  }
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

// Payment interfaces
export interface PaystackInitializeData {
  email: string
  amount: number
  reference: string
  callback_url?: string
  metadata?: Record<string, any>
}

export interface PaystackVerifyResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, any>
    log: any
    fees: number
    fees_split: any
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
      account_name: string
    }
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string
      metadata: any
      risk_action: string
      international_format_phone: string
    }
    plan: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
    requested_amount: number
    pos_transaction_data: any
    source: any
    fees_breakdown: any
  }
}

// Email interfaces
export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

// Cache interfaces
export interface CacheOptions {
  ttl?: number // Time to live in seconds
}

// QR Code interfaces
export interface QRCodeData {
  bookingId: string
  eventId: string
  userId: string
  bookingReference: string
}

// Validation interfaces
export interface ValidationError {
  field: string
  message: string
}

// Pagination interfaces
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// Filter interfaces
export interface EventFilters {
  category?: string
  startDate?: Date
  endDate?: Date
  minPrice?: number
  maxPrice?: number
  venue?: string
  status?: string
}

export interface BookingFilters {
  status?: string
  eventId?: string
  startDate?: Date
  endDate?: Date
}
