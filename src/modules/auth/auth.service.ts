import jwt from "jsonwebtoken"
import { prisma } from "../../config/database"
import { CryptoUtils } from "../../utils/crypto"
import { emailService } from "../../services/emailService"
import { CacheService } from "../../services/cache"
import { config } from "../../config/env"
import type { JWTPayload } from "../../types"

export class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(userId: string, email: string, role: string): string {
    const payload: JWTPayload = {
      userId,
      email,
      role,
      iat: Date.now(),
    }

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    })
  }

  /**
   * Register new user
   */
  static async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) {
    const { email, password, firstName, lastName, phone } = userData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Hash password
    const hashedPassword = await CryptoUtils.hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role)

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email, user.firstName)

    return {
      user,
      token,
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials")
    }

    // Verify password
    const isValidPassword = await CryptoUtils.comparePassword(password, user.password)

    if (!isValidPassword) {
      throw new Error("Invalid credentials")
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    }
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
    })

    if (!user) {
      throw new Error("User not found")
    }

    return user
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updateData: {
      firstName?: string
      lastName?: string
      phone?: string
    },
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
    })

    return user
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Verify current password
    const isValidPassword = await CryptoUtils.comparePassword(currentPassword, user.password)

    if (!isValidPassword) {
      throw new Error("Current password is incorrect")
    }

    // Hash new password
    const hashedNewPassword = await CryptoUtils.hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    })

    return true
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      // Don't reveal if user exists
      return true
    }

    // Generate reset token
    const resetToken = CryptoUtils.generateRandomString(32)

    // Store token in cache (expires in 1 hour)
    await CacheService.set(`password_reset:${resetToken}`, user.id, { ttl: 3600 })

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken)

    return true
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string) {
    // Get user ID from cache
    const userId = await CacheService.get<string>(`password_reset:${token}`)

    if (!userId) {
      throw new Error("Invalid or expired reset token")
    }

    // Hash new password
    const hashedPassword = await CryptoUtils.hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    // Delete reset token
    await CacheService.delete(`password_reset:${token}`)

    return true
  }

  /**
   * Verify token
   */
  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as JWTPayload

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
      })

      if (!user || !user.isActive) {
        throw new Error("Invalid token")
      }

      return user
    } catch (error) {
      throw new Error("Invalid token")
    }
  }
}
