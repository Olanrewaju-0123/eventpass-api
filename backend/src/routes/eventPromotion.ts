import { Router, Request, Response } from "express"
import { EventsService } from "../modules/events/events.service"
import { HttpResponse } from "../utils/http"
import { asyncHandler } from "../middleware/error"

const router = Router()

/**
 * Get event promotion data with QR code
 */
router.get(
  "/:eventId",
  asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params

    const result = await EventsService.generateEventPromotionQR(eventId)

    return HttpResponse.success(res, "Event promotion data retrieved successfully", result)
  }),
)

export { router as eventPromotionRoutes }
