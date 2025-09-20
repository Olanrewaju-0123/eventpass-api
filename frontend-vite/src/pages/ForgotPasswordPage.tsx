import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useAppSelector,
  useAppDispatch,
  forgotPassword,
  verifyResetOTP,
} from "../redux";
import { OTPVerification } from "../components/OTPVerification";
import { ArrowLeft, Mail } from "lucide-react";
import LogoImage from "../assets/logo.png";

// Validation schema
const schema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email"),
});

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPasswordPage: React.FC = () => {
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await dispatch(forgotPassword(data.email)).unwrap();
      if (result) {
        setResetEmail(data.email);
        setShowOtpVerification(true);
      }
    } catch (error: any) {
      // Error is handled by the Redux slice
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const result = await dispatch(
        verifyResetOTP({
          email: resetEmail,
          otp,
        })
      ).unwrap();

      if (result) {
        // Navigate to reset password page with email
        navigate("/reset-password", {
          state: { email: resetEmail, otp },
        });
      }
    } catch (error: any) {
      throw error; // Let OTPVerification component handle the error
    }
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(forgotPassword(resetEmail)).unwrap();
    } catch (error: any) {
      throw error; // Let OTPVerification component handle the error
    }
  };

  const handleBack = () => {
    setShowOtpVerification(false);
    setResetEmail("");
  };

  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Section - Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center p-8">
            <div className="mb-8">
              <img
                src={LogoImage}
                alt="EventPass Logo"
                className="h-24 w-auto mx-auto mb-6"
                style={{
                  filter: "hue-rotate(200deg) saturate(1.2) brightness(0.9)",
                }}
              />
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Welcome to EventPass
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Your gateway to amazing events. Discover, book, and enjoy
                unforgettable experiences.
              </p>
            </div>
          </div>

          {/* Right Section - OTP Verification */}
          <div className="flex items-center justify-center">
            <OTPVerification
              email={resetEmail}
              type="email_verification"
              onVerify={handleVerifyOTP}
              onResend={handleResendOTP}
              isLoading={isLoading}
              error={null}
              onBack={handleBack}
              title="Verify Password Reset"
              description="Enter the OTP sent to your email to continue with password reset"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Section - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center p-8">
          <div className="mb-8">
            <img
              src={LogoImage}
              alt="EventPass Logo"
              className="h-24 w-auto mx-auto mb-6"
              style={{
                filter: "hue-rotate(200deg) saturate(1.2) brightness(0.9)",
              }}
            />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to EventPass
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Your gateway to amazing events. Discover, book, and enjoy
              unforgettable experiences.
            </p>
          </div>
        </div>

        {/* Right Section - Forgot Password Form */}
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100 transform hover:scale-[1.02] transition-transform duration-200 w-full max-w-md">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <img
                src={LogoImage}
                alt="EventPass Logo"
                className="h-16 w-auto mx-auto mb-4"
                style={{
                  filter: "hue-rotate(200deg) saturate(1.2) brightness(0.9)",
                }}
              />
              <h1 className="text-2xl font-bold text-gray-800">
                Forgot Password
              </h1>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600">
                No worries! Enter your email and we'll send you a reset code.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending Reset Code...
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5 mr-2" />
                    Send Reset Code
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>

            {/* Additional Help */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
