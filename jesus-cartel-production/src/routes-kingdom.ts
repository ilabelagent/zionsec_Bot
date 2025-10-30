/**
 * Kingdom Master Routes
 * Upload → Master → Preview → Publish workflow
 * RIDE WITH CHRIST
 */

import { Express, Request, Response } from "express";
import { kingdomMasterService } from "./services/kingdomMasterService";
import { jesusCartelService } from "./services/jesusCartelService";
import { visualizerService } from "./services/visualizerService";
import multer from "multer";
import path from "path";
import { createReadStream, existsSync } from "fs";

// Configure multer for WAV uploads
const storage = multer.diskStorage({
  destination: '/tmp/jesus-cartel/uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `upload_${uniqueSuffix}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.wav' && ext !== '.mp3' && ext !== '.flac') {
      return cb(new Error('Only WAV, MP3, and FLAC files are allowed'));
    }
    cb(null, true);
  }
});

export function setupKingdomRoutes(app: Express) {
  /**
   * Upload and master audio to Kingdom standards
   * POST /api/kingdom/upload
   */
  app.post("/api/kingdom/upload", upload.single("audio"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      const { title, artist, genre, description } = req.body;

      // Start upload and mastering process
      const preview = await kingdomMasterService.uploadAndMaster(req.file.path, {
        title,
        artist,
        genre,
        description
      });

      res.json({
        success: true,
        message: "Audio uploaded and mastering started",
        preview_id: preview.preview_id,
        status: preview.status,
        check_status: `/api/kingdom/preview/${preview.preview_id}`
      });

    } catch (error: any) {
      console.error("Upload and master error:", error);
      res.status(500).json({
        error: "Failed to upload and master audio",
        message: error.message
      });
    }
  });

  /**
   * Get preview status
   * GET /api/kingdom/preview/:preview_id
   */
  app.get("/api/kingdom/preview/:preview_id", (req: Request, res: Response) => {
    const { preview_id } = req.params;
    const preview = kingdomMasterService.getPreview(preview_id);

    if (!preview) {
      return res.status(404).json({ error: "Preview not found" });
    }

    res.json(preview);
  });

  /**
   * Get all previews ready for review
   * GET /api/kingdom/previews/ready
   */
  app.get("/api/kingdom/previews/ready", (req: Request, res: Response) => {
    const previews = kingdomMasterService.getPreviewsReady();
    res.json({
      count: previews.length,
      previews
    });
  });

  /**
   * Get all previews
   * GET /api/kingdom/previews
   */
  app.get("/api/kingdom/previews", (req: Request, res: Response) => {
    const previews = kingdomMasterService.getAllPreviews();
    const stats = kingdomMasterService.getStats();

    res.json({
      count: previews.length,
      stats,
      previews
    });
  });

  /**
   * Stream audio (original or mastered)
   * GET /api/kingdom/stream/:preview_id/:type
   */
  app.get("/api/kingdom/stream/:preview_id/:type", (req: Request, res: Response) => {
    const { preview_id, type } = req.params;

    if (type !== 'original' && type !== 'mastered') {
      return res.status(400).json({ error: "Type must be 'original' or 'mastered'" });
    }

    const audioPath = kingdomMasterService.getAudioPath(
      preview_id,
      type as 'original' | 'mastered'
    );

    if (!audioPath || !existsSync(audioPath)) {
      return res.status(404).json({ error: "Audio file not found" });
    }

    // Stream the audio file
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(audioPath)}"`);

    const stream = createReadStream(audioPath);
    stream.pipe(res);
  });

  /**
   * Approve preview for publishing
   * POST /api/kingdom/preview/:preview_id/approve
   */
  app.post("/api/kingdom/preview/:preview_id/approve", async (req: Request, res: Response) => {
    try {
      const { preview_id } = req.params;
      const preview = await kingdomMasterService.approveForPublish(preview_id);

      res.json({
        success: true,
        message: "Preview approved for publishing",
        preview
      });

    } catch (error: any) {
      console.error("Approval error:", error);
      res.status(500).json({
        error: "Failed to approve preview",
        message: error.message
      });
    }
  });

  /**
   * Publish immediately
   * POST /api/kingdom/preview/:preview_id/publish
   */
  app.post("/api/kingdom/preview/:preview_id/publish", async (req: Request, res: Response) => {
    try {
      const { preview_id } = req.params;
      const {
        network,
        walletId,
        mintNFT = true,
        createToken = false,
        generateVideo = false
      } = req.body;

      if (!network || !walletId) {
        return res.status(400).json({
          error: "Missing required fields: network, walletId"
        });
      }

      // Get publishing data
      const publishData = await kingdomMasterService.publishNow(preview_id, {
        network,
        walletId,
        mintNFT,
        createToken,
        generateVideo
      });

      // Start video generation if requested
      let videoJob;
      if (generateVideo && publishData.audio_path) {
        videoJob = await visualizerService.generateVideo(publishData.audio_path, {
          style: 'music_video',
          artist: publishData.artist,
          title: publishData.title,
          genre: publishData.genre
        });
      }

      res.json({
        success: true,
        message: "Publishing started",
        preview_id,
        publish_data: publishData,
        video_job: videoJob ? {
          job_id: videoJob.job_id,
          status: videoJob.status,
          check_status: `/api/visualizer/status/${videoJob.job_id}`
        } : null,
        next_steps: [
          "Audio is published with Kingdom Master quality",
          mintNFT ? "NFT minting will begin" : null,
          createToken ? "Token creation will begin" : null,
          generateVideo ? `Video generation started (check status at /api/visualizer/status/${videoJob?.job_id})` : null
        ].filter(Boolean)
      });

    } catch (error: any) {
      console.error("Publish error:", error);
      res.status(500).json({
        error: "Failed to publish",
        message: error.message
      });
    }
  });

  /**
   * Schedule for future publishing
   * POST /api/kingdom/preview/:preview_id/schedule
   */
  app.post("/api/kingdom/preview/:preview_id/schedule", async (req: Request, res: Response) => {
    try {
      const { preview_id } = req.params;
      const {
        scheduled_date,
        network,
        walletId,
        mintNFT = true,
        createToken = false,
        generateVideo = false
      } = req.body;

      if (!scheduled_date || !network || !walletId) {
        return res.status(400).json({
          error: "Missing required fields: scheduled_date, network, walletId"
        });
      }

      const scheduledDate = new Date(scheduled_date);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({
          error: "Scheduled date must be in the future"
        });
      }

      const preview = await kingdomMasterService.schedulePublish(preview_id, scheduledDate, {
        network,
        walletId,
        mintNFT,
        createToken,
        generateVideo
      });

      res.json({
        success: true,
        message: "Publishing scheduled",
        preview,
        scheduled_for: scheduledDate.toISOString()
      });

    } catch (error: any) {
      console.error("Schedule error:", error);
      res.status(500).json({
        error: "Failed to schedule publish",
        message: error.message
      });
    }
  });

  /**
   * Delete preview
   * DELETE /api/kingdom/preview/:preview_id
   */
  app.delete("/api/kingdom/preview/:preview_id", async (req: Request, res: Response) => {
    try {
      const { preview_id } = req.params;
      const deleted = await kingdomMasterService.deletePreview(preview_id);

      if (!deleted) {
        return res.status(404).json({ error: "Preview not found" });
      }

      res.json({
        success: true,
        message: "Preview deleted"
      });

    } catch (error: any) {
      console.error("Delete error:", error);
      res.status(500).json({
        error: "Failed to delete preview",
        message: error.message
      });
    }
  });

  /**
   * Kingdom Master health check
   * GET /api/kingdom/health
   */
  app.get("/api/kingdom/health", (req: Request, res: Response) => {
    const stats = kingdomMasterService.getStats();

    res.json({
      status: "operational",
      service: "Kingdom Master",
      motto: "RIDE WITH CHRIST",
      stats,
      timestamp: new Date().toISOString()
    });
  });

  console.log("✓ Kingdom Master routes registered - RIDE WITH CHRIST");
}
