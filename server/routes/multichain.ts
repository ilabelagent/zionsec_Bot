
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";

const router = Router();

// Multichain Bot Routes
const { botMultichain } = await import("../communityBot");

router.get("/assets", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const assets = await botMultichain.trackCrossChainAssets(userId);
    res.json(assets);
  } catch (error) {
    console.error("Error tracking cross-chain assets:", error);
    res.status(500).json({ message: "Failed to track assets" });
  }
});

router.get("/gas-prices", isAuthenticated, async (req, res) => {
  try {
    const gasPrices = await botMultichain.compareGasPrices();
    res.json(gasPrices);
  } catch (error) {
    console.error("Error comparing gas prices:", error);
    res.status(500).json({ message: "Failed to fetch gas prices" });
  }
});

router.post("/select-chain", isAuthenticated, async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, prioritizeSpeed } = req.body;

    if (!fromAddress || !toAddress || !amount) {
      return res.status(400).json({ 
        message: "fromAddress, toAddress, and amount are required" 
      });
    }

    const result = await botMultichain.selectOptimalChain({
      fromAddress,
      toAddress,
      amount,
      prioritizeSpeed: prioritizeSpeed || false,
    });
    res.json(result);
  } catch (error) {
    console.error("Error selecting optimal chain:", error);
    res.status(500).json({ message: "Failed to select optimal chain" });
  }
});

router.post("/optimize-bridge", isAuthenticated, async (req, res) => {
  try {
    const { fromChain, toChain, asset, amount } = req.body;

    if (!fromChain || !toChain || !asset || !amount) {
      return res.status(400).json({ 
        message: "fromChain, toChain, asset, and amount are required" 
      });
    }

    const result = await botMultichain.optimizeBridgeRoute({
      fromChain,
      toChain,
      asset,
      amount,
    });
    res.json(result);
  } catch (error) {
    console.error("Error optimizing bridge route:", error);
    res.status(500).json({ message: "Failed to optimize bridge route" });
  }
});

router.get("/dashboard", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const dashboard = await botMultichain.getPortfolioDashboard(userId);
    res.json(dashboard);
  } catch (error) {
    console.error("Error getting multichain dashboard:", error);
    res.status(500).json({ message: "Failed to fetch multichain dashboard" });
  }
});

// Auto-Rebalance Chains
router.post("/auto-rebalance", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { targetDistribution, minThreshold } = req.body;

    const result = await botMultichain.autoRebalanceChains({
      userId,
      targetDistribution,
      minThreshold,
    });
    res.json(result);
  } catch (error) {
    console.error("Error auto-rebalancing chains:", error);
    res.status(500).json({ message: "Failed to auto-rebalance chains" });
  }
});

// Cross-Chain Arbitrage Detection
router.post("/detect-arbitrage", isAuthenticated, async (req, res) => {
  try {
    const { asset, minProfitPercentage } = req.body;

    if (!asset) {
      return res.status(400).json({ message: "asset is required" });
    }

    const result = await botMultichain.detectCrossChainArbitrage({
      asset,
      minProfitPercentage,
    });
    res.json(result);
  } catch (error) {
    console.error("Error detecting cross-chain arbitrage:", error);
    res.status(500).json({ message: "Failed to detect arbitrage opportunities" });
  }
});

export default router;
