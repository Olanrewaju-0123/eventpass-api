import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error";
import { rateLimiter } from "./middleware/rateLimit";
import { authRoutes } from "./routes/auth";
import { eventRoutes } from "./routes/events";
import { bookingRoutes } from "./routes/bookings";
import { paymentRoutes } from "./routes/payments";
import { webhookRoutes } from "./routes/webhook";
import { qrRoutes } from "./routes/qr";
import { emailRoutes } from "./routes/email";
import { cacheRoutes } from "./routes/cache";
import { createAdminRoutes } from "./routes/create-admin";
import { eventPromotionRoutes } from "./routes/eventPromotion";
import { paymentConfirmationRoutes } from "./routes/paymentConfirmation";
import { opayRoutes } from "./modules/payments/opay.routes";
import { opayWebhookRoutes } from "./routes/opayWebhook";

// Load environment variables
dotenv.config();

const app = express();

// DEBUG: log every route path before attaching
const logRoutes = (name: string, router: any) => {
  console.log(`\n📋 ${name.toUpperCase()} Routes:`);
  router.stack?.forEach((layer: any) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(", ").toUpperCase();
      console.log(
        `   ${methods} /api/${API_VERSION}/${name}${layer.route.path}`
      );
    }
  });
};

const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || "v1";

// Log all routes
console.log("🔍 EventPass API Routes:");
logRoutes("auth", authRoutes);
logRoutes("events", eventRoutes);
logRoutes("bookings", bookingRoutes);
logRoutes("payments", paymentRoutes);
logRoutes("webhooks", webhookRoutes);
logRoutes("qr", qrRoutes);
logRoutes("emails", emailRoutes);
logRoutes("cache", cacheRoutes);
logRoutes("event-promotion", eventPromotionRoutes);
logRoutes("payment-confirmation", paymentConfirmationRoutes);
logRoutes("opay", opayRoutes);
logRoutes("webhooks/opay", opayWebhookRoutes);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes

// Mount health route first to avoid conflicts
console.log(`Mounting health routes at /api/${API_VERSION}`);
app.get(`/api/${API_VERSION}/health`, (req, res) => {
  console.log("Health endpoint hit!");
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.API_VERSION || "v1",
    },
  });
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  console.log(`Request path: ${req.path}`);
  console.log(`Request baseUrl: ${req.baseUrl}`);
  next();
});

// Mount other routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/events`, eventRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/webhooks`, webhookRoutes);
app.use(`/api/${API_VERSION}/qr`, qrRoutes);
app.use(`/api/${API_VERSION}/emails`, emailRoutes);
app.use(`/api/${API_VERSION}/cache`, cacheRoutes);
app.use(`/api/${API_VERSION}/create-admin`, createAdminRoutes);
app.use(`/api/${API_VERSION}/event-promotion`, eventPromotionRoutes);
app.use(`/api/${API_VERSION}/payment-confirmation`, paymentConfirmationRoutes);
app.use(`/api/${API_VERSION}/opay`, opayRoutes);
app.use(`/api/${API_VERSION}/webhooks/opay`, opayWebhookRoutes);

// 404 handler (use no path to match all in Express 5)
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 EventPass API running on port ${PORT}`);
  console.log(
    `📚 API Documentation: http://localhost:${PORT}/api/${API_VERSION}`
  );
  console.log(
    `🏥 Health Check: http://localhost:${PORT}/api/${API_VERSION}/health`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
