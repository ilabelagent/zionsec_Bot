
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertNftSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const router = Router();

// NFT routes
router.get("/:walletId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Verify wallet belongs to user
    const wallet = await storage.getWallet(req.params.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    const nfts = await storage.getNftsByWalletId(req.params.walletId);
    res.json(nfts);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    res.status(500).json({ message: "Failed to fetch NFTs" });
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

    const validation = insertNftSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid NFT data", 
        error: fromError(validation.error).toString() 
      });
    }

    const nft = await storage.createNft(validation.data);
    res.json(nft);
  } catch (error) {
    console.error("Error creating NFT:", error);
    res.status(500).json({ message: "Failed to create NFT" });
  }
});

export default router;
