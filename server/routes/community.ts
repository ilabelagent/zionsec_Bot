
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";

const router = Router();

// Community Exchange Bot Routes
const { botCommunityExchange, botMultichain } = await import("../communityBot");

router.get("/top-traders", isAuthenticated, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topTraders = await botCommunityExchange.getTopTraders(limit);
    res.json(topTraders);
  } catch (error) {
    console.error("Error getting top traders:", error);
    res.status(500).json({ message: "Failed to fetch top traders" });
  }
});

router.post("/copy-trade", isAuthenticated, async (req: any, res) => {
  try {
    const { copyFromBotId, copyToBotId, percentage } = req.body;

    if (!copyFromBotId || !copyToBotId) {
      return res.status(400).json({ message: "Both source and target bot IDs required" });
    }

    const userId = req.user.claims.sub;
    const targetBot = await storage.getBot(copyToBotId);
    
    if (!targetBot || targetBot.userId !== userId) {
      return res.status(403).json({ message: "Access denied to target bot" });
    }

    const result = await botCommunityExchange.copyTrade(
      copyFromBotId,
      copyToBotId,
      percentage || 100
    );
    res.json(result);
  } catch (error) {
    console.error("Error copying trade:", error);
    res.status(500).json({ message: "Failed to copy trade" });
  }
});

router.get("/signals/:tradingPair", isAuthenticated, async (req, res) => {
  try {
    const { tradingPair } = req.params;
    const signals = await botCommunityExchange.getCommunitySignals(tradingPair);
    res.json(signals);
  } catch (error) {
    console.error("Error getting community signals:", error);
    res.status(500).json({ message: "Failed to fetch community signals" });
  }
});

router.get("/leaderboard", isAuthenticated, async (req, res) => {
  try {
    const period = (req.query.period as "daily" | "weekly" | "monthly") || "weekly";
    const leaderboard = await botCommunityExchange.getCompetitionLeaderboard(period);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

router.get("/strategies", isAuthenticated, async (req, res) => {
  try {
    const minRating = parseFloat(req.query.minRating as string) || 4.0;
    const strategies = await botCommunityExchange.getSharedStrategies(minRating);
    res.json(strategies);
  } catch (error) {
    console.error("Error getting shared strategies:", error);
    res.status(500).json({ message: "Failed to fetch shared strategies" });
  }
});

// Enhanced P2P Matching
router.post("/enhanced-matching", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { cryptocurrency, amount, type, algorithm } = req.body;

    if (!cryptocurrency || !amount || !type) {
      return res.status(400).json({ 
        message: "cryptocurrency, amount, and type are required" 
      });
    }

    const result = await botCommunityExchange.enhancedP2PMatching({
      userId,
      cryptocurrency,
      amount: parseFloat(amount),
      type,
      algorithm: algorithm || "reputation",
    });
    res.json(result);
  } catch (error) {
    console.error("Error in enhanced P2P matching:", error);
    res.status(500).json({ message: "Failed to execute enhanced matching" });
  }
});

// Dispute Resolution
router.post("/resolve-dispute", isAuthenticated, async (req, res) => {
  try {
    const { disputeId, autoResolve } = req.body;

    if (!disputeId) {
      return res.status(400).json({ message: "disputeId is required" });
    }

    const result = await botCommunityExchange.resolveDispute(
      disputeId, 
      autoResolve !== false
    );
    res.json(result);
  } catch (error) {
    console.error("Error resolving dispute:", error);
    res.status(500).json({ message: "Failed to resolve dispute" });
  }
});

// Insurance Pool Management
router.post("/insurance", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { action, amount, claimAmount, orderId } = req.body;

    if (!action) {
      return res.status(400).json({ message: "action is required" });
    }

    const result = await botCommunityExchange.manageInsurancePool(action, {
      userId,
      amount,
      claimAmount,
      orderId,
    });
    res.json(result);
  } catch (error) {
    console.error("Error managing insurance pool:", error);
    res.status(500).json({ message: "Failed to manage insurance pool" });
  }
});

export default router;
