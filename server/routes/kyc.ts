
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertKycRecordSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const router = Router();

// KYC routes
router.get("/status", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const record = await storage.getKycRecordByUserId(userId);
    res.json(record || { status: "pending" });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    res.status(500).json({ message: "Failed to fetch KYC status" });
  }
});

router.post("/submit", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate KYC data WITHOUT userId (server-side only)
    const validation = insertKycRecordSchema.omit({ userId: true }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid KYC data", 
        error: fromError(validation.error).toString() 
      });
    }

    // Merge validated data with server-side userId
    const record = await storage.createKycRecord({
      ...validation.data,
      userId,
    });
    res.json(record);
  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ message: "Failed to submit KYC" });
  }
});

export default router;
