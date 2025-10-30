
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertTransactionSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const router = Router();

// Transaction routes
router.get("/:walletId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Verify wallet belongs to user
    const wallet = await storage.getWallet(req.params.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    const transactions = await storage.getTransactionsByWalletId(req.params.walletId);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
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

    const validation = insertTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid transaction data", 
        error: fromError(validation.error).toString() 
      });
    }

    const transaction = await storage.createTransaction(validation.data);
    res.json(transaction);
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Failed to create transaction" });
  }
});

export default router;
