import React, { useState } from "react";
import { emailService } from "../../services/emailService";
import LoadingSpinner from "../LoadingSpinner";
import { Mail, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export const EmailTester: React.FC = () => {
  const [formData, setFormData] = useState({
    to: "",
    subject: "Test Email from EventPass",
    message:
      "This is a test email to verify the email service is working correctly.",
  });
  const [loading, setLoading] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.to.trim()) {
      toast.error("Please enter a recipient email address");
      return;
    }

    try {
      setLoading(true);
      await emailService.sendTestEmail(formData);
      toast.success("Test email sent successfully!");
      setLastSent(formData.to);
      setFormData((prev) => ({ ...prev, to: "" }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send test email");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Mail className="h-6 w-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">
          Email Service Tester
        </h2>
      </div>

      {lastSent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">
              Last test email sent successfully to: <strong>{lastSent}</strong>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="to"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipient Email *
          </label>
          <input
            type="email"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            placeholder="Enter email address to send test email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.to.trim()}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          Email Service Info
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • This will send a real email using your configured email service
          </li>
          <li>
            • Make sure your email configuration is correct in the backend
          </li>
          <li>
            • Check your email provider's logs if emails are not being delivered
          </li>
          <li>• This feature is only available to admin users</li>
        </ul>
      </div>
    </div>
  );
};
