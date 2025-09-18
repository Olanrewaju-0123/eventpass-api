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
  "/complete-login",
  authRateLimiter,
  AuthController.completeLoginWithOTP
);
router.post(
  "/request-password-reset",
  passwordResetRateLimiter,
  AuthController.requestPasswordReset
);
router.post("/reset-password", AuthController.resetPassword);
router.post("/verify-token", AuthController.verifyToken);
router.post("/verify-email", AuthController.verifyEmail);
router.post("/verify-email-otp", AuthController.verifyEmailWithOTP);
router.post("/resend-email-otp", AuthController.resendEmailVerificationOTP);
router.post("/resend-login-otp", AuthController.resendLoginOTP);
router.post(
  "/forgot-password",
  passwordResetRateLimiter,
  AuthController.forgotPassword
);
router.post("/verify-reset-otp", AuthController.verifyResetOTP);

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

// Admin routes
router.get("/users", AuthController.getAllUsers);

export { router as authRoutes };
