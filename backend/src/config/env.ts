import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number.parseInt(process.env.PORT || "3000"),
  API_VERSION: process.env.API_VERSION || "v1",

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,

  // Email
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || "587"),
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  FROM_EMAIL: process.env.FROM_EMAIL!,
  FROM_NAME: process.env.FROM_NAME || "EventPass",

  // Paystack
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  PAYSTACK_WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET,

  // OPay
  OPAY_SECRET_KEY: process.env.OPAY_SECRET_KEY,
  OPAY_MERCHANT_ID: process.env.OPAY_MERCHANT_ID,
  OPAY_PUBLIC_KEY: process.env.OPAY_PUBLIC_KEY,

  // File Upload
  MAX_FILE_SIZE: Number.parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || "uploads/",

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Number.parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000"
  ), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Number.parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100"
  ),

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3001",
  BASE_URL: process.env.BASE_URL || "http://localhost:3000",

  // Development
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

// Validate required environment variables
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "FROM_EMAIL",
];

// Optional environment variables for payment gateways
const optionalEnvVars = [
  "PAYSTACK_SECRET_KEY",
  "PAYSTACK_PUBLIC_KEY",
  "PAYSTACK_WEBHOOK_SECRET",
  "OPAY_SECRET_KEY",
  "OPAY_MERCHANT_ID",
  "OPAY_PUBLIC_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Log optional environment variables status
if (config.isDevelopment) {
  console.log("🔧 Environment Configuration:");
  console.log("✅ Required variables: All present");

  const missingOptional = optionalEnvVars.filter(
    (envVar) => !process.env[envVar]
  );
  if (missingOptional.length > 0) {
    console.log(
      "⚠️  Optional variables missing (payment features will be disabled):"
    );
    missingOptional.forEach((envVar) => console.log(`   - ${envVar}`));
  } else {
    console.log("✅ Optional variables: All present");
  }
}
