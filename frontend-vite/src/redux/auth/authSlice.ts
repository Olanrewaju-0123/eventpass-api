import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, LoginRequest, RegisterRequest } from "../../types";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  // OTP related states
  otpSent: boolean;
  otpVerified: boolean;
  pendingEmail: string | null;
  loginStep: "credentials" | "otp" | "complete";
  // Registration OTP states
  showOTP: boolean;
  registeredEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  pendingEmail: null,
  loginStep: "credentials",
  showOTP: false,
  registeredEmail: null,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { user, token };
    }
    return null;
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return {
        email: credentials.email,
        requiresOTP: true,
        message: response.message,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const completeLoginWithOTP = createAsyncThunk(
  "auth/completeLoginWithOTP",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.completeLoginWithOTP(data);
      if (response.success) {
        authService.storeUser(response.data.user, response.data.token);
        toast.success("Login successful!");
        return response.data;
      }
      return rejectWithValue(response.message || "OTP verification failed");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "OTP verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterRequest, { rejectWithValue, dispatch }) => {
    try {
      console.log("🔧 Redux: Calling authService.register with:", userData);
      const response = await authService.register(userData);
      console.log("🔧 Redux: AuthService response:", response);

      if (response.success) {
        console.log("🔧 Redux: Registration successful, showing toast");
        toast.success(
          "Registration successful! Please check your email to verify your account."
        );
        const result = {
          email: response.data.email,
          message: response.data.message,
        };
        console.log("🔧 Redux: Returning result:", result);

        // Dispatch actions to update Redux state for OTP flow
        dispatch(authSlice.actions.setRegisteredEmail(response.data.email));
        dispatch(authSlice.actions.setShowOTP(true));

        return result;
      }
      console.log("🔧 Redux: Registration failed, rejecting with value");
      return rejectWithValue(response.message || "Registration failed");
    } catch (error: any) {
      console.log("🔧 Redux: Registration error:", error);
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const verifyEmailWithOTP = createAsyncThunk(
  "auth/verifyEmailWithOTP",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmailWithOTP(data);
      if (response.success) {
        authService.storeUser(response.data.user, response.data.token);
        toast.success("Email verified successfully!");
        return response.data;
      }
      return rejectWithValue(response.message || "Email verification failed");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Email verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        toast.success("Password reset OTP sent to your email");
        return { email, message: response.message };
      }
      return rejectWithValue(response.message || "Failed to send reset OTP");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to send reset OTP";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const verifyResetOTP = createAsyncThunk(
  "auth/verifyResetOTP",
  async (data: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await authService.verifyResetOTP(data.email, data.otp);
      if (response.success) {
        toast.success("OTP verified successfully");
        return { email: data.email, message: response.message };
      }
      return rejectWithValue(response.message || "OTP verification failed");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "OTP verification failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    data: { email: string; otp: string; newPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.resetPassword(
        data.email,
        data.otp,
        data.newPassword
      );
      if (response.success) {
        toast.success("Password reset successfully");
        return { message: response.message };
      }
      return rejectWithValue(response.message || "Password reset failed");
    } catch (error: any) {
      const message = error.response?.data?.message || "Password reset failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData: Partial<User>, { rejectWithValue, getState }) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.success) {
        const state = getState() as { auth: AuthState };
        authService.storeUser(response.data, state.auth.token!);
        toast.success("Profile updated successfully!");
        return response.data;
      }
      return rejectWithValue(response.message || "Profile update failed");
    } catch (error: any) {
      const message = error.response?.data?.message || "Profile update failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resendEmailVerificationOTP = createAsyncThunk(
  "auth/resendEmailVerificationOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.resendEmailVerificationOTP(email);
      if (response.success) {
        toast.success("Verification OTP resent successfully");
        return { message: response.message };
      }
      return rejectWithValue(response.message || "Failed to resend OTP");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const resendLoginOTP = createAsyncThunk(
  "auth/resendLoginOTP",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.resendLoginOTP(email);
      if (response.success) {
        toast.success("Login OTP resent successfully");
        return { message: response.message };
      }
      return rejectWithValue(response.message || "Failed to resend OTP");
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.pendingEmail = null;
      state.loginStep = "credentials";
      toast.success("Logged out successfully");
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoginStep: (
      state,
      action: PayloadAction<"credentials" | "otp" | "complete">
    ) => {
      state.loginStep = action.payload;
    },
    resetAuthState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.pendingEmail = null;
      state.loginStep = "credentials";
      state.error = null;
    },
    setShowOTP: (state, action: PayloadAction<boolean>) => {
      state.showOTP = action.payload;
      console.log("Redux: setShowOTP to", action.payload);
    },
    setRegisteredEmail: (state, action: PayloadAction<string | null>) => {
      state.registeredEmail = action.payload;
      console.log("Redux: setRegisteredEmail to", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        authService.logout();
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.pendingEmail = action.payload.email;
        state.loginStep = "otp";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Complete login with OTP
      .addCase(completeLoginWithOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeLoginWithOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpVerified = true;
        state.loginStep = "complete";
        state.pendingEmail = null;
      })
      .addCase(completeLoginWithOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.pendingEmail = action.payload.email;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify email with OTP
      .addCase(verifyEmailWithOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyEmailWithOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.otpVerified = true;
        state.pendingEmail = null;
      })
      .addCase(verifyEmailWithOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.pendingEmail = action.payload.email;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Verify reset OTP
      .addCase(verifyResetOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyResetOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.otpVerified = true;
      })
      .addCase(verifyResetOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.otpSent = false;
        state.otpVerified = false;
        state.pendingEmail = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Resend OTPs
      .addCase(resendEmailVerificationOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendEmailVerificationOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendEmailVerificationOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(resendLoginOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendLoginOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendLoginOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  logout,
  clearError,
  setLoginStep,
  resetAuthState,
  setShowOTP,
  setRegisteredEmail,
} = authSlice.actions;
export default authSlice.reducer;
