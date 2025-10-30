
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertJesusCartelReleaseSchema, insertJesusCartelEventSchema, insertJesusCartelStreamSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { jesusCartelService } from "../jesusCartelService";

const router = Router();

// Jesus Cartel Music Ministry Routes
// Public routes - no auth required for viewing
router.get("/releases", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const releases = await jesusCartelService.getLatestReleases(limit);
    res.json(releases);
  } catch (error) {
    console.error("Error fetching releases:", error);
    res.status(500).json({ message: "Failed to fetch releases" });
  }
});

router.get("/releases/featured", async (req, res) => {
  try {
    const releases = await jesusCartelService.getFeaturedReleases();
    res.json(releases);
  } catch (error) {
    console.error("Error fetching featured releases:", error);
    res.status(500).json({ message: "Failed to fetch featured releases" });
  }
});

router.get("/releases/:id", async (req, res) => {
  try {
    const release = await jesusCartelService.getRelease(req.params.id);
    if (!release) {
      return res.status(404).json({ message: "Release not found" });
    }
    res.json(release);
  } catch (error) {
    console.error("Error fetching release:", error);
    res.status(500).json({ message: "Failed to fetch release" });
  }
});

router.get("/events", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const events = await jesusCartelService.getUpcomingEvents(limit);
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/events/featured", async (req, res) => {
  try {
    const events = await jesusCartelService.getFeaturedEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching featured events:", error);
    res.status(500).json({ message: "Failed to fetch featured events" });
  }
});

router.get("/events/:id", async (req, res) => {
  try {
    const event = await jesusCartelService.getEvent(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// Stream tracking
router.post("/streams", async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub; // Optional user tracking
    
    const validation = insertJesusCartelStreamSchema.safeParse({
      ...req.body,
      userId,
    });
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid stream data", 
        error: fromError(validation.error).toString() 
      });
    }

    const stream = await jesusCartelService.trackStreams(
      validation.data.releaseId,
      userId,
      validation.data.duration,
      validation.data.completionRate ? parseFloat(validation.data.completionRate) : undefined
    );
    
    res.json(stream);
  } catch (error) {
    console.error("Error tracking stream:", error);
    res.status(500).json({ message: "Failed to track stream" });
  }
});

// Like a release
router.post("/releases/:id/like", async (req, res) => {
  try {
    await jesusCartelService.likeRelease(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error liking release:", error);
    res.status(500).json({ message: "Failed to like release" });
  }
});

// Admin routes for managing releases and events
router.post("/admin/releases", isAuthenticated, async (req, res) => {
  try {
    const validation = insertJesusCartelReleaseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid release data", 
        error: fromError(validation.error).toString() 
      });
    }

    const release = await storage.createRelease(validation.data);
    res.json(release);
  } catch (error) {
    console.error("Error creating release:", error);
    res.status(500).json({ message: "Failed to create release" });
  }
});

router.put("/admin/releases/:id", isAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    await storage.updateRelease(req.params.id, updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating release:", error);
    res.status(500).json({ message: "Failed to update release" });
  }
});

router.delete("/admin/releases/:id", isAuthenticated, async (req, res) => {
  try {
    await storage.deleteRelease(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting release:", error);
    res.status(500).json({ message: "Failed to delete release" });
  }
});

router.post("/admin/events", isAuthenticated, async (req, res) => {
  try {
    const validation = insertJesusCartelEventSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid event data", 
        error: fromError(validation.error).toString() 
      });
    }

    const event = await storage.createEvent(validation.data);
    res.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.put("/admin/events/:id", isAuthenticated, async (req, res) => {
  try {
    const updates = req.body;
    await storage.updateEvent(req.params.id, updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/admin/events/:id", isAuthenticated, async (req, res) => {
  try {
    await storage.deleteEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

export default router;
