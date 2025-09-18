import React, { useState, useEffect } from "react";
import { qrService } from "../services/qrService";
import LoadingSpinner from "./LoadingSpinner";
import { QrCode, Download, Share2, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface QRCodeDisplayProps {
  eventId: string;
  eventTitle?: string;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  eventId,
  eventTitle,
  className = "",
}) => {
  const [qrCode, setQrCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await qrService.generateEventQR(eventId);
        setQrCode(response.data.qrCode);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to generate QR code");
        toast.error("Failed to generate QR code");
      } finally {
        setLoading(false);
      }
    };

    generateQR();
  }, [eventId]);

  const handleDownload = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `event-${eventId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded!");
  };

  const handleShare = async () => {
    if (!qrCode) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `QR Code for ${eventTitle || "Event"}`,
          text: `Check out this event!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Event link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Failed to share");
    }
  };

  const handleCopyQR = async () => {
    if (!qrCode) return;

    try {
      await navigator.clipboard.writeText(qrCode);
      toast.success("QR code URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy QR code");
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-2 text-gray-600">Generating QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {eventTitle ? `QR Code for ${eventTitle}` : "Event QR Code"}
        </h3>

        <div className="mb-4">
          <img
            src={qrCode}
            alt="Event QR Code"
            className="mx-auto max-w-full h-auto rounded-lg border-2 border-gray-200"
            style={{ maxHeight: "300px" }}
          />
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </button>

          <button
            onClick={handleShare}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>

          <button
            onClick={handleCopyQR}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Scan this QR code to view event details
        </p>
      </div>
    </div>
  );
};
