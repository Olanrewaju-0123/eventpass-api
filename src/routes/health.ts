import { Router } from "express"
import type { Request, Response } from "express"
import { HttpResponse } from "@/utils/http"

const router = Router()

router.get("/health", (req: Request, res: Response) => {
  return HttpResponse.success(
    res,
    "Service is healthy",
    {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.API_VERSION || "v1",
    },
  )
})

export default router
