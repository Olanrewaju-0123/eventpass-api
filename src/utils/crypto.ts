import crypto from "crypto"
import bcrypt from "bcryptjs"

export class CryptoUtils {
  /**
   * Generate a random string
   */
  static generateRandomString(length = 32): string {
    return crypto.randomBytes(length).toString("hex")
  }

  /**
   * Generate a unique reference
   */
  static generateReference(prefix = "REF"): string {
    const timestamp = Date.now().toString(36)
    const random = crypto.randomBytes(4).toString("hex")
    return `${prefix}_${timestamp}_${random}`.toUpperCase()
  }

  /**
   * Generate booking reference
   */
  static generateBookingReference(): string {
    return this.generateReference("BK")
  }

  /**
   * Generate payment reference
   */
  static generatePaymentReference(): string {
    return this.generateReference("PAY")
  }

  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Compare password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  /**
   * Generate OTP
   */
  static generateOTP(length = 6): string {
    const digits = "0123456789"
    let otp = ""
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)]
    }
    return otp
  }

  /**
   * Create HMAC signature
   */
  static createHmacSignature(data: string, secret: string): string {
    return crypto.createHmac("sha512", secret).update(data).digest("hex")
  }

  /**
   * Verify HMAC signature
   */
  static verifyHmacSignature(data: string, signature: string, secret: string): boolean {
    const expectedSignature = this.createHmacSignature(data, secret)
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }
}
