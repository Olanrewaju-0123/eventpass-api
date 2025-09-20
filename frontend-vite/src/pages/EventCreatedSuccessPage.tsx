import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  CheckCircle,
  Share2,
  QrCode,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Copy,
  Download,
  Eye,
  TrendingUp,
  Clock,
  // Star,
} from "lucide-react";
import toast from "react-hot-toast";

interface EventData {
  id: string;
  title: string;
  description: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  category: string;
  imageUrl?: string;
  bookingUrl: string;
  qrCode: string;
  statistics: {
    totalBookings: number;
    totalRevenue: number;
    availableTickets: number;
    soldPercentage: number;
  };
}

const EventCreatedSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "qr" | "stats">(
    "details"
  );

  const reference = searchParams.get("ref");

  useEffect(() => {
    if (reference) {
      fetchEventData(reference);
    } else {
      setError("No payment reference found");
      setLoading(false);
    }
  }, [reference]);

  const fetchEventData = async (ref: string) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
        }/events/created/${ref}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch event data");
      }

      const data = await response.json();
      setEventData(data.data);
    } catch (error: any) {
      console.error("Error fetching event data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareEvent = () => {
    if (navigator.share && eventData) {
      navigator.share({
        title: eventData.title,
        text: `Check out this amazing event: ${eventData.title}`,
        url: eventData.bookingUrl,
      });
    } else {
      copyToClipboard(eventData?.bookingUrl || "", "Event link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your event details...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Event Created Successfully!
                </h1>
                <p className="text-gray-600">
                  Your event is now live and ready for bookings
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Overview Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {eventData.title}
              </h2>
              <p className="text-gray-600 mb-4">{eventData.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>
                    {new Date(eventData.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{eventData.venue}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>₦{eventData.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={shareEvent}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(eventData.bookingUrl, "Booking URL")
                  }
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </button>
                <Link
                  to={eventData.bookingUrl}
                  target="_blank"
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Event
                </Link>
              </div>
            </div>

            {eventData.imageUrl && (
              <div className="ml-6">
                <img
                  src={eventData.imageUrl}
                  alt={eventData.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "details", label: "Event Details", icon: Calendar },
                { id: "qr", label: "QR Code", icon: QrCode },
                { id: "stats", label: "Statistics", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Event Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{eventData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">
                          {eventData.category}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Venue:</span>
                        <span className="font-medium">{eventData.venue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium">{eventData.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {new Date(eventData.startDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">
                          {new Date(eventData.endDate).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                          ₦{eventData.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">
                          {eventData.capacity} tickets
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Booking Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Booking URL
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={eventData.bookingUrl}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(
                                eventData.bookingUrl,
                                "Booking URL"
                              )
                            }
                            className="px-3 py-2 bg-gray-200 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-300 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          Share Instructions
                        </h4>
                        <p className="text-sm text-blue-800">
                          Share the booking URL with your audience. They can
                          click the link to view event details and book tickets
                          directly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "qr" && (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Event QR Code
                </h3>
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <img
                      src={eventData.qrCode}
                      alt="Event QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Scan this QR code to quickly access your event booking page
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = eventData.qrCode;
                        link.download = `${eventData.title}-qr-code.png`;
                        link.click();
                      }}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </button>
                    <button
                      onClick={() =>
                        copyToClipboard(eventData.bookingUrl, "QR Code URL")
                      }
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Real-time Statistics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-600">
                          Total Bookings
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {eventData.statistics.totalBookings}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-600">
                          Total Revenue
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          ₦{eventData.statistics.totalRevenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-yellow-600">
                          Available Tickets
                        </p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {eventData.statistics.availableTickets}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-purple-600">
                          Sold Percentage
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          {eventData.statistics.soldPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Sales Progress
                  </h4>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${eventData.statistics.soldPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {eventData.statistics.totalBookings} of {eventData.capacity}{" "}
                    tickets sold
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCreatedSuccessPage;
