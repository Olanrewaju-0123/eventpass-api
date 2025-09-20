import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { authService } from "../services/authService";
import { eventService } from "../services/eventService";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { opayService } from "../services/opayService";
import { qrService } from "../services/qrService";
import { emailService } from "../services/emailService";
import { cacheService } from "../services/cacheService";
import { eventPromotionService } from "../services/eventPromotionService";
import { paymentConfirmationService } from "../services/paymentConfirmationService";
import toast from "react-hot-toast";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message: string;
  duration?: number;
}

const APITestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  const runTest = async (
    testName: string,
    testFn: () => Promise<any>
  ): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      return {
        name: testName,
        status: "success",
        message: "Test passed",
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        name: testName,
        status: "error",
        message:
          error.response?.data?.message || error.message || "Test failed",
        duration,
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      // Auth Tests
      {
        name: "Auth - Get Current User",
        test: () => authService.getCurrentUser(),
      },
      {
        name: "Auth - Get All Users (Admin)",
        test: () => authService.getAllUsers(),
      },

      // Event Tests
      {
        name: "Events - Get All Events",
        test: () => eventService.getEvents(),
      },
      {
        name: "Events - Get Event by ID",
        test: () => eventService.getEventById("test-event-id"),
      },

      // Booking Tests
      {
        name: "Bookings - Get User Bookings",
        test: () => bookingService.getMyBookings(),
      },

      // Payment Tests
      {
        name: "Payments - Get Payment Statistics",
        test: () => paymentService.getPaymentStatistics(),
      },

      // OPay Tests
      {
        name: "OPay - Get Payment Methods",
        test: () => opayService.getPaymentMethods(),
      },

      // QR Tests
      {
        name: "QR - Generate Event QR",
        test: () => qrService.generateEventQR("test-event-id"),
      },

      // Event Promotion Tests
      {
        name: "Event Promotion - Get Promotion Data",
        test: () => eventPromotionService.getEventPromotion("test-event-id"),
      },

      // Payment Confirmation Tests
      {
        name: "Payment Confirmation - Get Confirmation Data",
        test: () =>
          paymentConfirmationService.getPaymentConfirmation("test-payment-ref"),
      },

      // Admin Tests (these will likely fail without admin token)
      {
        name: "Email - Send Test Email (Admin)",
        test: () =>
          emailService.sendTestEmail({
            to: "test@example.com",
            subject: "Test",
            message: "Test message",
          }),
      },
      {
        name: "Cache - Get Cache Keys (Admin)",
        test: () => cacheService.getCacheKeys(),
      },
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      const result = await runTest(test.name, test.test);
      results.push(result);
      setTestResults([...results]);

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    setIsRunning(false);

    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    toast.success(
      `Tests completed: ${successCount} passed, ${errorCount} failed`
    );
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                API Connection Test
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Test all backend API connections
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
        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Run API Tests</h2>
              <p className="text-sm text-gray-600 mt-1">
                Test all API endpoints to verify frontend-backend connectivity
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Test Results
              </h3>
              <p className="text-sm text-gray-600">
                {testResults.filter((r) => r.status === "success").length}{" "}
                passed, {testResults.filter((r) => r.status === "error").length}{" "}
                failed
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-6 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(result.status)}
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {result.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {result.message}
                        </p>
                      </div>
                    </div>
                    {result.duration && (
                      <span className="text-xs text-gray-500">
                        {result.duration}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Testing Instructions
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>1. Make sure your backend server is running on port 3000</li>
            <li>2. Ensure you're logged in to test authenticated endpoints</li>
            <li>3. Some tests may fail if you don't have admin privileges</li>
            <li>4. Check the browser console for detailed error messages</li>
            <li>5. Verify your API base URL is correct in the services</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APITestPage;
