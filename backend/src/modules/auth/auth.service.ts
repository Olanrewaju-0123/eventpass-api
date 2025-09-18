import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../../config/database";
import { CryptoUtils } from "../../utils/crypto";
import { emailService } from "../../services/emailService";
import { CacheService } from "../../services/cache";
import { OTPService } from "../../services/otpService";
import { config } from "../../config/env";
import type { JWTPayload } from "../../types";

export class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(userId: string, email: string, role: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      role,
      // JWT expects seconds since epoch
      iat: Math.floor(Date.now() / 1000),
    };

    const signOptions: SignOptions = {
      expiresIn: config.JWT_EXPIRES_IN as unknown as any,
    };
    return jwt.sign(payload, config.JWT_SECRET as Secret, signOptions);
  }

  /**
   * Register new user with OTP verification
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const { email, password, firstName, lastName, phone } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Check if temp user already exists
    const existingTempUser = await (prisma as any).tempUser.findUnique({
      where: { email },
    });

    if (existingTempUser) {
      throw new Error(
        "Registration already in progress. Please check your email for verification code."
      );
    }

    // Hash password
    const hashedPassword = await CryptoUtils.hashPassword(password);

    // Generate email verification token
    const verificationToken = CryptoUtils.generateRandomString(32);
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create temp user (unverified)
    const tempUser = await (prisma as any).tempUser.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Send OTP for email verification
    try {
      await OTPService.generateEmailVerificationOTP(email, firstName);
    } catch (error) {
      console.error("OTP generation failed:", error);
      // Clean up temp user if OTP fails
      await (prisma as any).tempUser.delete({
        where: { id: tempUser.id },
      });
      throw new Error("Failed to send verification code. Please try again.");
    }

    return {
      message: "Please check your email for the verification code",
      tempUserId: tempUser.id,
      email: tempUser.email,
    };
  }

  /**
   * Login user with OTP verification
   */
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValidPassword = await CryptoUtils.comparePassword(
      password,
      user.password
    );

    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error("Please verify your email address before logging in");
    }

    // Send OTP for login verification
    try {
      await OTPService.generateLoginOTP(email, user.firstName);
    } catch (error) {
      console.error("Login OTP generation failed:", error);
      throw new Error("Failed to send verification code. Please try again.");
    }

    return {
      message:
        "Please check your email for the verification code to complete login",
      email: user.email,
      requiresOTP: true,
    };
  }

  /**
   * Complete login with OTP verification
   */
  static async completeLoginWithOTP(email: string, otp: string) {
    // Verify OTP
    await OTPService.verifyLoginOTP(email, otp);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await CryptoUtils.comparePassword(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedNewPassword = await CryptoUtils.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return true;
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      // Don't reveal if user exists
      return true;
    }

    // Generate reset token
    const resetToken = CryptoUtils.generateRandomString(32);

    // Store token in cache (expires in 1 hour)
    await CacheService.set(`password_reset:${resetToken}`, user.id, {
      ttl: 3600,
    });

    // Send reset email (correct parameter order: to, resetToken, firstName)
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName
    );

    return true;
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string) {
    // Get user ID from cache
    const userId = await CacheService.get<string>(`password_reset:${token}`);

    if (!userId) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await CryptoUtils.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete reset token
    await CacheService.delete(`password_reset:${token}`);

    return true;
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmailWithOTP(email: string, otp: string) {
    // Verify OTP
    await OTPService.verifyEmailVerificationOTP(email, otp);

    // Find temp user
    const tempUser = await (prisma as any).tempUser.findUnique({
      where: { email },
    });

    if (!tempUser) {
      throw new Error("User not found");
    }

    // Create verified user
    const user = await prisma.user.create({
      data: {
        email: tempUser.email,
        password: tempUser.password,
        firstName: tempUser.firstName,
        lastName: tempUser.lastName,
        phone: tempUser.phone,
        role: "USER",
        isEmailVerified: true,
      },
    });

    // Delete temp user
    await (prisma as any).tempUser.delete({
      where: { id: tempUser.id },
    });

    // Generate token for the new verified user
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    };
  }

  /**
   * Verify email with token (legacy method for backward compatibility)
   */
  static async verifyEmail(verificationToken: string) {
    const tempUser = await (prisma as any).tempUser.findFirst({
      where: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!tempUser) {
      throw new Error("Invalid or expired verification token");
    }

    // Create verified user
    const user = await prisma.user.create({
      data: {
        email: tempUser.email,
        password: tempUser.password,
        firstName: tempUser.firstName,
        lastName: tempUser.lastName,
        phone: tempUser.phone,
        role: "USER",
        isEmailVerified: true,
      },
    });

    // Delete temp user
    await (prisma as any).tempUser.delete({
      where: { id: tempUser.id },
    });

    // Generate token for the new verified user
    const token = this.generateToken(user.id, user.email, user.role);

    return {
      message: "Email verified successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
      },
      token,
    };
  }

  /**
   * Verify token
   */
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload;

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw new Error("Invalid token");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  /**
   * Resend email verification OTP
   */
  static async resendEmailVerificationOTP(email: string) {
    return await OTPService.resendEmailVerificationOTP(email);
  }

  /**
   * Resend login OTP
   */
  static async resendLoginOTP(email: string) {
    return await OTPService.resendLoginOTP(email);
  }

  /**
   * Forgot password (OTP-based)
   */
  static async forgotPassword(email: string) {
    // Check if user exists in User table
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If not found in User table, check TempUser table
    if (!user) {
      const tempUser = await (prisma as any).tempUser.findUnique({
        where: { email },
      });

      if (!tempUser) {
        // Don't reveal if user exists
        return true;
      }

      // Use tempUser data
      user = {
        firstName: tempUser.firstName,
        isActive: true,
      };
    }

    if (!user.isActive) {
      // Don't reveal if user exists
      return true;
    }

    // Generate and send OTP for password reset
    await OTPService.generatePasswordResetOTP(email, user.firstName);

    return true;
  }

  /**
   * Verify reset password OTP
   */
  static async verifyResetOTP(email: string, otp: string) {
    await OTPService.verifyPasswordResetOTP(email, otp);
    return true;
  }

  /**
   * Reset password with OTP
   */
  static async resetPasswordWithOTP(
    email: string,
    otp: string,
    newPassword: string
  ) {
    // Verify OTP first
    await OTPService.verifyPasswordResetOTP(email, otp);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const hashedPassword = await CryptoUtils.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Clear the OTP from cache
    await CacheService.delete(`password_reset_otp:${email}`);

    return true;
  }
}
