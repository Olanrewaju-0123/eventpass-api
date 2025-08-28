import { redisClient } from "../config/redis"
import type { CacheOptions } from "../types"

export class CacheService {
  private static DEFAULT_TTL = 3600 // 1 hour in seconds

  /**
   * Set cache value
   */
  static async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.DEFAULT_TTL
      const serializedValue = JSON.stringify(value)
      await redisClient.setEx(key, ttl, serializedValue)
    } catch (error) {
      console.error("Cache set error:", error)
      // Don't throw error, just log it
    }
  }

  /**
   * Get cache value
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redisClient.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  /**
   * Delete cache value
   */
  static async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key)
    } catch (error) {
      console.error("Cache delete error:", error)
    }
  }

  /**
   * Delete multiple cache values
   */
  static async deleteMany(keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await redisClient.del(keys)
      }
    } catch (error) {
      console.error("Cache delete many error:", error)
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redisClient.exists(key)
      return result === 1
    } catch (error) {
      console.error("Cache exists error:", error)
      return false
    }
  }

  /**
   * Get keys by pattern
   */
  static async getKeys(pattern: string): Promise<string[]> {
    try {
      return await redisClient.keys(pattern)
    } catch (error) {
      console.error("Cache get keys error:", error)
      return []
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      await redisClient.flushAll()
    } catch (error) {
      console.error("Cache clear error:", error)
    }
  }

  /**
   * Set cache with expiration time
   */
  static async setWithExpiry(key: string, value: any, seconds: number): Promise<void> {
    await this.set(key, value, { ttl: seconds })
  }

  /**
   * Increment cache value
   */
  static async increment(key: string, by = 1): Promise<number> {
    try {
      return await redisClient.incrBy(key, by)
    } catch (error) {
      console.error("Cache increment error:", error)
      return 0
    }
  }

  /**
   * Get TTL of a key
   */
  static async getTTL(key: string): Promise<number> {
    try {
      return await redisClient.ttl(key)
    } catch (error) {
      console.error("Cache get TTL error:", error)
      return -1
    }
  }
}
