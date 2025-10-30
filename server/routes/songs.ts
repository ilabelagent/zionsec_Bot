
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertSongSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { jesusCartelService } from "../jesusCartelService";

const router = Router();

// Song routes (Jesus Cartel publishing)
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const includeDetails = req.query.includeDetails === 'true';
    
    if (includeDetails) {
      const songs = await storage.getSongsWithDetailsByUserId(userId);
      res.json(songs);
    } else {
      const songs = await storage.getSongsByUserId(userId);
      res.json(songs);
    }
  } catch (error) {
    console.error("Error fetching songs:", error);
    res.status(500).json({ message: "Failed to fetch songs" });
  }
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate song data WITHOUT userId (server-side only)
    const validation = insertSongSchema.omit({ userId: true }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid song data", 
        error: fromError(validation.error).toString() 
      });
    }

    // Merge validated data with server-side userId
    const song = await storage.createSong({
      ...validation.data,
      userId,
    });
    res.json(song);
  } catch (error) {
    console.error("Error creating song:", error);
    res.status(500).json({ message: "Failed to create song" });
  }
});

router.post("/:id/publish", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Verify song belongs to user
    const song = await storage.getSong(req.params.id);
    if (!song || song.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this song" });
    }

    // Validate publication data
    const publishSchema = z.object({
      walletId: z.string(),
      mintNFT: z.boolean().optional().default(true),
      createToken: z.boolean().optional().default(true),
      network: z.string().optional().default("polygon"),
      tokenSupply: z.string().optional().default("1000000"),
    });
    
    const validation = publishSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid publication data", 
        error: fromError(validation.error).toString() 
      });
    }

    // Verify wallet belongs to user
    const wallet = await storage.getWallet(validation.data.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    // Execute Jesus Cartel publishing pipeline
    const result = await jesusCartelService.publishSong(
      req.params.id,
      validation.data.walletId,
      {
        mintNFT: validation.data.mintNFT,
        createToken: validation.data.createToken,
        network: validation.data.network,
        tokenSupply: validation.data.tokenSupply,
      }
    );

    res.json(result);
  } catch (error: any) {
    console.error("Error publishing song:", error);
    res.status(500).json({ 
      message: error.message || "Failed to publish song" 
    });
  }
});

export default router;
