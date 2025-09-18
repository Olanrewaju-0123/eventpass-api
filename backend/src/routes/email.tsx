import { Router } from "express"
import { Request, Response } from "express"
import { emailService } from "../services/emailService"
import { HttpResponse } from "../utils/http"
import { authenticateToken, requireAdmin } from "../middleware/auth"
import { asyncHandler } from "../middleware/error"

// import type { Request, Response } from "express"

const router = Router()

// Admin only routes
router.use(authenticateToken, requireAdmin)

// Interface for test email request body
interface TestEmailRequest {
  to: string
  subject?: string
  message?: string
}

/**
 * Send test email
 */
router.post(
  "/test",
  asyncHandler(async (req: Request<{}, {}, TestEmailRequest>, res: Response) => {
    const { to, subject = "Test Email", message = "This is a test email from EventPass API" } = req.body

    if (!to) {
      return HttpResponse.badRequest(res, "Recipient email is required")
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Email</h2>
        <p>${message}</p>
        <p>Best regards,<br>The EventPass Team</p>
      </div>
    `

    const success = await emailService.sendEmail({
      to,
      subject,
      html,
    })

    if (success) {
      return HttpResponse.success(res, "Test email sent successfully")
    } else {
      return HttpResponse.internalError(res, "Failed to send test email")
    }
  }),
)

export { router as emailRoutes }
