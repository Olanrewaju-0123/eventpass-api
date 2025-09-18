import { Router } from "express"
import { QRService } from "../services/qrService"
import { HttpResponse } from "../utils/http"
import { asyncHandler } from "../middleware/error"
import { Request, Response } from 'express';

const router = Router()

/**
 * Generate QR code for event promotion
 */
router.get(
  "/event/:eventId",
  asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    const qrCode = await QRService.generateEventPromotionQR(eventId)

    return HttpResponse.success(res, "QR code generated successfully", { qrCode })
  }),
)

export { router as qrRoutes }
