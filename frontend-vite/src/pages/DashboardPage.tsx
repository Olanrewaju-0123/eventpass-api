import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../redux";
import DashboardNavbar from "../components/DashboardNavbar";
import CreateEventModal from "../components/CreateEventModal";
import {
  Calendar,
  Ticket,
  Star,
  TrendingUp,
  Plus,
  Search,
  MapPin,
  Users,
  Award,
  Heart,
  Eye,
  Download,
  Share2,
} from "lucide-react";

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [todayEventsCount, setTodayEventsCount] = useState(0);

  // Fetch today's events count
  useEffect(() => {
    const fetchTodayEvents = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
          }/events?startDate=${today}&endDate=${today}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTodayEventsCount(data.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch today's events:", error);
      }
    };

    fetchTodayEvents();
  }, []);

  // Mock data - in real app, this would come from Redux/API
  const stats = {
    totalEvents: todayEventsCount,
    totalBookings: 8,
    totalSpent: 24500,
    favoriteCategories: 3,
  };

  const recentEvents = [
    {
      id: 1,
      title: "Tech Conference 2024",
      date: "2024-02-15",
      location: "Lagos, Nigeria",
      price: 15000,
      image: "/api/placeholder/300/200",
      category: "Technology",
      attendees: 500,
      rating: 4.8,
    },
    {
      id: 2,
      title: "Music Festival",
      date: "2024-02-20",
      location: "Abuja, Nigeria",
      price: 8000,
      image: "/api/placeholder/300/200",
      category: "Music",
      attendees: 2000,
      rating: 4.9,
    },
    {
      id: 3,
      title: "Business Summit",
      date: "2024-02-25",
      location: "Port Harcourt, Nigeria",
      price: 12000,
      image: "/api/placeholder/300/200",
      category: "Business",
      attendees: 300,
      rating: 4.7,
    },
  ];

  const recentBookings = [
    {
      id: 1,
      eventTitle: "Tech Conference 2024",
      date: "2024-02-15",
      status: "confirmed",
      tickets: 2,
      totalAmount: 30000,
      bookingRef: "EP-2024-001",
    },
    {
      id: 2,
      eventTitle: "Music Festival",
      date: "2024-02-20",
      status: "pending",
      tickets: 1,
      totalAmount: 8000,
      bookingRef: "EP-2024-002",
    },
  ];

  const quickActions = [
    {
      title: "Discover Events",
      description: "Find amazing events near you",
      icon: Search,
      link: "/events",
      color: "bg-blue-500",
    },
    {
      title: "Create Event",
      description: "Host your own event",
      icon: Plus,
      link: "#",
      color: "bg-green-500",
      onClick: () => setIsCreateEventModalOpen(true),
    },
    {
      title: "My Bookings",
      description: "View your tickets",
      icon: Ticket,
      link: "/my-bookings",
      color: "bg-purple-500",
    },
    {
      title: "QR Scanner",
      description: "Scan event tickets",
      icon: Eye,
      link: "/qr-scanner",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <DashboardNavbar />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your events today
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Events
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEvents}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12% from last month
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bookings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Ticket className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% from last month
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₦{stats.totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15% from last month
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.favoriteCategories}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +3 new categories
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                {quickActions.map((action, index) =>
                  action.onClick ? (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="w-full flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group text-left"
                    >
                      <div
                        className={`p-3 rounded-lg ${action.color} mr-4 group-hover:scale-110 transition-transform duration-200`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <Link
                      key={index}
                      to={action.link}
                      className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div
                        className={`p-3 rounded-lg ${action.color} mr-4 group-hover:scale-110 transition-transform duration-200`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Recent Events & Bookings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Events */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommended Events
                </h2>
                <Link
                  to="/events"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                >
                  View all
                  <TrendingUp className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                        <MapPin className="h-4 w-4 ml-3 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees} attendees
                          <Star className="h-4 w-4 ml-3 mr-1 text-yellow-400" />
                          {event.rating}
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          ₦{event.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Heart className="h-4 w-4" />
                      </button>
                      <Link
                        to={`/events/${event.id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Bookings
                </h2>
                <Link
                  to="/my-bookings"
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                >
                  View all
                  <Ticket className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <Ticket className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {booking.eventTitle}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.date).toLocaleDateString()}
                          <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {booking.tickets} ticket
                          {booking.tickets > 1 ? "s" : ""} • Ref:{" "}
                          {booking.bookingRef}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₦{booking.totalAmount.toLocaleString()}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
