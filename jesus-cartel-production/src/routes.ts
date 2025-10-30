import { Express, Request, Response } from "express";
import { jesusCartelService } from "./services/jesusCartelService";
import { web3Service } from "./services/web3Service";
import { storage } from "./services/storage";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../shared/audio"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../shared/images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /wav|mp3|flac|m4a|aac|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed!"));
    }
  },
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

export function setupRoutes(app: Express) {
  // File Upload Routes

  /**
   * POST /api/upload/audio
   * Upload audio file
   */
  app.post("/api/upload/audio", uploadAudio.single("audio"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      res.json({
        success: true,
        filename: req.file.filename,
        path: `/audio/${req.file.filename}`,
        url: `${req.protocol}://${req.get("host")}/audio/${req.file.filename}`,
        size: req.file.size,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/upload/image
   * Upload image file
   */
  app.post("/api/upload/image", uploadImage.single("image"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      res.json({
        success: true,
        filename: req.file.filename,
        path: `/images/${req.file.filename}`,
        url: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        size: req.file.size,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/songs/create
   * Create a new song entry
   */
  app.post("/api/songs/create", async (req: Request, res: Response) => {
    try {
      const { title, artist, audioFile, albumArt } = req.body;

      if (!title || !artist || !audioFile) {
        return res.status(400).json({ error: "title, artist, and audioFile are required" });
      }

      const song = await storage.createSong({
        title,
        artist,
        audioFile,
        albumArt,
      });

      res.json({ success: true, song });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/songs
   * Get all songs
   */
  app.get("/api/songs", async (req: Request, res: Response) => {
    try {
      const songs = await storage.getAllSongs();
      res.json({ songs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/songs/:id
   * Get a specific song
   */
  app.get("/api/songs/:id", async (req: Request, res: Response) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json({ song });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Music Publishing Routes

  /**
   * GET /api/releases/latest
   * Get latest music releases
   */
  app.get("/api/releases/latest", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const releases = await jesusCartelService.getLatestReleases(limit);
      res.json({ releases });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/releases/featured
   * Get featured releases
   */
  app.get("/api/releases/featured", async (req: Request, res: Response) => {
    try {
      const releases = await jesusCartelService.getFeaturedReleases();
      res.json({ releases });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/releases/:id
   * Get a specific release
   */
  app.get("/api/releases/:id", async (req: Request, res: Response) => {
    try {
      const release = await jesusCartelService.getRelease(req.params.id);
      if (!release) {
        return res.status(404).json({ error: "Release not found" });
      }
      res.json({ release });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/releases/:id/stream
   * Track a stream for a release
   */
  app.post("/api/releases/:id/stream", async (req: Request, res: Response) => {
    try {
      const { userId, duration, completionRate } = req.body;
      await jesusCartelService.trackStreams(
        req.params.id,
        userId,
        duration,
        completionRate
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/releases/:id/like
   * Like a release
   */
  app.post("/api/releases/:id/like", async (req: Request, res: Response) => {
    try {
      await jesusCartelService.likeRelease(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event Routes

  /**
   * GET /api/events/upcoming
   * Get upcoming events
   */
  app.get("/api/events/upcoming", async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = await jesusCartelService.getUpcomingEvents(limit);
      res.json({ events });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/events/featured
   * Get featured events
   */
  app.get("/api/events/featured", async (req: Request, res: Response) => {
    try {
      const events = await jesusCartelService.getFeaturedEvents();
      res.json({ events });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/events/:id
   * Get a specific event
   */
  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const event = await jesusCartelService.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json({ event });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Publishing Routes

  /**
   * POST /api/publish/song
   * Publish a song with NFT + Token
   */
  app.post("/api/publish/song", async (req: Request, res: Response) => {
    try {
      const { songId, walletId, options } = req.body;

      if (!songId || !walletId) {
        return res.status(400).json({
          error: "songId and walletId are required"
        });
      }

      const result = await jesusCartelService.publishSong(
        songId,
        walletId,
        options || {}
      );

      res.json({
        success: true,
        result
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Web3 Wallet Routes

  /**
   * POST /api/wallet/create
   * Create a new Web3 wallet
   */
  app.post("/api/wallet/create", async (req: Request, res: Response) => {
    try {
      const { userId, network } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const wallet = await web3Service.createWallet(userId, network || "ethereum");

      res.json({
        success: true,
        wallet: {
          address: wallet.address,
          // Note: In production, NEVER return private key in API response
          // This is for demonstration only
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/wallet/import/mnemonic
   * Import wallet from mnemonic
   */
  app.post("/api/wallet/import/mnemonic", async (req: Request, res: Response) => {
    try {
      const { mnemonic } = req.body;

      if (!mnemonic) {
        return res.status(400).json({ error: "mnemonic is required" });
      }

      const wallet = await web3Service.importWalletFromMnemonic(mnemonic);

      res.json({
        success: true,
        wallet
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/wallet/import/privatekey
   * Import wallet from private key
   */
  app.post("/api/wallet/import/privatekey", async (req: Request, res: Response) => {
    try {
      const { privateKey } = req.body;

      if (!privateKey) {
        return res.status(400).json({ error: "privateKey is required" });
      }

      const wallet = await web3Service.importWalletFromPrivateKey(privateKey);

      res.json({
        success: true,
        wallet
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/wallet/:address/balance
   * Get wallet balance
   */
  app.get("/api/wallet/:address/balance", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      const network = (req.query.network as string) || "ethereum";

      const balance = await web3Service.getBalance(address, network);

      res.json({
        address,
        network,
        balance
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/transaction/send
   * Send transaction
   */
  app.post("/api/transaction/send", async (req: Request, res: Response) => {
    try {
      const { privateKey, to, amount, network } = req.body;

      if (!privateKey || !to || !amount) {
        return res.status(400).json({
          error: "privateKey, to, and amount are required"
        });
      }

      const result = await web3Service.sendTransaction(
        privateKey,
        to,
        amount,
        network || "ethereum"
      );

      res.json({
        success: true,
        transaction: result
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/transaction/:hash
   * Get transaction details
   */
  app.get("/api/transaction/:hash", async (req: Request, res: Response) => {
    try {
      const { hash } = req.params;
      const network = (req.query.network as string) || "ethereum";

      const transaction = await web3Service.getTransaction(hash, network);

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.json({ transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/networks
   * Get supported networks
   */
  app.get("/api/networks", (req: Request, res: Response) => {
    res.json({
      networks: [
        { id: "ethereum", name: "Ethereum Mainnet", symbol: "ETH" },
        { id: "polygon", name: "Polygon", symbol: "MATIC" },
        { id: "bsc", name: "BNB Smart Chain", symbol: "BNB" },
        { id: "arbitrum", name: "Arbitrum One", symbol: "ETH" },
        { id: "optimism", name: "Optimism", symbol: "ETH" }
      ]
    });
  });
}
