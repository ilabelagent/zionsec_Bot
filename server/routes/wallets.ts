
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertWalletSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { web3Service } from "../web3Service";
import { encryptionService } from "../encryptionService";

const router = Router();

// Wallet routes
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const wallets = await storage.getWalletsByUserId(userId);
    res.json(wallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({ message: "Failed to fetch wallets" });
  }
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Validate wallet data WITHOUT userId (server-side only)
    const validation = insertWalletSchema.omit({ userId: true }).safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid wallet data", 
        error: fromError(validation.error).toString() 
      });
    }

    // Merge validated data with server-side userId
    const wallet = await storage.createWallet({
      ...validation.data,
      userId,
    });
    res.json(wallet);
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).json({ message: "Failed to create wallet" });
  }
});

// Web3 Blockchain routes
router.post("/web3/create-wallet", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { network = "ethereum", currency } = req.body;

    // Create blockchain wallet
    const walletData = await web3Service.createWallet(userId, network);

    // Encrypt private key with user-specific encryption
    const encryptedPrivateKey = encryptionService.encrypt(
      walletData.privateKey,
      userId
    );

    // Store in database with encrypted private key
    const wallet = await storage.createWallet({
      userId,
      address: walletData.address,
      balance: "0",
      network,
      privateKeyEncrypted: encryptedPrivateKey,
    });

    // SECURITY: Return mnemonic ONLY ONCE for user backup
    // Client must save this immediately - never stored or returned again
    res.json({
      id: wallet.id,
      address: wallet.address,
      network: wallet.network,
      balance: wallet.balance,
      mnemonic: walletData.mnemonic,
      warning: "Save this mnemonic phrase securely - it will never be shown again!",
    });
  } catch (error) {
    console.error("Error creating Web3 wallet:", error);
    res.status(500).json({ message: "Failed to create Web3 wallet" });
  }
});

// Import wallet from mnemonic or private key
router.post("/web3/import-wallet", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { mnemonic, privateKey, network = "ethereum" } = req.body;

    let walletData: { address: string; privateKey: string };

    if (mnemonic) {
      walletData = await web3Service.importWalletFromMnemonic(mnemonic);
    } else if (privateKey) {
      walletData = await web3Service.importWalletFromPrivateKey(privateKey);
    } else {
      return res.status(400).json({ message: "Mnemonic or private key required" });
    }

    // Check if wallet already exists
    const existingWallet = await storage.getWalletByAddress(walletData.address);
    if (existingWallet) {
      return res.status(400).json({ message: "Wallet already imported" });
    }

    // Encrypt private key
    const encryptedPrivateKey = encryptionService.encrypt(
      walletData.privateKey,
      userId
    );

    // Store in database
    const wallet = await storage.createWallet({
      userId,
      address: walletData.address,
      balance: "0",
      network,
      privateKeyEncrypted: encryptedPrivateKey,
    });

    res.json({
      id: wallet.id,
      address: wallet.address,
      network: wallet.network,
      balance: wallet.balance,
    });
  } catch (error: any) {
    console.error("Error importing wallet:", error);
    res.status(500).json({ message: error.message || "Failed to import wallet" });
  }
});

router.get("/web3/balance/:walletId", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Verify wallet belongs to user
    const wallet = await storage.getWallet(req.params.walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    const balance = await web3Service.getBalance(
      wallet.address,
      wallet.network || "ethereum"
    );

    // Update balance in database
    await storage.updateWalletBalance(wallet.id, balance);

    res.json({ balance, address: wallet.address });
  } catch (error) {
    console.error("Error fetching Web3 balance:", error);
    res.status(500).json({ message: "Failed to fetch balance" });
  }
});

router.post("/web3/send-transaction", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { walletId, to, amount } = req.body;

    // Verify wallet belongs to user
    const wallet = await storage.getWallet(walletId);
    if (!wallet || wallet.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this wallet" });
    }

    // Decrypt private key securely
    const privateKey = encryptionService.decrypt(
      wallet.privateKeyEncrypted || "",
      userId
    );

    // Send transaction
    const result = await web3Service.sendTransaction(
      privateKey,
      to,
      amount,
      wallet.network || "ethereum"
    );

    // Record transaction
    await storage.createTransaction({
      walletId: wallet.id,
      type: "send",
      from: wallet.address,
      to,
      value: amount,
      status: "confirmed",
      txHash: result.hash,
      network: wallet.network || "ethereum",
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error sending transaction:", error);
    res.status(500).json({ message: error.message || "Transaction failed" });
  }
});

export default router;
