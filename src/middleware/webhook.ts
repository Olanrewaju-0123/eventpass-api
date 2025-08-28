import type { Request, Response, NextFunction } from "express"
import { CryptoUtils } from "../utils/crypto"
import { config } from "../config/env"
import { HttpResponse } from "../utils/http"

export const verifyPaystackWebhook = (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers["x-paystack-signature"] as string

    if (!signature) {
      return HttpResponse.unauthorized(res, "Missing webhook signature")
    }

    const body = JSON.stringify(req.body)
    const isValid = CryptoUtils.verifyHmacSignature(body, signature, config.PAYSTACK_WEBHOOK_SECRET)

    if (!isValid) {
      return HttpResponse.unauthorized(res, "Invalid webhook signature")
    }

    next()
  } catch (error) {
    return HttpResponse.unauthorized(res, "Webhook verification failed")
  }
}
