import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticateToken } from "../../middleware/auth";
import {
  authRateLimiter,
  passwordResetRateLimiter,
} from "../../middleware/rateLimit";

const router = Router();

// Public routes
router.post(
  "/register",
  authRateLimiter,
  AuthController.registerValidation,
  AuthController.register
);
router.post(
  "/login",
  authRateLimiter,
  AuthController.loginValidation,
  AuthController.login
);
router.post(
  "/request-password-reset",
  passwordResetRateLimiter,
  AuthController.requestPasswordReset
);
router.post("/reset-password", AuthController.resetPassword);
router.post("/verify-token", AuthController.verifyToken);
router.post("/verify-email", AuthController.verifyEmail);

// Protected routes
router.use(authenticateToken);
router.get("/profile", AuthController.getProfile);
router.put("/profile", AuthController.updateProfile);
router.post(
  "/change-password",
  AuthController.changePasswordValidation,
  AuthController.changePassword
);
router.post("/logout", AuthController.logout);

export { router as authRoutes };
