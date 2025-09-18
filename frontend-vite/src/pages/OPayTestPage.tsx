import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OpayPayment from "../components/OPayPayment";
import { CreditCard, QrCode, ArrowLeft } from "lucide-react";

const OpayTestPage: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock booking data for testing
  const mockBooking = {
    id: "test_booking_123",
    amount: 5000, // ₦50.00
    eventTitle: "Test Event",
  };

  const handlePaymentSuccess = (reference: string) => {
    setPaymentResult(`Payment successful! Reference: ${reference}`);
    setShowPayment(false);
    // In real app, redirect to success page or show confirmation
  };

  const handlePaymentError = (error: string) => {
    setPaymentResult(`Payment failed: ${error}`);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setPaymentResult("Payment cancelled by user");
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowPayment(false)}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test
          </button>
          <OpayPayment
            bookingId={mockBooking.id}
            amount={mockBooking.amount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                OPay Payment Test
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Test the OPay integration flow
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Booking Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Test Booking Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-mono text-sm">{mockBooking.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Event</p>
              <p className="font-medium">{mockBooking.eventTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-bold text-lg">
                ₦{mockBooking.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* OPay Payment */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  OPay Wallet QR
                </h3>
                <p className="text-sm text-gray-500">Pay with OPay app</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Scan QR code with your OPay app to complete payment instantly.
            </p>
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Pay with OPay
            </button>
          </div>

          {/* Other Payment Method (Placeholder) */}
          <div className="bg-white rounded-lg shadow p-6 opacity-50">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <CreditCard className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Paystack</h3>
                <p className="text-sm text-gray-500">Card payment</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Pay with your debit/credit card through Paystack.
            </p>
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Payment Result */}
        {paymentResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Payment Result
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-mono">{paymentResult}</p>
            </div>
            <button
              onClick={() => setPaymentResult(null)}
              className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Result
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Testing Instructions
          </h3>
          <ol className="text-blue-800 space-y-2">
            <li>1. Make sure your backend server is running on port 3000</li>
            <li>2. Ensure you have OPay credentials in your .env file</li>
            <li>3. Click "Pay with OPay" to start the payment flow</li>
            <li>4. Use the OPay app to scan the QR code (test mode)</li>
            <li>5. Check the payment result and webhook processing</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default OpayTestPage;







