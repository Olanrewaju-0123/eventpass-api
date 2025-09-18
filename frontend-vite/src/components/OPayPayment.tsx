import React, { useState, useEffect } from "react";
import {
  QrCode,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { opayService, type OpayPaymentResponse } from "../services/opayService";
import toast from "react-hot-toast";

interface OpayPaymentProps {
  bookingId: string;
  amount: number;
  onPaymentSuccess: (reference: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

const OpayPayment: React.FC<OpayPaymentProps> = ({
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const [paymentData, setPaymentData] = useState<OpayPaymentResponse | null>(
    null
  );
  const [status, setStatus] = useState<
    "idle" | "creating" | "pending" | "success" | "failed"
  >("idle");
  const [isPolling, setIsPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  // Create payment on component mount
  useEffect(() => {
    createPayment();
  }, []);

  // Polling for payment status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPolling && paymentData) {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, paymentData]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timeLeft > 0 && status === "pending") {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && status === "pending") {
      setStatus("failed");
      setIsPolling(false);
      onPaymentError("Payment timeout. Please try again.");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, status]);

  const createPayment = async () => {
    setStatus("creating");
    try {
      const response = await opayService.createPayment({
        bookingId,
        amount,
      });

      if (response.success) {
        setPaymentData(response.data);
        setStatus("pending");
        setIsPolling(true);
        toast.success("Payment created successfully! Please scan the QR code.");
      } else {
        throw new Error(response.message || "Failed to create payment");
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      setStatus("failed");
      onPaymentError(error.message || "Failed to create payment");
      toast.error("Failed to create payment");
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData) return;

    try {
      const response = await opayService.queryPaymentStatus(
        paymentData.reference
      );

      if (response.success) {
        const paymentStatus = response.data.status;

        if (paymentStatus === "SUCCESSFUL") {
          setStatus("success");
          setIsPolling(false);
          onPaymentSuccess(paymentData.reference);
          toast.success("Payment successful!");
        } else if (paymentStatus === "FAILED") {
          setStatus("failed");
          setIsPolling(false);
          onPaymentError("Payment failed");
          toast.error("Payment failed");
        }
      }
    } catch (error: any) {
      console.error("Status check error:", error);
    }
  };

  const handleCancel = async () => {
    if (paymentData) {
      try {
        await opayService.cancelPayment(paymentData.reference);
      } catch (error) {
        console.error("Cancel payment error:", error);
      }
    }
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = () => {
    switch (status) {
      case "creating":
        return <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="h-8 w-8 text-yellow-600" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "failed":
        return <XCircle className="h-8 w-8 text-red-600" />;
      default:
        return <QrCode className="h-8 w-8 text-blue-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "creating":
        return "Creating payment...";
      case "pending":
        return "Waiting for payment...";
      case "success":
        return "Payment successful!";
      case "failed":
        return "Payment failed";
      default:
        return "Ready to pay";
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">{getStatusIcon()}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          OPay Wallet Payment
        </h3>
        <p className="text-gray-600">Amount: ₦{amount.toLocaleString()}</p>
      </div>

      {/* Payment Status */}
      <div className="text-center mb-6">
        <p className="text-lg font-medium text-gray-900">
          {getStatusMessage()}
        </p>
        {status === "pending" && (
          <p className="text-sm text-gray-500 mt-2">
            Time remaining: {formatTime(timeLeft)}
          </p>
        )}
      </div>

      {/* QR Code */}
      {paymentData && status === "pending" && (
        <div className="text-center mb-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <img
              src={paymentData.qrCode}
              alt="OPay QR Code"
              className="mx-auto max-w-full h-auto"
              style={{ maxHeight: "200px" }}
            />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                How to pay:
              </span>
            </div>
            <ol className="text-sm text-blue-700 text-left space-y-1">
              <li>1. Open your OPay app</li>
              <li>2. Tap "Scan QR Code"</li>
              <li>3. Scan the QR code above</li>
              <li>4. Confirm payment in your app</li>
            </ol>
          </div>
        </div>
      )}

      {/* Payment Reference */}
      {paymentData && (
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-xs text-gray-500 mb-1">Payment Reference:</p>
          <p className="text-sm font-mono text-gray-900 break-all">
            {paymentData.reference}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        {status === "pending" && (
          <button
            onClick={checkPaymentStatus}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
          </button>
        )}

        {status === "failed" && (
          <button
            onClick={createPayment}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}

        <button
          onClick={handleCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Having trouble? Make sure you have the OPay app installed and
          sufficient balance.
        </p>
      </div>
    </div>
  );
};

export default OpayPayment;







