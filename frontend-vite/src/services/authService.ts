import { apiService } from "./api";
import {
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type RegisterResponse,
  type User,
  type ApiResponse,
} from "../types";

export interface LoginResponse {
  message: string;
  email: string;
  requiresOTP: boolean;
}

export interface OTPRequest {
  email: string;
  otp: string;
}

export const authService = {
  // Login user (sends OTP)
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiService.post<{
      message: string;
      email: string;
      requiresOTP: boolean;
    }>("/auth/login", credentials);
    return {
      message: response.data.message,
      email: response.data.email,
      requiresOTP: response.data.requiresOTP,
    };
  },

  // Complete login with OTP
  completeLoginWithOTP: async (data: OTPRequest): Promise<AuthResponse> => {
    return apiService.post<AuthResponse["data"]>("/auth/complete-login", data);
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return apiService.post<RegisterResponse>("/auth/register", userData);
  },

  // Verify email with OTP
  verifyEmailWithOTP: async (data: OTPRequest): Promise<AuthResponse> => {
    return apiService.post<AuthResponse["data"]>(
      "/auth/verify-email-otp",
      data
    );
  },

  // Resend email verification OTP
  resendEmailVerificationOTP: async (
    email: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>("/auth/resend-email-otp", {
      email,
    });
  },

  // Resend login OTP
  resendLoginOTP: async (
    email: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>("/auth/resend-login-otp", {
      email,
    });
  },

  // Forgot password (sends OTP)
  forgotPassword: async (
    email: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>("/auth/forgot-password", {
      email,
    });
  },

  // Verify reset password OTP
  verifyResetOTP: async (
    email: string,
    otp: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>("/auth/verify-reset-otp", {
      email,
      otp,
    });
  },

  // Reset password with OTP
  resetPassword: async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiService.post<{ message: string }>("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
  },

  // Verify email (legacy token method)
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    return apiService.post<AuthResponse["data"]>("/auth/verify-email", {
      token,
    });
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiService.get<User>("/auth/profile");
  },

  // Update user profile
  updateProfile: async (
    userData: Partial<User>
  ): Promise<ApiResponse<User>> => {
    return apiService.put<User>("/auth/profile", userData);
  },

  // Get all users (Admin only)
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiService.get<User[]>("/auth/users");
  },

  // Logout (client-side only)
  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Store user data
  storeUser: (user: User, token: string): void => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  },
};
