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
import { eventPromotionRoutes } from "./routes/eventPromotion";
import { paymentConfirmationRoutes } from "./routes/paymentConfirmation";

// Load environment variables
dotenv.config();

const app = express();

// DEBUG: log every route path before attaching
const logRoutes = (name: string, router: any) => {
  router.stack?.forEach((layer: any) => {
    if (layer.route) {
      console.log(`[${name}]`, layer.route.path);
    }
  });
};

logRoutes("events", eventRoutes);
logRoutes("auth", authRoutes);
logRoutes("bookings", bookingRoutes);
logRoutes("payments", paymentRoutes);
logRoutes("webhooks", webhookRoutes);
logRoutes("qr", qrRoutes);
logRoutes("email", emailRoutes);
logRoutes("cache", cacheRoutes);
logRoutes("eventPromotions", eventPromotionRoutes);
logRoutes("paymentConfirmation", paymentConfirmationRoutes);

const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || "v1";

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/events`, eventRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/webhooks`, webhookRoutes);
app.use(`/api/${API_VERSION}/qr`, qrRoutes);
app.use(`/api/${API_VERSION}/emails`, emailRoutes);
app.use(`/api/${API_VERSION}/cache`, cacheRoutes);
app.use(`/api/${API_VERSION}/event-promotion`, eventPromotionRoutes);
app.use(`/api/${API_VERSION}/payment-confirmation`, paymentConfirmationRoutes);

// 404 handler (use no path to match all in Express 5)
app.use((req, res) => {
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
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
