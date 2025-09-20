import React, { useState } from "react";
import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
import { useAppSelector } from "../redux";
import {
  X,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Image,
  FileText,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateEventFormData {
  title: string;
  description: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  price: number;
  capacity: number;
  category: string;
  imageUrl?: string;
}

const eventCategories = [
  "Technology",
  "Business",
  "Music",
  "Sports",
  "Education",
  "Health",
  "Food & Drink",
  "Arts & Culture",
  "Networking",
  "Entertainment",
  "Conference",
  "Workshop",
  "Seminar",
  "Festival",
  "Exhibition",
  "Other",
];

// const schema = yup.object({
//   title: yup
//     .string()
//     .required("Event title is required")
//     .min(3, "Title must be at least 3 characters"),
//   description: yup
//     .string()
//     .required("Event description is required")
//     .min(10, "Description must be at least 10 characters"),
//   venue: yup.string().required("Venue is required"),
//   address: yup.string().required("Address is required"),
//   startDate: yup.string().required("Start date is required"),
//   endDate: yup.string().required("End date is required"),
//   startTime: yup.string().required("Start time is required"),
//   endTime: yup.string().required("End time is required"),
//   price: yup
//     .number()
//     .required("Price is required")
//     .min(0, "Price must be positive"),
//   capacity: yup
//     .number()
//     .required("Capacity is required")
//     .min(1, "Capacity must be at least 1"),
//   category: yup.string().required("Category is required"),
//   imageUrl: yup.string().url("Must be a valid URL").optional(),
// });

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
}) => {
  // const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paystack" | "opay">(
    "paystack"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateEventFormData>({
    // resolver: yupResolver(schema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      price: 0,
      capacity: 50,
    },
  });

  const startDate = watch("startDate");
  // const startTime = watch("startTime");

  // Update end date when start date changes
  React.useEffect(() => {
    if (startDate) {
      setValue("endDate", startDate);
    }
  }, [startDate, setValue]);

  const onSubmit = async (data: CreateEventFormData) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      // Validate dates
      if (startDateTime <= new Date()) {
        toast.error("Event start date must be in the future");
        setIsSubmitting(false);
        return;
      }

      if (endDateTime <= startDateTime) {
        toast.error("End date must be after start date");
        setIsSubmitting(false);
        return;
      }

      // Create event data
      const eventData = {
        ...data,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        price: Number(data.price),
        capacity: Number(data.capacity),
      };

      // Initialize payment for event creation (NGN 5000)
      const reference = `event_creation_${Date.now()}`;
      const paymentData = {
        amount: 5000, // NGN 5000 for event creation
        email: user.email,
        currency: "NGN",
        reference: reference,
        metadata: {
          type: "event_creation",
          eventData: eventData,
          userId: user.id,
        },
        callback_url: `${window.location.origin}/event-created-success?ref=${reference}`,
      };

      // Call payment initialization API
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1"
        }/payments/initialize-event-creation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...paymentData,
            provider: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initialize payment");
      }

      const paymentResult = await response.json();

      if (paymentResult.success) {
        // Redirect to payment gateway
        window.location.href = paymentResult.data.authorization_url;
      } else {
        throw new Error(
          paymentResult.message || "Payment initialization failed"
        );
      }
    } catch (error: any) {
      console.error("Event creation error:", error);
      toast.error(error.message || "Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Payment Notice */}
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-blue-800 font-medium">
              Event Creation Fee: ₦5,000
            </p>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            A one-time payment is required to create and publish your event.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit as any)}
          className="p-6 space-y-6"
        >
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("title")}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event title"
              />
            </div>
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your event in detail..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Venue and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register("venue")}
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Venue name"
                />
              </div>
              {errors.venue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.venue.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                {...register("address")}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full address"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register("startDate")}
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register("endDate")}
                  type="date"
                  min={startDate}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                {...register("startTime")}
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                {...register("endTime")}
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Price and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Price (₦) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="100"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  {...register("capacity", { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
              {errors.capacity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                {...register("category")}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">Select category</option>
                {eventCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image URL (Optional)
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                {...register("imageUrl")}
                type="url"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {errors.imageUrl && (
              <p className="text-red-500 text-sm mt-1">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("paystack")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === "paystack"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium text-gray-900">Paystack</div>
                  <div className="text-sm text-gray-600">
                    Card, Bank Transfer
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("opay")}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  paymentMethod === "opay"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="font-medium text-gray-900">OPay</div>
                  <div className="text-sm text-gray-600">Mobile Money</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay ₦5,000 & Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
