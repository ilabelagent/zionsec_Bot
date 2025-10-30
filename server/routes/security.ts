
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertSecurityEventSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const router = Router();

// Security event routes
router.get("/events", isAuthenticated, async (req, res) => {
  try {
    const events = await storage.getUnresolvedSecurityEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching security events:", error);
    res.status(500).json({ message: "Failed to fetch security events" });
  }
});

router.post("/events", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate security event data WITHOUT userId (server-side only)
    const validation = insertSecurityEventSchema.omit({ userId: true }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid security event data", 
        error: fromError(validation.error).toString() 
      });
    }

    // Merge validated data with server-side userId
    const event = await storage.createSecurityEvent({
      ...validation.data,
      userId,
    });
    res.json(event);
  } catch (error) {
    console.error("Error creating security event:", error);
    res.status(500).json({ message: "Failed to create security event" });
  }
});

router.post("/events/:id/resolve", isAuthenticated, async (req: any, res) => {
  try {
    // Only admins can resolve security events
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    await storage.resolveSecurityEvent(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error resolving security event:", error);
    res.status(500).json({ message: "Failed to resolve security event" });
  }
});

export default router;
