import api from "./api";
import type { ApiResponse } from "../types";

export interface CacheKeysResponse {
  keys: string[];
  pattern: string;
}

export interface CacheOperationResponse {
  success: boolean;
  message: string;
}

export const cacheService = {
  /**
   * Clear all cache (Admin only)
   */
  clearAllCache: async (): Promise<ApiResponse<CacheOperationResponse>> => {
    const response = await api.delete("/cache/clear");
    return response.data;
  },

  /**
   * Get cache keys by pattern (Admin only)
   */
  getCacheKeys: async (
    pattern: string = "*"
  ): Promise<ApiResponse<CacheKeysResponse>> => {
    const response = await api.get("/cache/keys", {
      params: { pattern },
    });
    return response.data;
  },

  /**
   * Delete specific cache key (Admin only)
   */
  deleteCacheKey: async (
    key: string
  ): Promise<ApiResponse<CacheOperationResponse>> => {
    const response = await api.delete(`/cache/key/${key}`);
    return response.data;
  },
};
