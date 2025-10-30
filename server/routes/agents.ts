
import { Router } from "express";
import { authenticateToken as isAuthenticated } from "../authService";
import { storage } from "../storage";
import { insertAgentSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { agentOrchestrator } from "../agentOrchestrator";

const router = Router();

// Agent routes
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const agents = await storage.getAllAgents();
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Failed to fetch agents" });
  }
});

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const agent = await storage.getAgent(req.params.id);
    res.json(agent);
  } catch (error) {
    console.error("Error fetching agent:", error);
    res.status(500).json({ message: "Failed to fetch agent" });
  }
});

router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    // Only admins can create agents
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const validation = insertAgentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid agent data", 
        error: fromError(validation.error).toString() 
      });
    }

    const agent = await storage.createAgent(validation.data);
    res.json(agent);
  } catch (error) {
    console.error("Error creating agent:", error);
    res.status(500).json({ message: "Failed to create agent" });
  }
});

router.post("/:id/status", isAuthenticated, async (req: any, res) => {
  try {
    // Only admins can update agent status
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Validate agent status update data
    const statusSchema = z.object({
      status: z.enum(["active", "idle", "error", "maintenance"]),
      currentTask: z.string().optional(),
    });
    
    const validation = statusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Invalid agent status data", 
        error: fromError(validation.error).toString() 
      });
    }

    await storage.updateAgentStatus(
      req.params.id, 
      validation.data.status, 
      validation.data.currentTask
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating agent status:", error);
    res.status(500).json({ message: "Failed to update agent status" });
  }
});

router.get("/:id/logs", isAuthenticated, async (req, res) => {
  try {
    const logs = await storage.getAgentLogs(req.params.id);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching agent logs:", error);
    res.status(500).json({ message: "Failed to fetch agent logs" });
  }
});

// Agent orchestration endpoint
router.post("/execute", async (req: any, res) => {
  try {
    const { task, agentType } = req.body;

    if (!task) {
      return res.status(400).json({ message: "Task is required" });
    }

    // Execute task through agent orchestrator
    const result = await agentOrchestrator.execute(task, agentType);

    res.json(result);
  } catch (error: any) {
    console.error("Error executing agent task:", error);
    res.status(500).json({ message: error.message || "Agent execution failed" });
  }
});

export default router;
