import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useAppSelector,
  useAppDispatch,
  loginUser,
  completeLoginWithOTP,
  resendLoginOTP,
  resetAuthState,
} from "../redux";
import { OTPVerification } from "../components/OTPVerification";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import LogoImage from "../assets/logo.png";

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading, otpSent, pendingEmail } = useAppSelector(
    (state) => state.auth
  );

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await dispatch(
        loginUser({
          email: data.email,
          password: data.password,
        })
      ).unwrap();

      // Redux will handle state updates
    } catch (error: any) {
      // Error is handled by the Redux slice
    }
  };

  const handleOTPVerify = async (otp: string) => {
    try {
      const result = await dispatch(
        completeLoginWithOTP({
          email: pendingEmail!,
          otp,
        })
      ).unwrap();

      if (result) {
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      throw error; // Let OTPVerification component handle the error
    }
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(resendLoginOTP(pendingEmail!)).unwrap();
    } catch (error: any) {
      throw error; // Let OTPVerification component handle the error
    }
  };

  const handleBackToForm = () => {
    dispatch(resetAuthState());
  };

  if (otpSent && pendingEmail) {
    return (
      <OTPVerification
        email={pendingEmail}
        type="login"
        onVerify={handleOTPVerify}
        onResend={handleResendOTP}
        onBack={handleBackToForm}
        title="Complete Login"
        description="We've sent a 6-digit verification code to complete your login"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center">
            <img
              src={LogoImage}
              alt="EventPass"
              className="h-8 w-auto object-contain"
              style={{
                filter: "hue-rotate(200deg) saturate(1.2) brightness(0.9)",
              }}
            />
          </Link>
          <Link
            to="/register"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Left Section - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <div className="text-center">
              <img
                src={LogoImage}
                alt="EventPass"
                className="h-20 w-auto mx-auto mb-8 object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
              <p className="text-xl text-blue-100 mb-8">
                Sign in to continue your event journey
              </p>
              <div className="space-y-4 text-left">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Access your bookings and tickets</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Discover personalized events</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Manage your profile and preferences</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <img
                  src={LogoImage}
                  alt="EventPass"
                  className="h-12 w-auto mx-auto object-contain"
                  style={{
                    filter: "hue-rotate(200deg) saturate(1.2) brightness(0.9)",
                  }}
                />
              </Link>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-gray-600">
                Welcome back! Please enter your details
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100 transform hover:scale-[1.02] transition-transform duration-200">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
