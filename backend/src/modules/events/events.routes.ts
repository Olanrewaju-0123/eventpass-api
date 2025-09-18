import { Router } from "express";
import { EventsController } from "./events.controller";
import { authenticateToken, requireOrganizer } from "../../middleware/auth";

const router = Router();

// Public routes
router.get("/", EventsController.getEvents);
router.get("/categories", EventsController.getCategories);
router.get("/:eventId/qr", EventsController.generatePromotionQR);
router.get("/:eventId", EventsController.getEventById);
router.get("/created/:reference", EventsController.getEventByCreationReference);

// Protected routes - require authentication
router.use(authenticateToken);

// Organizer/Admin routes - can create and manage events
router.post(
  "/",
  requireOrganizer,
  EventsController.createEventValidation,
  EventsController.createEvent
);
router.get("/my/events", requireOrganizer, EventsController.getMyEvents);
router.put(
  "/:eventId",
  requireOrganizer,
  EventsController.updateEventValidation,
  EventsController.updateEvent
);
router.delete("/:eventId", requireOrganizer, EventsController.deleteEvent);
router.get(
  "/:eventId/statistics",
  requireOrganizer,
  EventsController.getEventStatistics
);

export { router as eventRoutes };
