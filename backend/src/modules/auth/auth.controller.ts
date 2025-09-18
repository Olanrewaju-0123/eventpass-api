import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AuthService } from "./auth.service";
import { HttpResponse } from "../../utils/http";
import { asyncHandler } from "../../middleware/error";
import type { AuthenticatedRequest } from "../../types";

export class AuthController {
  /**
   * Register validation rules
   */
  static registerValidation = [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    body("firstName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters"),
    body("phone")
      .optional()
      .matches(/^\d{11}$/)
      .withMessage("Phone number must be exactly 11 digits"),
  ];

  /**
   * Login validation rules
   */
  static loginValidation = [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ];

  /**
   * Change password validation rules
   */
  static changePasswordValidation = [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ];

  /**
   * Register user
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mapped = errors
        .array()
        .reduce<Record<string, string[]>>((acc, e) => {
          const key = (e as any).path || "form";
          (acc[key] ||= []).push(e.msg);
          return acc;
        }, {});
      return HttpResponse.validationError(res, "Validation failed", mapped);
    }

    const { email, password, firstName, lastName, phone } = req.body;

    try {
      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      return HttpResponse.success(
        res,
        "User registered successfully",
        {
          ...result,
          success: true,
          verificationRequired: true,
        },
        201
      );
    } catch (error: any) {
      if (error.message === "User already exists with this email") {
        return HttpResponse.conflict(
          res,
          "User already exists with this email"
        );
      }
      throw error; // Re-throw other errors to be handled by global error handler
    }
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const mapped = errors
        .array()
        .reduce<Record<string, string[]>>((acc, e) => {
          const key = (e as any).path || "form";
          (acc[key] ||= []).push(e.msg);
          return acc;
        }, {});
      return HttpResponse.validationError(res, "Validation failed", mapped);
    }

    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    return HttpResponse.success(res, "Login successful", result);
  });

  /**
   * Get user profile
   */
  static getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = await AuthService.getProfile(req.user!.id);
      return HttpResponse.success(res, "Profile retrieved successfully", user);
    }
  );

  /**
   * Update user profile
   */
  static updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { firstName, lastName, phone } = req.body;

      const user = await AuthService.updateProfile(req.user!.id, {
        firstName,
        lastName,
        phone,
      });

      return HttpResponse.success(res, "Profile updated successfully", user);
    }
  );

  /**
   * Change password
   */
  static changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const mapped = errors
          .array()
          .reduce<Record<string, string[]>>((acc, e) => {
            const key = (e as any).path || "form";
            (acc[key] ||= []).push(e.msg);
            return acc;
          }, {});
        return HttpResponse.validationError(res, "Validation failed", mapped);
      }

      const { currentPassword, newPassword } = req.body;

      await AuthService.changePassword(
        req.user!.id,
        currentPassword,
        newPassword
      );

      return HttpResponse.success(res, "Password changed successfully");
    }
  );

  /**
   * Request password reset
   */
  static requestPasswordReset = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;

      if (!email) {
        return HttpResponse.badRequest(res, "Email is required");
      }

      await AuthService.requestPasswordReset(email);

      return HttpResponse.success(
        res,
        "Password reset email sent if account exists"
      );
    }
  );

  /**
   * Reset password (OTP-based)
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return HttpResponse.badRequest(
        res,
        "Email, OTP, and new password are required"
      );
    }

    if (newPassword.length < 8) {
      return HttpResponse.badRequest(
        res,
        "Password must be at least 8 characters"
      );
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return HttpResponse.badRequest(
        res,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
    }

    await AuthService.resetPasswordWithOTP(email, otp, newPassword);

    return HttpResponse.success(res, "Password reset successfully");
  });

  /**
   * Verify email with OTP
   */
  static verifyEmailWithOTP = asyncHandler(
    async (req: Request, res: Response) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return HttpResponse.badRequest(res, "Email and OTP are required");
      }

      const result = await AuthService.verifyEmailWithOTP(email, otp);

      return HttpResponse.success(res, result.message, result);
    }
  );

  /**
   * Verify email with token (legacy)
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return HttpResponse.badRequest(res, "Verification token is required");
    }

    const result = await AuthService.verifyEmail(token);

    return HttpResponse.success(res, result.message, result.user);
  });

  /**
   * Complete login with OTP
   */
  static completeLoginWithOTP = asyncHandler(
    async (req: Request, res: Response) => {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return HttpResponse.badRequest(res, "Email and OTP are required");
      }

      const result = await AuthService.completeLoginWithOTP(email, otp);

      return HttpResponse.success(res, "Login completed successfully", result);
    }
  );

  /**
   * Resend email verification OTP
   */
  static resendEmailVerificationOTP = asyncHandler(
    async (req: Request, res: Response) => {
      const { email } = req.body;

      if (!email) {
        return HttpResponse.badRequest(res, "Email is required");
      }

      const result = await AuthService.resendEmailVerificationOTP(email);

      return HttpResponse.success(res, result.message);
    }
  );

  /**
   * Resend login OTP
   */
  static resendLoginOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return HttpResponse.badRequest(res, "Email is required");
    }

    const result = await AuthService.resendLoginOTP(email);

    return HttpResponse.success(res, result.message);
  });

  /**
   * Verify token
   */
  static verifyToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return HttpResponse.badRequest(res, "Token is required");
    }

    const user = await AuthService.verifyToken(token);

    return HttpResponse.success(res, "Token is valid", user);
  });

  /**
   * Logout (client-side token removal)
   */
  static logout = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // In a stateless JWT system, logout is handled client-side
      // You could implement token blacklisting here if needed
      return HttpResponse.success(res, "Logged out successfully");
    }
  );

  /**
   * Get all users (Admin only)
   */
  static getAllUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Check if user is admin
      if (req.user!.role !== "ADMIN") {
        return HttpResponse.forbidden(
          res,
          "Access denied. Admin role required."
        );
      }

      const users = await AuthService.getAllUsers();
      return HttpResponse.success(res, "Users retrieved successfully", users);
    }
  );

  /**
   * Forgot password (OTP-based)
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return HttpResponse.badRequest(res, "Email is required");
    }

    await AuthService.forgotPassword(email);

    return HttpResponse.success(
      res,
      "Password reset OTP sent to your email if account exists"
    );
  });

  /**
   * Verify reset password OTP
   */
  static verifyResetOTP = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return HttpResponse.badRequest(res, "Email and OTP are required");
    }

    await AuthService.verifyResetOTP(email, otp);

    return HttpResponse.success(res, "OTP verified successfully");
  });
}
