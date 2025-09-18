import React, { useState, useEffect } from "react";
import { cacheService } from "../../services/cacheService";
import LoadingSpinner from "../LoadingSpinner";
import { Trash2, RefreshCw, Search, Key } from "lucide-react";
import toast from "react-hot-toast";

export const CacheManagement: React.FC = () => {
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPattern, setSearchPattern] = useState("*");
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const loadCacheKeys = async (pattern: string = "*") => {
    try {
      setLoading(true);
      const response = await cacheService.getCacheKeys(pattern);
      setCacheKeys(response.data.keys);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load cache keys");
    } finally {
      setLoading(false);
    }
  };

  const clearAllCache = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all cache? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await cacheService.clearAllCache();
      toast.success("All cache cleared successfully!");
      loadCacheKeys(searchPattern);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to clear cache");
    } finally {
      setLoading(false);
    }
  };

  const deleteCacheKey = async (key: string) => {
    try {
      setDeletingKey(key);
      await cacheService.deleteCacheKey(key);
      toast.success(`Cache key "${key}" deleted successfully!`);
      loadCacheKeys(searchPattern);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to delete cache key"
      );
    } finally {
      setDeletingKey(null);
    }
  };

  useEffect(() => {
    loadCacheKeys();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Cache Management</h2>
        <button
          onClick={() => loadCacheKeys(searchPattern)}
          disabled={loading}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Search and Clear All */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchPattern}
              onChange={(e) => setSearchPattern(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && loadCacheKeys(searchPattern)
              }
              placeholder="Search cache keys (e.g., user:*, event:*)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={() => loadCacheKeys(searchPattern)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Search
        </button>
        <button
          onClick={clearAllCache}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </button>
      </div>

      {/* Cache Keys List */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            Cache Keys ({cacheKeys.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : cacheKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Key className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No cache keys found</p>
            <p className="text-sm">Try a different search pattern</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {cacheKeys.map((key, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <code className="text-sm text-gray-800 font-mono break-all">
                    {key}
                  </code>
                </div>
                <button
                  onClick={() => deleteCacheKey(key)}
                  disabled={deletingKey === key}
                  className="ml-4 p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  {deletingKey === key ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>Tip:</strong> Use patterns like <code>user:*</code>,{" "}
          <code>event:*</code>, or <code>*</code> to search cache keys.
        </p>
      </div>
    </div>
  );
};
