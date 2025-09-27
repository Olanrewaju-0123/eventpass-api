import { Router, Request, Response } from "express";
import { prisma } from "../config/database";
import { HttpResponse } from "../utils/http";
import { asyncHandler } from "../middleware/error";

const router = Router();

router.get(
  "/test-db",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      // Test database connection
      await prisma.$connect();
      
      // Try a simple query
      const userCount = await prisma.user.count();
      
      return HttpResponse.success(res, "Database connection successful", {
        connected: true,
        userCount,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Database test error:", error);
      return HttpResponse.error(res, "Database connection failed", 500, error.message);
    }
  })
);

export { router as testDbRoutes };
