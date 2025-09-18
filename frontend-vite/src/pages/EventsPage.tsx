import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useGetEventsQuery, useGetEventCategoriesQuery } from "../redux";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { type Event } from "../types";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
} from "lucide-react";

const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Get filter parameters from URL
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const state = searchParams.get("state") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Fetch events
  const {
    data: eventsData,
    isLoading,
    error,
  } = useGetEventsQuery({
    page,
    limit,
    search: search || undefined,
  });

  // Fetch categories
  const { data: categoriesData } = useGetEventCategoriesQuery();

  const updateFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearch = (searchTerm: string) => {
    updateFilters({ search: searchTerm });
  };

  const handleCategoryChange = (categoryValue: string) => {
    updateFilters({ category: categoryValue });
  };

  const handleLocationChange = (cityValue: string, stateValue: string) => {
    updateFilters({ city: cityValue, state: stateValue });
  };

  const handlePriceChange = (min: string, max: string) => {
    updateFilters({ minPrice: min, maxPrice: max });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <Calendar className="w-12 h-12 text-primary-600" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {event.description}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {formatDate(event.startDate)} at {formatTime(event.startDate)}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {event.venue}, {event.city}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>
              {event.available} of {event.capacity} tickets available
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center text-lg font-bold text-primary-600">
            <DollarSign className="w-4 h-4 mr-1" />
            {event.price === 0 ? "Free" : `$${event.price}`}
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn-primary text-sm px-4 py-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  const EventListItem: React.FC<{ event: Event }> = ({ event }) => (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-48 aspect-video bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {event.title}
            </h3>
            <p className="text-gray-600 line-clamp-2 mt-1">
              {event.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {formatDate(event.startDate)} at {formatTime(event.startDate)}
              </span>
            </div>

            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>
                {event.venue}, {event.city}
              </span>
            </div>

            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>
                {event.available} of {event.capacity} available
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center text-xl font-bold text-primary-600">
              <DollarSign className="w-5 h-5 mr-1" />
              {event.price === 0 ? "Free" : `$${event.price}`}
            </div>

            <Link to={`/events/${event.id}`} className="btn-primary px-6 py-2">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <Layout>
        <div className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error loading events
            </h1>
            <p className="text-gray-600">
              Something went wrong while loading events. Please try again.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Events
          </h1>
          <p className="text-gray-600">
            Find amazing events happening near you
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-primary-100 text-primary-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Categories</option>
                    {categoriesData?.data?.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) =>
                      handleLocationChange(e.target.value, state)
                    }
                    className="input-field"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) =>
                      handlePriceChange(e.target.value, maxPrice)
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) =>
                      handlePriceChange(minPrice, e.target.value)
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button onClick={clearFilters} className="btn-secondary mr-2">
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Events Grid/List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : eventsData?.data?.items?.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {eventsData?.data?.items?.length || 0} of{" "}
                {eventsData?.data?.pagination?.total || 0} events
              </p>
            </div>

            {/* Events Display */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
              }
            >
              {eventsData?.data?.items?.map((event) =>
                viewMode === "grid" ? (
                  <EventCard key={event.id} event={event} />
                ) : (
                  <EventListItem key={event.id} event={event} />
                )
              )}
            </div>

            {/* Pagination */}
            {eventsData?.data?.pagination?.totalPages &&
              eventsData.data.pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateFilters({ page: (page - 1).toString() })
                      }
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {page} of {eventsData?.data?.pagination?.totalPages}
                    </span>

                    <button
                      onClick={() =>
                        updateFilters({ page: (page + 1).toString() })
                      }
                      disabled={
                        page === eventsData?.data?.pagination?.totalPages
                      }
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;
