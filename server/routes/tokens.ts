
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertTokenSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const router = Router();

// Token routes
router.get("/:walletId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Verify wallet belongs to user
    const wallet = await storage.getWallet(req.params.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    const tokens = await storage.getTokensByWalletId(req.params.walletId);
    res.json(tokens);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Verify wallet belongs to user
    const wallet = await storage.getWallet(req.body.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    const validation = insertTokenSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid token data", 
        error: fromError(validation.error).toString() 
      });
    }

    const token = await storage.createToken(validation.data);
    res.json(token);
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).json({ message: "Failed to create token" });
  }
});

export default router;
