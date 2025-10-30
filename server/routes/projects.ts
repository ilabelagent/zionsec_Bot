
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { ipfsPinningService } from "../ipfsPinningService";
import multer from "multer";

const router = Router();

// Configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Project Upload routes (IPFS with guaranteed 2+ year storage)
// Upload a project to IPFS with guaranteed pinning
router.post("/upload", isAuthenticated, upload.single("file"), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { projectName, description, metadata } = req.body;

    if (!projectName) {
      return res.status(400).json({ message: "Project name is required" });
    }

    // Upload to IPFS with guaranteed pinning
    const pinningResult = await ipfsPinningService.uploadWithPinning(
      req.file.buffer,
      req.file.originalname,
      {
        name: projectName,
        description,
        projectId: projectName,
        userId,
      }
    );

    // Save upload record to database
    const projectUpload = await storage.createProjectUpload({
      userId,
      projectName,
      description: description || null,
      ipfsHash: pinningResult.ipfsHash,
      ipfsUrl: pinningResult.ipfsUrl,
      pinataUrl: pinningResult.pinataUrl || null,
      fileSize: pinningResult.size,
      pinned: pinningResult.pinned,
      pinnedAt: pinningResult.pinned ? new Date() : null,
      expiresAt: pinningResult.expiresAt || null,
      publishStatus: "draft",
      provider: pinningResult.provider,
      metadata: metadata ? JSON.parse(metadata) : null,
    });

    res.json({
      success: true,
      upload: projectUpload,
      pinningResult,
    });
  } catch (error) {
    console.error("Error uploading project to IPFS:", error);
    res.status(500).json({
      message: "Failed to upload project to IPFS",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get all project uploads for the current user
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const projects = await storage.getProjectUploadsByUserId(userId);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Get a specific project upload by ID
router.get("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const project = await storage.getProjectUploadById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify ownership
    if (project.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    // Increment view count
    await storage.incrementProjectViews(req.params.id);

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// Update project publish status
router.patch("/:id/publish", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { publishStatus } = req.body;

    if (!["draft", "published", "archived", "unpublished"].includes(publishStatus)) {
      return res.status(400).json({ message: "Invalid publish status" });
    }

    const project = await storage.getProjectUploadById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify ownership
    if (project.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    const updatedProject = await storage.updateProjectPublishStatus(
      req.params.id,
      publishStatus,
      publishStatus === "published" ? new Date() : null
    );

    res.json({
      success: true,
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({ message: "Failed to update project status" });
  }
});

// Delete a project upload
router.delete("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { unpinFromIPFS } = req.query;

    const project = await storage.getProjectUploadById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify ownership
    if (project.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    // Optionally unpin from IPFS
    if (unpinFromIPFS === "true" && project.pinned) {
      try {
        await ipfsPinningService.unpin(project.ipfsHash);
      } catch (unpinError) {
        console.error("Failed to unpin from IPFS:", unpinError);
        // Continue with deletion even if unpin fails
      }
    }

    await storage.deleteProjectUpload(req.params.id);

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

// Check IPFS pin status for a project
router.get("/:id/pin-status", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const project = await storage.getProjectUploadById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Verify ownership
    if (project.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    const pinStatus = await ipfsPinningService.checkPinStatus(project.ipfsHash);

    res.json({
      ...pinStatus,
      projectId: project.id,
      ipfsHash: project.ipfsHash,
      provider: project.provider,
    });
  } catch (error) {
    console.error("Error checking pin status:", error);
    res.status(500).json({ message: "Failed to check pin status" });
  }
});

export default router;
