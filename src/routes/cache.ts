import { Router, Request, Response } from "express"
import { CacheService } from "../services/cache"
import { HttpResponse } from "../utils/http"
import { authenticateToken, requireAdmin } from "../middleware/auth"
import { asyncHandler } from "../middleware/error"

const router = Router()

// Admin only routes
router.use(authenticateToken, requireAdmin)

/**
 * Clear all cache
 */
router.delete(
  "/clear",
  asyncHandler(async (req: Request, res: Response) => {
    await CacheService.clear()
    return HttpResponse.success(res, "Cache cleared successfully")
  }),
)

/**
 * Get cache keys by pattern
 */
router.get(
  "/keys",
  asyncHandler(async (req: Request, res: Response) => {
    const { pattern = "*" } = req.query
    const keys = await CacheService.getKeys(pattern as string)
    return HttpResponse.success(res, "Cache keys retrieved successfully", keys)
  }),
)

/**
 * Delete cache key
 */
router.delete(
  "/key/:key",
  asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params
    await CacheService.delete(key)
    return HttpResponse.success(res, "Cache key deleted successfully")
  }),
)

export { router as cacheRoutes }
