import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";

const MockPaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [countdown, setCountdown] = useState(3);

  const ref = searchParams.get("ref");
  const amount = searchParams.get("amount");
  const provider = searchParams.get("provider");

  useEffect(() => {
    // Simulate payment processing and create event
    const processPayment = async () => {
      try {
        // Call backend to process the mock payment and create event
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
          }/payments/process-mock-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              reference: ref,
              amount: amount,
              provider: provider,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to process payment");
        }

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setIsProcessing(false);
              // Use setTimeout to avoid React router update during render
              setTimeout(() => {
                navigate(`/event-created-success?ref=${ref}`);
              }, 100);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error("Error processing payment:", error);
        // Still redirect even if there's an error
        setTimeout(() => {
          navigate(`/event-created-success?ref=${ref}`);
        }, 1000);
      }
    };

    processPayment();
  }, [navigate, ref, amount, provider]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {isProcessing ? (
          <>
            <div className="mb-6">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Processing Payment...
            </h1>
            <p className="text-gray-600 mb-6">
              Please wait while we process your {provider?.toUpperCase()}{" "}
              payment
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Amount:</strong> ₦{amount?.toLocaleString()}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Reference:</strong> {ref}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 mb-6">
              Your {provider?.toUpperCase()} payment has been processed
              successfully
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>Amount:</strong> ₦{amount?.toLocaleString()}
              </p>
              <p className="text-sm text-green-800">
                <strong>Reference:</strong> {ref}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to your event...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MockPaymentSuccessPage;
