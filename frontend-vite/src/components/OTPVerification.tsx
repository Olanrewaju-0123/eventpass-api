import React, { useState, useEffect, useRef } from "react";
import { Loader2, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface OTPVerificationProps {
  email: string;
  type: "email_verification" | "login" | "password_reset";
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack?: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  type,
  onVerify,
  onResend,
  onBack,
  title,
  description,
  isLoading = false,
  // error = null,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const defaultTitle =
    type === "email_verification"
      ? "Verify Your Email"
      : type === "password_reset"
      ? "Verify Password Reset"
      : "Complete Login";

  const defaultDescription =
    type === "email_verification"
      ? "We've sent a 6-digit verification code to your email address"
      : type === "password_reset"
      ? "We've sent a 6-digit verification code to reset your password"
      : "We've sent a 6-digit verification code to complete your login";

  useEffect(() => {
    // Start countdown for resend button
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (otpCode?: string) => {
    const otpCodeToVerify = otpCode || otp.join("");

    if (otpCodeToVerify.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await onVerify(otpCodeToVerify);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Verification failed");
      // Clear OTP on error
      setOtp(new Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await onResend();
      toast.success("Verification code sent successfully");

      // Reset countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
          )}

          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {title || defaultTitle}
          </h1>

          <p className="text-gray-600 mb-2">
            {description || defaultDescription}
          </p>

          <p className="text-sm font-medium text-gray-900">{email}</p>
        </div>

        {/* OTP Input */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-center space-x-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </button>
        </div>

        {/* Resend Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Didn't receive the code?</p>

          <button
            onClick={handleResend}
            disabled={resendLoading || countdown > 0}
            className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resendLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <strong>Note:</strong> The verification code will expire in 15
            minutes. Make sure to enter it promptly.
          </p>
        </div>
      </div>
    </div>
  );
};
