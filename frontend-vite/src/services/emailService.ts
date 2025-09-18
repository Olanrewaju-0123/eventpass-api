import api from "./api";
import type { ApiResponse } from "../types";

export interface TestEmailRequest {
  to: string;
  subject?: string;
  message?: string;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
}

export const emailService = {
  /**
   * Send test email (Admin only)
   */
  sendTestEmail: async (
    data: TestEmailRequest
  ): Promise<ApiResponse<TestEmailResponse>> => {
    const response = await api.post("/emails/test", data);
    return response.data;
  },
};
