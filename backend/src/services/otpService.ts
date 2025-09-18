import { prisma } from "../config/database";
import { CryptoUtils } from "../utils/crypto";
import { emailService } from "./emailService";
import { CacheService } from "./cache";

export class OTPService {
  /**
   * Generate and send OTP for email verification (signup)
   */
  static async generateEmailVerificationOTP(email: string, firstName: string) {
    const otp = CryptoUtils.generateOTP(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in cache for quick access
    await CacheService.set(`email_verification_otp:${email}`, otp, {
      ttl: 900, // 15 minutes in seconds
    });

    // Send OTP via email
    await emailService.sendOTPEmail(
      email,
      otp,
      firstName,
      "email_verification"
    );

    return {
      message: "OTP sent to your email address",
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Generate and send OTP for login verification
   */
  static async generateLoginOTP(email: string, firstName: string) {
    const otp = CryptoUtils.generateOTP(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in cache for quick access
    await CacheService.set(`login_otp:${email}`, otp, {
      ttl: 900, // 15 minutes in seconds
    });

    // Send OTP via email
    await emailService.sendOTPEmail(email, otp, firstName, "login");

    return {
      message: "OTP sent to your email address",
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify email verification OTP
   */
  static async verifyEmailVerificationOTP(email: string, otp: string) {
    const storedOTP = await CacheService.get<string>(
      `email_verification_otp:${email}`
    );

    if (!storedOTP) {
      throw new Error("OTP not found or expired");
    }

    if (storedOTP !== otp) {
      throw new Error("Invalid OTP");
    }

    // Clear OTP from cache
    await CacheService.delete(`email_verification_otp:${email}`);

    return true;
  }

  /**
   * Verify login OTP
   */
  static async verifyLoginOTP(email: string, otp: string) {
    const storedOTP = await CacheService.get<string>(`login_otp:${email}`);

    if (!storedOTP) {
      throw new Error("OTP not found or expired");
    }

    if (storedOTP !== otp) {
      throw new Error("Invalid OTP");
    }

    // Clear OTP from cache
    await CacheService.delete(`login_otp:${email}`);

    return true;
  }

  /**
   * Resend OTP for email verification
   */
  static async resendEmailVerificationOTP(email: string) {
    // Check if user exists in temp users
    const tempUser = await (prisma as any).tempUser.findUnique({
      where: { email },
    });

    if (!tempUser) {
      throw new Error("User not found");
    }

    return this.generateEmailVerificationOTP(email, tempUser.firstName);
  }

  /**
   * Resend OTP for login
   */
  static async resendLoginOTP(email: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return this.generateLoginOTP(email, user.firstName);
  }

  /**
   * Check if OTP exists and is valid
   */
  static async isOTPValid(
    email: string,
    type: "email_verification" | "login"
  ): Promise<boolean> {
    const key =
      type === "email_verification"
        ? `email_verification_otp:${email}`
        : `login_otp:${email}`;
    const otp = await CacheService.get<string>(key);
    return !!otp;
  }

  /**
   * Generate and send OTP for password reset
   */
  static async generatePasswordResetOTP(email: string, firstName: string) {
    const otp = CryptoUtils.generateOTP(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store OTP in cache for quick access
    await CacheService.set(`password_reset_otp:${email}`, otp, {
      ttl: 900, // 15 minutes in seconds
    });

    // Send OTP via email
    await emailService.sendOTPEmail(email, otp, firstName, "password_reset");

    return {
      message: "Password reset OTP sent to your email address",
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify password reset OTP
   */
  static async verifyPasswordResetOTP(email: string, otp: string) {
    const storedOtp = await CacheService.get<string>(
      `password_reset_otp:${email}`
    );

    if (!storedOtp || storedOtp !== otp) {
      throw new Error("Invalid or expired OTP");
    }

    // Don't delete OTP here - it will be deleted after successful password reset
    return true;
  }

  /**
   * Clear expired OTPs (cleanup method)
   */
  static async clearExpiredOTPs() {
    // This would be called by a cron job to clean up expired OTPs
    // For now, we rely on Redis TTL to handle expiration
    console.log("OTP cleanup completed - expired OTPs removed by TTL");
  }
}
