import { Router } from "express";
import { OpayController } from "./opay.controller";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/methods", OpayController.getPaymentMethods);

// Protected routes
router.use(authenticateToken);

// OPay payment routes
router.post(
  "/create",
  OpayController.createPaymentValidation,
  OpayController.createPayment
);

router.get("/status/:reference", OpayController.queryPaymentStatus);

router.post("/cancel/:reference", OpayController.cancelPayment);

export { router as opayRoutes };
