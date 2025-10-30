import express, { Request, Response } from "express";
import path from "path";
import { BotCyberLab, BotBanking } from "./services/cyberLabService";
import { botLearningService } from "./services/botLearningService";
import { storage } from "./services/storage";
import { attackLogService } from "./services/attackLogService";
import { guardianAngel } from "./services/guardianAngelService";
import { crypterService } from "./services/crypterService";

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

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

// Start server
app.listen(port, () => {
  console.log(`[Server] Cyber Lab running on http://localhost:${port}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
});
