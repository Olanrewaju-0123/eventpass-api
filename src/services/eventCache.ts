import { CacheService } from "./cache"
import type { EventFilters, PaginationOptions } from "../types"

export class EventCacheService {
  private static CACHE_PREFIX = "event:"
  private static LIST_CACHE_PREFIX = "events_list:"
  private static STATS_CACHE_PREFIX = "event_stats:"
  private static CATEGORIES_CACHE_KEY = "event_categories"

  /**
   * Cache event
   */
  static async cacheEvent(eventId: string, eventData: any, ttl = 1800) {
    await CacheService.set(`${this.CACHE_PREFIX}${eventId}`, eventData, { ttl })
  }

  /**
   * Get cached event
   */
  static async getCachedEvent(eventId: string) {
    return CacheService.get(`${this.CACHE_PREFIX}${eventId}`)
  }

  /**
   * Remove event from cache
   */
  static async removeCachedEvent(eventId: string) {
    await CacheService.delete(`${this.CACHE_PREFIX}${eventId}`)
  }

  /**
   * Cache events list
   */
  static async cacheEventsList(filters: EventFilters, pagination: PaginationOptions, data: any, ttl = 900) {
    const cacheKey = this.generateListCacheKey(filters, pagination)
    await CacheService.set(cacheKey, data, { ttl })
  }

  /**
   * Get cached events list
   */
  static async getCachedEventsList(filters: EventFilters, pagination: PaginationOptions) {
    const cacheKey = this.generateListCacheKey(filters, pagination)
    return CacheService.get(cacheKey)
  }

  /**
   * Clear events list cache
   */
  static async clearEventsListCache() {
    const keys = await CacheService.getKeys(`${this.LIST_CACHE_PREFIX}*`)
    if (keys.length > 0) {
      await CacheService.deleteMany(keys)
    }
  }

  /**
   * Cache event statistics
   */
  static async cacheEventStats(eventId: string, stats: any, ttl = 600) {
    await CacheService.set(`${this.STATS_CACHE_PREFIX}${eventId}`, stats, { ttl })
  }

  /**
   * Get cached event statistics
   */
  static async getCachedEventStats(eventId: string) {
    return CacheService.get(`${this.STATS_CACHE_PREFIX}${eventId}`)
  }

  /**
   * Cache event categories
   */
  static async cacheCategories(categories: string[], ttl = 3600) {
    await CacheService.set(this.CATEGORIES_CACHE_KEY, categories, { ttl })
  }

  /**
   * Get cached categories
   */
  static async getCachedCategories() {
    return CacheService.get<string[]>(this.CATEGORIES_CACHE_KEY)
  }

  /**
   * Generate cache key for events list
   */
  private static generateListCacheKey(filters: EventFilters, pagination: PaginationOptions): string {
    const key = JSON.stringify({ filters, pagination })
    return `${this.LIST_CACHE_PREFIX}${Buffer.from(key).toString("base64")}`
  }

  /**
   * Clear all event-related cache
   */
  static async clearAllEventCache() {
    const patterns = [
      `${this.CACHE_PREFIX}*`,
      `${this.LIST_CACHE_PREFIX}*`,
      `${this.STATS_CACHE_PREFIX}*`,
      this.CATEGORIES_CACHE_KEY,
    ]

    for (const pattern of patterns) {
      const keys = await CacheService.getKeys(pattern)
      if (keys.length > 0) {
        await CacheService.deleteMany(keys)
      }
    }
  }
}
