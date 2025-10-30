// Valifi Kingdom Platform API Routes - blueprint: javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { authenticateToken as isAuthenticated } from "./authService";
import { storage } from "./storage";

import {
  insertWalletSchema,
  insertTransactionSchema,
  insertNftSchema,
  insertTokenSchema,
  insertSongSchema,
  insertAgentSchema,
  insertSecurityEventSchema,
  insertPaymentSchema,
  insertKycRecordSchema,
  insertQuantumJobSchema,
  insertCryptoPaymentSchema,
  insertTradingBotSchema,
  insertBotExecutionSchema,
  insertArmorWalletSchema,
  insertMevEventSchema,
  insertExchangeOrderSchema,
  insertLiquidityPoolSchema,
  insertMixingRequestSchema,
  insertForumCategorySchema,
  insertForumThreadSchema,
  insertForumReplySchema,
  insertChatSessionSchema,
  insertChatMessageSchema,
  insertMetalInventorySchema,
  insertMetalTradeSchema,
  insertMetalProductSchema,
  insertMetalOwnershipSchema,
  insertBlogPostSchema,
  insertUserDashboardConfigSchema,
  insertDashboardWidgetSchema,
  insertUserWidgetPreferenceSchema,
  insertAdminUserSchema,
  insertAdminAuditLogSchema,
  insertAdminBroadcastSchema,
  insertBotMarketplaceListingSchema,
  insertBotRentalSchema,
  insertBotSubscriptionSchema,
  insertBotReviewSchema,
  insertBotLearningSessionSchema,
  insertBotTrainingDataSchema,
  insertBotSkillSchema,
  insertP2POfferSchema,
  insertP2POrderSchema,
  insertP2PPaymentMethodSchema,
  insertP2PChatMessageSchema,
  insertP2PDisputeSchema,
  insertP2PReviewSchema,
  insertWalletConnectSessionSchema,
  insertCelebrityProfileSchema,
  insertFanFollowSchema,
  insertFanStakeSchema,
  insertFanBetSchema,
  insertPredictionMarketSchema,
  insertCelebrityContentSchema,
  insertSpectrumPlanSchema,
  insertUserSpectrumSubscriptionSchema,
  insertSpectrumEarningSchema,
  insertIndividualAssetSchema,
  insertEtherealElementSchema,
  insertEtherealOwnershipSchema,
  insertJesusCartelReleaseSchema,
  insertJesusCartelEventSchema,
  insertJesusCartelStreamSchema,
  insertProjectUploadSchema,
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";
import { web3Service } from "./web3Service";
import { jesusCartelService } from "./jesusCartelService";
import { agentOrchestrator } from "./agentOrchestrator";
import { websocketService } from "./websocketService";
import { encryptionService } from "./encryptionService";
import { cryptoProcessorService } from "./cryptoProcessorService";
import { tradingBotService } from "./tradingBotService";
import { armorWalletService } from "./armorWalletService";
import { marketDataService } from "./marketDataService";
import { botLearningService } from "./botLearningService";
import { brokerIntegrationService } from "./brokerIntegrationService";
import { alpacaBrokerService } from "./alpacaBrokerService";
import { botStocks, botOptions, type TradeOrder } from "./financialServicesBot";
import { prayerService } from "./prayerService";
import { insertPrayerSchema, insertScriptureSchema, insertPrayerTradeCorrelationSchema, insertCharitySchema, insertTithingConfigSchema, insertTithingHistorySchema } from "@shared/schema";
import { tithingService } from "./tithingService";
import { etherealService } from "./etherealService";
import { conversationMemoryService } from "./conversationMemoryService";
import { ipfsPinningService } from "./ipfsPinningService";
import { telegramBotService } from "./telegramBotService";
import { telegramAdminHandler } from "./telegramAdminHandler";
import { masterOrchestrator } from "./masterOrchestrator";
import multer from "multer";
import walletsRouter from "./routes/wallets";
import transactionsRouter from "./routes/transactions";
import nftsRouter from "./routes/nfts";
import tokensRouter from "./routes/tokens";
import songsRouter from "./routes/songs";
import jesusCartelRouter from "./routes/jesus-cartel";
import projectsRouter from "./routes/projects";
import agentsRouter from "./routes/agents";
import communityRouter from "./routes/community";
import multichainRouter from "./routes/multichain";
import securityRouter from "./routes/security";
import paymentsRouter from "./routes/payments";
import kycRouter from "./routes/kyc";

export async function registerRoutes(app: Express): Promise<Server> {


  // Admin check middleware with role attachment
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Load and attach adminUser for role-based checks
      const adminUser = await storage.getAdminUser(userId);
      if (!adminUser) {
        return res.status(403).json({ message: "Admin profile not found" });
      }
      
      req.adminUser = adminUser;
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Super admin check middleware
  const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.adminUser?.role !== "super_admin") {
      return res.status(403).json({ message: "Super admin access required" });
    }
    next();
  };

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.use("/api/wallets", walletsRouter);
  app.use("/api/transactions", transactionsRouter);
  app.use("/api/nfts", nftsRouter);
  app.use("/api/tokens", tokensRouter);
  app.use("/api/songs", songsRouter);
  app.use("/api/jesus-cartel", jesusCartelRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/agents", agentsRouter);
  app.use("/api/community", communityRouter);
  app.use("/api/multichain", multichainRouter);
  app.use("/api/security", securityRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/kyc", kycRouter);

  // Dashboard stats endpoint
  app.get("/api/stats/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [agents, wallets, securityEvents] = await Promise.all([
        storage.getAllAgents(),
        storage.getWalletsByUserId(userId),
        storage.getUnresolvedSecurityEvents(),
      ]);

      const activeAgents = agents.filter(a => a.status === 'active').length;
      const hasWallets = wallets.length > 0;
      const threatLevel = securityEvents.length > 0 ? 
        securityEvents[0].threatLevel : 'none';

      res.json({
        activeAgents,
        totalAgents: agents.length,
        blockchainStatus: hasWallets ? 'live' : 'not_configured',
        securityLevel: threatLevel === 'none' || threatLevel === 'low' ? 'protected' : 'warning',
        quantumStatus: 'ready', // Will be real once IBM Quantum is integrated
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  
  // Public demo endpoints for terminal page
  app.get("/api/public/demo-bots", async (_req, res) => {
    try {
      const demoBots = [
        {
          id: "demo-bot-1",
          userId: "demo",
          name: "QUANTUM GRID v2.1",
          strategy: "grid",
          tradingPair: "BTC/USDT",
          exchange: "binance",
          isActive: true,
          totalProfit: "2847.50",
          totalLoss: "1230.25",
          winRate: "68.5",
          totalTrades: 142,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-2",
          userId: "demo",
          name: "CYBER SCALPER",
          strategy: "scalping",
          tradingPair: "ETH/USDT",
          exchange: "bybit",
          isActive: true,
          totalProfit: "1523.80",
          totalLoss: "892.15",
          winRate: "72.3",
          totalTrades: 287,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-3",
          userId: "demo",
          name: "MEV HUNTER",
          strategy: "mev",
          tradingPair: "SOL/USDT",
          exchange: "kucoin",
          isActive: true,
          totalProfit: "4125.30",
          totalLoss: "2341.60",
          winRate: "64.2",
          totalTrades: 98,
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-4",
          userId: "demo",
          name: "ARBITRAGE MATRIX",
          strategy: "arbitrage",
          tradingPair: "BNB/USDT",
          exchange: "binance",
          isActive: false,
          totalProfit: "856.40",
          totalLoss: "1142.80",
          winRate: "45.8",
          totalTrades: 63,
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-5",
          userId: "demo",
          name: "DCA ACCUMULATOR",
          strategy: "dca",
          tradingPair: "ADA/USDT",
          exchange: "bybit",
          isActive: true,
          totalProfit: "3241.90",
          totalLoss: "1875.35",
          winRate: "71.5",
          totalTrades: 195,
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
        {
          id: "demo-bot-6",
          userId: "demo",
          name: "MOMENTUM AI",
          strategy: "momentum_ai",
          tradingPair: "MATIC/USDT",
          exchange: "kucoin",
          isActive: false,
          totalProfit: "1847.25",
          totalLoss: "2103.50",
          winRate: "52.1",
          totalTrades: 178,
          createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        },
      ];
      res.json(demoBots);
    } catch (error) {
      console.error("Error fetching demo bots:", error);
      res.status(500).json({ message: "Failed to fetch demo bots" });
    }
  });

  app.get("/api/public/demo-executions", async (_req, res) => {
    try {
      const demoExecutions = [
        {
          id: "demo-exec-1",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43250.50",
          exitPrice: "43485.75",
          profit: "235.25",
          status: "completed",
          executedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-2",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2285.30",
          exitPrice: "2292.80",
          profit: "7.50",
          status: "completed",
          executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-3",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "98.45",
          exitPrice: "99.82",
          profit: "137.00",
          status: "completed",
          executedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-4",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43485.75",
          exitPrice: "43312.40",
          profit: "-173.35",
          status: "completed",
          executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-5",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.5640",
          exitPrice: "0.5782",
          profit: "142.00",
          status: "completed",
          executedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-6",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2292.80",
          exitPrice: "2298.45",
          profit: "5.65",
          status: "completed",
          executedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-7",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "99.82",
          exitPrice: "98.95",
          profit: "-87.00",
          status: "completed",
          executedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-8",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43312.40",
          exitPrice: "43587.90",
          profit: "275.50",
          status: "completed",
          executedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-9",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.5782",
          exitPrice: "0.5895",
          profit: "113.00",
          status: "completed",
          executedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-10",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2298.45",
          exitPrice: "2303.20",
          profit: "4.75",
          status: "completed",
          executedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-11",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "98.95",
          exitPrice: "100.15",
          profit: "120.00",
          status: "completed",
          executedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-12",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43587.90",
          exitPrice: "43425.60",
          profit: "-162.30",
          status: "completed",
          executedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-13",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.5895",
          exitPrice: "0.6012",
          profit: "117.00",
          status: "completed",
          executedAt: new Date(Date.now() - 13 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-14",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2303.20",
          exitPrice: "2287.55",
          profit: "-15.65",
          status: "completed",
          executedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-15",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "100.15",
          exitPrice: "101.45",
          profit: "130.00",
          status: "completed",
          executedAt: new Date(Date.now() - 15 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-16",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43425.60",
          exitPrice: "43695.20",
          profit: "269.60",
          status: "completed",
          executedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-17",
          botId: "demo-bot-5",
          strategy: "dca",
          entryPrice: "0.6012",
          exitPrice: "0.5948",
          profit: "-64.00",
          status: "completed",
          executedAt: new Date(Date.now() - 17 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-18",
          botId: "demo-bot-2",
          strategy: "scalping",
          entryPrice: "2287.55",
          exitPrice: "2294.10",
          profit: "6.55",
          status: "completed",
          executedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-19",
          botId: "demo-bot-3",
          strategy: "mev",
          entryPrice: "101.45",
          exitPrice: "100.78",
          profit: "-67.00",
          status: "completed",
          executedAt: new Date(Date.now() - 19 * 60 * 60 * 1000),
        },
        {
          id: "demo-exec-20",
          botId: "demo-bot-1",
          strategy: "grid",
          entryPrice: "43695.20",
          exitPrice: "43892.50",
          profit: "197.30",
          status: "completed",
          executedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
      ];
      res.json(demoExecutions);
    } catch (error) {
      console.error("Error fetching demo executions:", error);
      res.status(500).json({ message: "Failed to fetch demo executions" });
    }
  });

  // Trading bot routes
  app.post("/api/trading-bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertTradingBotSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid bot data", error: fromError(validation.error).toString() });
      }

      const bot = await storage.createBot({ ...validation.data, userId });
      res.json(bot);
    } catch (error) {
      console.error("Error creating trading bot:", error);
      res.status(500).json({ message: "Failed to create trading bot" });
    }
  });

  app.get("/api/trading-bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bots = await storage.getUserBots(userId);
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.post("/api/trading-bots/:botId/execute", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { botId } = req.params;

      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const marketData = await tradingBotService.getMarketData(bot.exchange, bot.tradingPair);
      const execution = await tradingBotService.executeBot(bot, marketData);
      res.json(execution);
    } catch (error: any) {
      console.error("Error executing bot:", error);
      res.status(500).json({ message: error.message || "Bot execution failed" });
    }
  });

  app.get("/api/trading-bots/:botId/executions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { botId } = req.params;

      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const executions = await storage.getBotExecutions(botId);
      res.json(executions);
    } catch (error) {
      console.error("Error fetching bot executions:", error);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  app.patch("/api/trading-bots/:botId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { botId } = req.params;

      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateBot(botId, req.body);
      const updatedBot = await storage.getBot(botId);
      res.json(updatedBot);
    } catch (error) {
      console.error("Error updating bot:", error);
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  app.get("/api/bot-executions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bots = await storage.getUserBots(userId);
      const botIds = bots.map(b => b.id);
      
      const allExecutions = await Promise.all(
        botIds.map(id => storage.getBotExecutions(id))
      );
      
      const executions = allExecutions.flat();
      res.json(executions);
    } catch (error) {
      console.error("Error fetching all bot executions:", error);
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  });

  // Bot Marketplace routes
  app.get("/api/bots/marketplace", isAuthenticated, async (req, res) => {
    try {
      const bots = await storage.getAllBots(100, 0);
      const botsWithStats = await Promise.all(
        bots.map(async (bot) => {
          const skills = await storage.getBotSkills(bot.id);
          const trainingSessions = await storage.getBotLearningSessions(bot.id);
          const totalXP = skills.reduce((sum, skill) => sum + (skill.experiencePoints || 0), 0);
          const avgLevel = skills.length > 0 
            ? skills.reduce((sum, skill) => sum + (skill.skillLevel || 0), 0) / skills.length 
            : 0;
          
          return {
            ...bot,
            totalSkills: skills.length,
            totalXP,
            avgLevel: Math.round(avgLevel),
            totalTrainingSessions: trainingSessions.length,
            completedSessions: trainingSessions.filter(s => s.status === 'completed').length,
          };
        })
      );
      res.json(botsWithStats);
    } catch (error) {
      console.error("Error fetching marketplace bots:", error);
      res.status(500).json({ message: "Failed to fetch marketplace bots" });
    }
  });

  app.get("/api/bots/:id/skills", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const skills = await storage.getBotSkills(id);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching bot skills:", error);
      res.status(500).json({ message: "Failed to fetch bot skills" });
    }
  });

  app.get("/api/bots/:id/training", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const sessions = await storage.getBotLearningSessions(id);
      const trainingData = await storage.getBotTrainingData(id);
      res.json({ sessions, trainingData });
    } catch (error) {
      console.error("Error fetching bot training:", error);
      res.status(500).json({ message: "Failed to fetch bot training" });
    }
  });

  app.post("/api/bots/:id/ask", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;
      const userId = req.user.claims.sub;

      if (!question || !answer) {
        return res.status(400).json({ message: "Question and answer required" });
      }

      // Record as training data
      const trainingData = await storage.createBotTrainingData({
        botId: id,
        dataType: 'user_interaction',
        input: question,
        expectedOutput: null,
        actualOutput: answer,
        reward: '10',
      });

      // Award XP for the interaction
      const skillResult = await botLearningService.progressBotSkill(id, 'user_interaction', 10, 'communication');

      // Emit real-time update
      websocketService.emitTradingEvent({
        type: 'bot_started',
        botId: id,
        data: { 
          message: 'Bot learned from user interaction',
          skillUpdate: skillResult,
          trainingData,
        },
      });

      res.json({ 
        success: true, 
        trainingData,
        skillUpdate: skillResult,
      });
    } catch (error) {
      console.error("Error recording bot question:", error);
      res.status(500).json({ message: "Failed to record question" });
    }
  });

  app.post("/api/bots/:id/answer", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { questionId, answer, context } = req.body;
      const userId = req.user.claims.sub;

      if (!answer) {
        return res.status(400).json({ message: "Answer is required" });
      }

      // Store the answer as training data with high reward for expert input
      const trainingData = await storage.createBotTrainingData({
        botId: id,
        dataType: 'expert_answer',
        input: context || questionId,
        expectedOutput: answer,
        actualOutput: answer,
        reward: '20', // Higher reward for expert answers
      });

      // Award bonus XP for expert knowledge
      const skillResult = await botLearningService.progressBotSkill(
        id, 
        'expert_knowledge', 
        20, 
        'learning'
      );

      // Update bot memory with the expert answer
      if (context) {
        await botLearningService.updateBotMemory(
          id,
          'expert_answers',
          questionId || `answer_${Date.now()}`,
          { question: context, answer, timestamp: new Date().toISOString() },
          90 // High confidence for expert answers
        );
      }

      res.json({ 
        success: true, 
        trainingData,
        skillUpdate: skillResult,
        message: 'Expert answer recorded successfully',
      });
    } catch (error) {
      console.error("Error recording bot answer:", error);
      res.status(500).json({ message: "Failed to record answer" });
    }
  });

  app.post("/api/bots/:id/train/manual", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { sessionType = 'supervised', trainingDataset, datasetFile } = req.body;

      // If dataset file is provided, store it as training data first
      if (datasetFile) {
        try {
          const dataset = JSON.parse(datasetFile);
          if (Array.isArray(dataset)) {
            for (const item of dataset.slice(0, 100)) { // Limit to 100 items per upload
              await storage.createBotTrainingData({
                botId: id,
                dataType: 'uploaded_dataset',
                input: item.input || item,
                expectedOutput: item.output || null,
                actualOutput: null,
                reward: '5',
              });
            }
          }
        } catch (parseError) {
          console.error("Error parsing dataset:", parseError);
        }
      }

      // Start learning session
      const sessionId = await botLearningService.startLearningSession(
        id,
        sessionType,
        trainingDataset || (datasetFile ? 'uploaded_dataset' : undefined)
      );

      if (!sessionId) {
        return res.status(500).json({ message: "Failed to start training session" });
      }

      // Simulate training progress with WebSocket updates
      setTimeout(async () => {
        const bot = await storage.getBot(id);
        if (bot) {
          const performanceAfter = {
            winRate: parseFloat(bot.winRate || "0") + Math.random() * 5,
            totalProfit: parseFloat(bot.totalProfit || "0") + Math.random() * 100,
            totalLoss: parseFloat(bot.totalLoss || "0"),
            totalTrades: (bot.totalTrades || 0) + 1,
            timestamp: new Date().toISOString(),
          };

          const result = await botLearningService.completeLearningSession(sessionId, performanceAfter);
          
          // Emit completion event
          websocketService.emitTradingEvent({
            type: 'execution_complete',
            botId: id,
            data: {
              sessionId,
              improved: result.improved,
              improvementRate: result.improvementRate,
            },
          });
        }
      }, 5000); // 5 seconds simulation

      res.json({ 
        success: true, 
        sessionId,
        message: 'Training session started',
      });
    } catch (error) {
      console.error("Error starting manual training:", error);
      res.status(500).json({ message: "Failed to start training" });
    }
  });

  // ===========================
  // Broker Integration Routes
  // ===========================

  // Connect broker account
  app.post("/api/broker/connect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { provider, apiKey, apiSecret, accountType } = req.body;

      if (!provider || !apiKey || !apiSecret) {
        return res.status(400).json({ message: "Missing required fields: provider, apiKey, apiSecret" });
      }

      const brokerAccount = await brokerIntegrationService.connectBroker(
        userId,
        provider,
        apiKey,
        apiSecret,
        accountType || "paper"
      );

      res.json(brokerAccount);
    } catch (error: any) {
      console.error("Error connecting broker:", error);
      res.status(500).json({ message: error.message || "Failed to connect broker" });
    }
  });

  // Get account info
  app.get("/api/broker/account/:accountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const accountInfo = await brokerIntegrationService.getAccountInfo(accountId);
      res.json(accountInfo);
    } catch (error: any) {
      console.error("Error fetching account info:", error);
      res.status(500).json({ message: error.message || "Failed to fetch account info" });
    }
  });

  // Get all broker accounts for user
  app.get("/api/broker/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const accounts = await storage.getUserBrokerAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching broker accounts:", error);
      res.status(500).json({ message: "Failed to fetch broker accounts" });
    }
  });

  // Place order
  app.post("/api/broker/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { brokerAccountId, symbol, qty, side, type, time_in_force, limit_price, stop_price } = req.body;

      const account = await storage.getBrokerAccount(brokerAccountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const order = await brokerIntegrationService.placeOrder(brokerAccountId, {
        symbol,
        qty,
        side,
        type,
        time_in_force,
        limit_price,
        stop_price,
      });

      res.json(order);
    } catch (error: any) {
      console.error("Error placing order:", error);
      res.status(500).json({ message: error.message || "Failed to place order" });
    }
  });

  // Get positions
  app.get("/api/broker/positions/:accountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const positions = await brokerIntegrationService.getPositions(accountId);
      res.json(positions);
    } catch (error: any) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch positions" });
    }
  });

  // Get order history
  app.get("/api/broker/history/:accountId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId } = req.params;
      const { status, limit, after, until, direction } = req.query;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const orders = await brokerIntegrationService.getOrderHistory(accountId, {
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined,
        after: after as string,
        until: until as string,
        direction: direction as any,
      });

      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching order history:", error);
      res.status(500).json({ message: error.message || "Failed to fetch order history" });
    }
  });

  // Get market data
  app.get("/api/broker/market-data/:accountId/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accountId, symbol } = req.params;

      const account = await storage.getBrokerAccount(accountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const marketData = await brokerIntegrationService.getMarketData(accountId, symbol);
      res.json(marketData);
    } catch (error: any) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: error.message || "Failed to fetch market data" });
    }
  });

  // Cancel order
  app.delete("/api/broker/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId } = req.params;

      const order = await storage.getBrokerOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const account = await storage.getBrokerAccount(order.brokerAccountId);
      if (!account || account.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const cancelledOrder = await brokerIntegrationService.cancelOrder(order.brokerAccountId, orderId);
      res.json(cancelledOrder);
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: error.message || "Failed to cancel order" });
    }
  });

  // Alpaca Broker routes - Direct integration with Alpaca paper trading
  app.post("/api/broker/alpaca/initialize", isAuthenticated, async (req: any, res) => {
    try {
      const { apiKey, secretKey } = req.body;
      
      if (!apiKey && !secretKey) {
        alpacaBrokerService.initialize();
      } else {
        alpacaBrokerService.initialize({
          keyId: apiKey,
          secretKey: secretKey,
          paper: true,
        });
      }
      
      res.json({ message: "Alpaca broker initialized successfully", paper: true });
    } catch (error: any) {
      console.error("Error initializing Alpaca:", error);
      res.status(500).json({ message: error.message || "Failed to initialize Alpaca" });
    }
  });

  app.get("/api/broker/alpaca/account", isAuthenticated, async (req: any, res) => {
    try {
      const account = await alpacaBrokerService.getAccount();
      res.json(account);
    } catch (error: any) {
      console.error("Error fetching Alpaca account:", error);
      res.status(500).json({ message: error.message || "Failed to fetch account" });
    }
  });

  app.get("/api/broker/alpaca/positions", isAuthenticated, async (req: any, res) => {
    try {
      const positions = await alpacaBrokerService.getPositions();
      res.json(positions);
    } catch (error: any) {
      console.error("Error fetching Alpaca positions:", error);
      res.status(500).json({ message: error.message || "Failed to fetch positions" });
    }
  });

  app.get("/api/broker/alpaca/positions/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const position = await alpacaBrokerService.getPosition(symbol);
      if (!position) {
        return res.status(404).json({ message: `No position found for ${symbol}` });
      }
      res.json(position);
    } catch (error: any) {
      console.error("Error fetching Alpaca position:", error);
      res.status(500).json({ message: error.message || "Failed to fetch position" });
    }
  });

  app.post("/api/broker/alpaca/order", isAuthenticated, async (req: any, res) => {
    try {
      const {
        symbol,
        qty,
        notional,
        side,
        type,
        timeInForce,
        limitPrice,
        stopPrice,
        trailPrice,
        trailPercent,
        extendedHours,
        clientOrderId,
      } = req.body;

      if (!symbol || !side || !type) {
        return res.status(400).json({ 
          message: "Missing required fields: symbol, side, type" 
        });
      }

      const order = await alpacaBrokerService.placeOrder({
        symbol,
        qty: qty ? parseFloat(qty) : undefined,
        notional: notional ? parseFloat(notional) : undefined,
        side,
        type,
        timeInForce: timeInForce || 'day',
        limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
        stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
        trailPrice: trailPrice ? parseFloat(trailPrice) : undefined,
        trailPercent: trailPercent ? parseFloat(trailPercent) : undefined,
        extendedHours,
        clientOrderId,
      });

      res.json(order);
    } catch (error: any) {
      console.error("Error placing Alpaca order:", error);
      res.status(500).json({ message: error.message || "Failed to place order" });
    }
  });

  app.get("/api/broker/alpaca/orders", isAuthenticated, async (req: any, res) => {
    try {
      const { status, limit, after, until, direction, symbols } = req.query;
      
      const orders = await alpacaBrokerService.getOrders({
        status: status as any,
        limit: limit ? parseInt(limit as string) : undefined,
        after: after as string,
        until: until as string,
        direction: direction as any,
        symbols: symbols as string,
      });
      
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching Alpaca orders:", error);
      res.status(500).json({ message: error.message || "Failed to fetch orders" });
    }
  });

  app.get("/api/broker/alpaca/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const order = await alpacaBrokerService.getOrder(orderId);
      res.json(order);
    } catch (error: any) {
      console.error("Error fetching Alpaca order:", error);
      res.status(500).json({ message: error.message || "Failed to fetch order" });
    }
  });

  app.delete("/api/broker/alpaca/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      await alpacaBrokerService.cancelOrder(orderId);
      res.json({ message: "Order cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling Alpaca order:", error);
      res.status(500).json({ message: error.message || "Failed to cancel order" });
    }
  });

  app.get("/api/broker/alpaca/historical/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { timeframe, start, end, limit } = req.query;

      if (!timeframe || !start) {
        return res.status(400).json({ 
          message: "Missing required parameters: timeframe, start" 
        });
      }

      const bars = await alpacaBrokerService.getHistoricalBars({
        symbol,
        timeframe: timeframe as any,
        start: start as string,
        end: end as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(bars);
    } catch (error: any) {
      console.error("Error fetching historical bars:", error);
      res.status(500).json({ message: error.message || "Failed to fetch historical bars" });
    }
  });

  app.get("/api/broker/alpaca/quote/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const quote = await alpacaBrokerService.getLatestQuote(symbol);
      res.json(quote);
    } catch (error: any) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ message: error.message || "Failed to fetch quote" });
    }
  });

  app.get("/api/broker/alpaca/trade/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const trade = await alpacaBrokerService.getLatestTrade(symbol);
      res.json(trade);
    } catch (error: any) {
      console.error("Error fetching trade:", error);
      res.status(500).json({ message: error.message || "Failed to fetch trade" });
    }
  });

  app.get("/api/broker/alpaca/pnl", isAuthenticated, async (req: any, res) => {
    try {
      const pnl = await alpacaBrokerService.calculatePnL();
      res.json(pnl);
    } catch (error: any) {
      console.error("Error calculating PnL:", error);
      res.status(500).json({ message: error.message || "Failed to calculate PnL" });
    }
  });

  app.post("/api/broker/alpaca/close-position/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { qty } = req.body;
      
      const order = await alpacaBrokerService.closePosition(symbol, qty ? parseFloat(qty) : undefined);
      res.json(order);
    } catch (error: any) {
      console.error("Error closing position:", error);
      res.status(500).json({ message: error.message || "Failed to close position" });
    }
  });

  app.post("/api/broker/alpaca/close-all-positions", isAuthenticated, async (req: any, res) => {
    try {
      const orders = await alpacaBrokerService.closeAllPositions();
      res.json({ message: "All positions closed", orders });
    } catch (error: any) {
      console.error("Error closing all positions:", error);
      res.status(500).json({ message: error.message || "Failed to close all positions" });
    }
  });

  app.get("/api/broker/alpaca/market-status", isAuthenticated, async (req: any, res) => {
    try {
      const isOpen = await alpacaBrokerService.isMarketOpen();
      res.json({ isOpen });
    } catch (error: any) {
      console.error("Error checking market status:", error);
      res.status(500).json({ message: error.message || "Failed to check market status" });
    }
  });

  app.get("/api/broker/alpaca/calendar", isAuthenticated, async (req: any, res) => {
    try {
      const { start, end } = req.query;
      const calendar = await alpacaBrokerService.getCalendar(start as string, end as string);
      res.json(calendar);
    } catch (error: any) {
      console.error("Error fetching calendar:", error);
      res.status(500).json({ message: error.message || "Failed to fetch calendar" });
    }
  });

  // Stock bot trading routes using Alpaca
  app.post("/api/stocks/trade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symbol, action, quantity, orderType, limitPrice } = req.body;
      
      const order: TradeOrder = {
        symbol,
        action,
        quantity,
        orderType,
        limitPrice,
      };
      
      const result = await botStocks.placeOrder(userId, order);
      res.json(result);
    } catch (error: any) {
      console.error("Error placing stock order:", error);
      res.status(500).json({ message: error.message || "Failed to place stock order" });
    }
  });

  app.get("/api/stocks/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const portfolio = await botStocks.getPortfolio(userId);
      res.json(portfolio);
    } catch (error: any) {
      console.error("Error fetching stock portfolio:", error);
      res.status(500).json({ message: error.message || "Failed to fetch portfolio" });
    }
  });

  app.get("/api/stocks/quote/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const quote = await botStocks.getQuote(symbol);
      res.json(quote);
    } catch (error: any) {
      console.error("Error fetching stock quote:", error);
      res.status(500).json({ message: error.message || "Failed to fetch quote" });
    }
  });

  app.get("/api/stocks/orders", isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.query;
      const orders = await botStocks.getOrders(status as any);
      res.json(orders);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: error.message || "Failed to fetch orders" });
    }
  });

  app.delete("/api/stocks/orders/:orderId", isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      await botStocks.cancelOrder(orderId);
      res.json({ message: "Order cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: error.message || "Failed to cancel order" });
    }
  });

  app.post("/api/stocks/close-position/:symbol", isAuthenticated, async (req: any, res) => {
    try {
      const { symbol } = req.params;
      const { qty } = req.body;
      const result = await botStocks.closePosition(symbol, qty);
      res.json(result);
    } catch (error: any) {
      console.error("Error closing position:", error);
      res.status(500).json({ message: error.message || "Failed to close position" });
    }
  });

  // Armor Wallet routes
  app.post("/api/armor-wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletType, chains, dailyLimit, requiresTwoFa } = req.body;

      const wallet = await armorWalletService.createWallet(userId, {
        walletType,
        chains,
        dailyLimit,
        requiresTwoFa,
      });

      res.json(wallet);
    } catch (error: any) {
      console.error("Error creating Armor wallet:", error);
      res.status(500).json({ message: error.message || "Failed to create Armor wallet" });
    }
  });

  app.get("/api/armor-wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getArmorWalletsByUserId(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching Armor wallets:", error);
      res.status(500).json({ message: "Failed to fetch Armor wallets" });
    }
  });

  app.post("/api/armor-wallets/:walletId/trade", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;

      const wallet = await storage.getArmorWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await armorWalletService.executeTrade(walletId, req.body);
      res.json(result);
    } catch (error: any) {
      console.error("Error executing Armor trade:", error);
      res.status(500).json({ message: error.message || "Trade execution failed" });
    }
  });

  app.post("/api/armor-wallets/:walletId/natural-language", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;
      const { command, chain } = req.body;

      const wallet = await storage.getArmorWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const result = await armorWalletService.naturalLanguageTrade(walletId, command, chain);
      res.json(result);
    } catch (error: any) {
      console.error("Error executing natural language trade:", error);
      res.status(500).json({ message: error.message || "Natural language trade failed" });
    }
  });

  app.get("/api/armor-wallets/:walletId/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;

      const wallet = await storage.getArmorWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const portfolio = await armorWalletService.getPortfolio(walletId);
      res.json(portfolio);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: error.message || "Failed to fetch portfolio" });
    }
  });

  // MEV monitoring routes
  app.get("/api/mev/events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getMevEventsByUserId(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching MEV events:", error);
      res.status(500).json({ message: "Failed to fetch MEV events" });
    }
  });

  app.get("/api/mev/events/:network", isAuthenticated, async (req: any, res) => {
    try {
      const { network } = req.params;
      const events = await storage.getMevEventsByNetwork(network);
      res.json(events);
    } catch (error) {
      console.error("Error fetching MEV events by network:", error);
      res.status(500).json({ message: "Failed to fetch MEV events" });
    }
  });

  // Exchange Platform routes
  app.get("/api/exchange/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getExchangeOrdersByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching exchange orders:", error);
      res.status(500).json({ message: "Failed to fetch exchange orders" });
    }
  });

  app.post("/api/exchange/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertExchangeOrderSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid order data", 
          error: fromError(validation.error).toString() 
        });
      }
      const order = await storage.createExchangeOrder({ ...validation.data, userId });
      res.json(order);
    } catch (error) {
      console.error("Error creating exchange order:", error);
      res.status(500).json({ message: "Failed to create exchange order" });
    }
  });

  app.get("/api/exchange/liquidity-pools", isAuthenticated, async (req: any, res) => {
    try {
      const pools = await storage.getAllLiquidityPools();
      res.json(pools);
    } catch (error) {
      console.error("Error fetching liquidity pools:", error);
      res.status(500).json({ message: "Failed to fetch liquidity pools" });
    }
  });

  app.post("/api/exchange/liquidity-pools", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertLiquidityPoolSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid pool data", 
          error: fromError(validation.error).toString() 
        });
      }
      const pool = await storage.createLiquidityPool({ ...validation.data, userId });
      res.json(pool);
    } catch (error) {
      console.error("Error creating liquidity pool:", error);
      res.status(500).json({ message: "Failed to create liquidity pool" });
    }
  });

  // Coin Mixer routes
  app.get("/api/mixer/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getMixingRequestsByUserId(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching mixing requests:", error);
      res.status(500).json({ message: "Failed to fetch mixing requests" });
    }
  });

  app.post("/api/mixer/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMixingRequestSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid mixing request data", 
          error: fromError(validation.error).toString() 
        });
      }
      const request = await storage.createMixingRequest({ ...validation.data, userId });
      res.json(request);
    } catch (error) {
      console.error("Error creating mixing request:", error);
      res.status(500).json({ message: "Failed to create mixing request" });
    }
  });

  // Forum/Community routes
  app.get("/api/forum/categories", isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getAllForumCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Failed to fetch forum categories" });
    }
  });

  app.get("/api/forum/threads", isAuthenticated, async (req: any, res) => {
    try {
      const threads = await storage.getAllForumThreads();
      res.json(threads);
    } catch (error) {
      console.error("Error fetching forum threads:", error);
      res.status(500).json({ message: "Failed to fetch forum threads" });
    }
  });

  app.post("/api/forum/threads", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertForumThreadSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid thread data", 
          error: fromError(validation.error).toString() 
        });
      }
      const thread = await storage.createForumThread({ ...validation.data, userId });
      res.json(thread);
    } catch (error) {
      console.error("Error creating forum thread:", error);
      res.status(500).json({ message: "Failed to create forum thread" });
    }
  });

  app.get("/api/forum/replies", isAuthenticated, async (req: any, res) => {
    try {
      const replies = await storage.getAllForumReplies();
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Failed to fetch forum replies" });
    }
  });

  app.post("/api/forum/replies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertForumReplySchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid reply data", 
          error: fromError(validation.error).toString() 
        });
      }
      const reply = await storage.createForumReply({ ...validation.data, userId });
      res.json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Chat routes
  app.get("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertChatSessionSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid session data", 
          error: fromError(validation.error).toString() 
        });
      }
      const session = await storage.createChatSession({ ...validation.data, userId });
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId } = req.query;
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ message: "Session ID required" });
      }
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/messages", isAuthenticated, async (req: any, res) => {
    try {
      const validation = insertChatMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          error: fromError(validation.error).toString() 
        });
      }
      const message = await storage.createChatMessage(validation.data);
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Metals Trading routes
  app.get("/api/metals/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inventory = await storage.getMetalInventoryByUserId(userId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching metal inventory:", error);
      res.status(500).json({ message: "Failed to fetch metal inventory" });
    }
  });

  app.get("/api/metals/trades", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trades = await storage.getMetalTradesByUserId(userId);
      res.json(trades);
    } catch (error) {
      console.error("Error fetching metal trades:", error);
      res.status(500).json({ message: "Failed to fetch metal trades" });
    }
  });

  app.post("/api/metals/trades", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMetalTradeSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid trade data", 
          error: fromError(validation.error).toString() 
        });
      }
      const trade = await storage.createMetalTrade({ ...validation.data, userId });
      res.json(trade);
    } catch (error) {
      console.error("Error creating metal trade:", error);
      res.status(500).json({ message: "Failed to create metal trade" });
    }
  });

  // Precious Metals Exchange - Crypto to Physical Conversion
  app.get("/api/metals/products", async (req: any, res) => {
    try {
      const products = await storage.getAllMetalProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching metal products:", error);
      res.status(500).json({ message: "Failed to fetch metal products" });
    }
  });

  app.post("/api/metals/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { productId, quantity, location, deliveryAddress, cryptoPaymentTx } = req.body;

      // Get product details
      const product = await storage.getMetalProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get current spot price
      const metalData = await marketDataService.getMetalPrice(product.metal);
      const spotPrice = metalData.price;
      
      // Calculate purchase price with premium
      const premiumMultiplier = 1 + (Number(product.premium) / 100);
      const pricePerOz = spotPrice * premiumMultiplier;
      const totalPrice = pricePerOz * Number(product.weight) * quantity;

      // Create ownership record
      const ownership = await storage.createMetalOwnership({
        userId,
        productId,
        quantity,
        location: location || 'vault',
        purchasePrice: totalPrice.toFixed(2),
        spotPriceAtPurchase: spotPrice.toFixed(2),
        cryptoPaymentTx,
        deliveryAddress: location === 'delivery_pending' ? deliveryAddress : null,
      });

      res.json({...ownership, currentSpotPrice: spotPrice, purchasePrice: totalPrice });
    } catch (error: any) {
      console.error("Error purchasing metal:", error);
      res.status(500).json({ message: error.message || "Failed to purchase metal" });
    }
  });

  app.get("/api/metals/ownership", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ownership = await storage.getUserMetalOwnership(userId);
      res.json(ownership);
    } catch (error) {
      console.error("Error fetching metal ownership:", error);
      res.status(500).json({ message: "Failed to fetch metal ownership" });
    }
  });

  app.post("/api/metals/delivery", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { ownershipId, deliveryAddress } = req.body;

      // Verify ownership belongs to user
      const ownership = await storage.getMetalOwnership(ownershipId);
      if (!ownership || ownership.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update location to delivery pending
      await storage.updateMetalOwnershipLocation(ownershipId, 'delivery_pending', deliveryAddress);

      res.json({ success: true, message: "Delivery request submitted" });
    } catch (error) {
      console.error("Error requesting delivery:", error);
      res.status(500).json({ message: "Failed to request delivery" });
    }
  });

  // Financial Services routes - Stocks, Forex, Bonds, Retirement
  app.post("/api/financial/stocks/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symbol, orderType, quantity, price } = req.body;

      // Get real-time stock price if market order
      const stockData = await marketDataService.getStockPrice(symbol);
      const executionPrice = orderType === "buy" ? stockData.price : price;
      const totalValue = executionPrice * quantity;

      // Create order
      const order = await storage.createFinancialOrder({
        userId,
        assetType: "stock",
        symbol,
        orderType,
        quantity: quantity.toString(),
        price: executionPrice.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { stockData }
      });

      // Update or create holding
      const holdings = await storage.getFinancialHoldingsByAssetType(userId, "stock");
      const existing = holdings.find(h => h.symbol === symbol);

      if (orderType === "buy") {
        if (existing) {
          const newQuantity = parseFloat(existing.quantity) + quantity;
          const newTotalInvested = parseFloat(existing.totalInvested || "0") + totalValue;
          const newAvgPrice = newTotalInvested / newQuantity;
          await storage.updateFinancialHolding(userId, "stock", symbol, {
            quantity: newQuantity.toString(),
            averagePurchasePrice: newAvgPrice.toString(),
            totalInvested: newTotalInvested.toString(),
            currentValue: (newQuantity * stockData.price).toString()
          });
        } else {
          await storage.createFinancialHolding({
            userId,
            assetType: "stock",
            symbol,
            quantity: quantity.toString(),
            averagePurchasePrice: executionPrice.toString(),
            totalInvested: totalValue.toString(),
            currentValue: (quantity * stockData.price).toString()
          });
        }
      }

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing stock order:", error);
      res.status(500).json({ message: error.message || "Failed to place stock order" });
    }
  });

  app.post("/api/financial/forex/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pair, orderType, quantity } = req.body;

      const forexData = await marketDataService.getForexRate(pair);
      const totalValue = forexData.price * quantity;

      const order = await storage.createFinancialOrder({
        userId,
        assetType: "forex",
        symbol: pair,
        orderType,
        quantity: quantity.toString(),
        price: forexData.price.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { forexData }
      });

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing forex order:", error);
      res.status(500).json({ message: error.message || "Failed to place forex order" });
    }
  });

  app.post("/api/financial/bonds/order", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { symbol, quantity, price, maturityDate, yieldRate } = req.body;
      const totalValue = price * quantity;

      const order = await storage.createFinancialOrder({
        userId,
        assetType: "bond",
        symbol,
        orderType: "buy",
        quantity: quantity.toString(),
        price: price.toString(),
        totalValue: totalValue.toString(),
        status: "executed",
        metadata: { maturityDate, yieldRate },
      });

      await storage.updateFinancialOrderStatus(order.id, "executed");
      res.json(order);
    } catch (error: any) {
      console.error("Error placing bond order:", error);
      res.status(500).json({ message: error.message || "Failed to place bond order" });
    }
  });

  app.get("/api/financial/portfolio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const holdings = await storage.getFinancialHoldings(userId);
      res.json(holdings);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // Blog routes
  app.get("/api/blog/posts", isAuthenticated, async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/blog/posts", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBlogPostSchema.omit({ authorId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid post data", error: fromError(validation.error).toString() });
      }
      const post = await storage.createBlogPost({ ...validation.data, authorId: userId });
      res.json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Admin dashboard configuration routes
  app.get("/api/admin/dashboard", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const config = await storage.getUserDashboardConfig(userId);
      res.json(config);
    } catch (error) {
      console.error("Error fetching dashboard config:", error);
      res.status(500).json({ message: "Failed to fetch dashboard config" });
    }
  });

  app.post("/api/admin/dashboard/widgets", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validation = insertDashboardWidgetSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid widget data", error: fromError(validation.error).toString() });
      }
      const widget = await storage.createDashboardWidget(validation.data);
      res.json(widget);
    } catch (error) {
      console.error("Error creating dashboard widget:", error);
      res.status(500).json({ message: "Failed to create dashboard widget" });
    }
  });

  app.post("/api/admin/dashboard/preferences", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertUserWidgetPreferenceSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid preference data", error: fromError(validation.error).toString() });
      }
      const preference = await storage.createUserWidgetPreference({ ...validation.data, userId });
      res.json(preference);
    } catch (error) {
      console.error("Error creating dashboard preference:", error);
      res.status(500).json({ message: "Failed to create dashboard preference" });
    }
  });

   // Admin User Management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await storage.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isAdmin, isBlocked } = req.body;
      
      if (typeof isAdmin !== 'undefined') {
        await storage.updateUserStatus(id, isAdmin);
      }
      // Add isBlocked logic to storage if needed

      res.json({ success: true, message: "User status updated" });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // P2P Exchange Routes
  app.get("/api/p2p/offers", isAuthenticated, async (req: any, res) => {
    try {
      const { cryptocurrency, fiatCurrency, offerType } = req.query;
      const offers = await storage.getP2POffers({
        cryptocurrency: cryptocurrency as string,
        fiatCurrency: fiatCurrency as string,
        offerType: offerType as any,
      });
      res.json(offers);
    } catch (error) {
      console.error("Error fetching P2P offers:", error);
      res.status(500).json({ message: "Failed to fetch P2P offers" });
    }
  });

  app.post("/api/p2p/offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertP2POfferSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid offer data", error: fromError(validation.error).toString() });
      }
      const offer = await storage.createP2POffer({ ...validation.data, userId });
      res.json(offer);
    } catch (error) {
      console.error("Error creating P2P offer:", error);
      res.status(500).json({ message: "Failed to create P2P offer" });
    }
  });

  app.post("/api/p2p/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub; // This is the buyer
      const validation = insertP2POrderSchema.omit({ buyerId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid order data", error: fromError(validation.error).toString() });
      }
      const order = await storage.createP2POrder({ ...validation.data, buyerId: userId });
      res.json(order);
    } catch (error) {
      console.error("Error creating P2P order:", error);
      res.status(500).json({ message: "Failed to create P2P order" });
    }
  });

  app.patch("/api/p2p/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;

      const order = await storage.getP2POrder(id);
      if (!order || (order.buyerId !== userId && order.sellerId !== userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateP2POrderStatus(id, status);
      res.json({ success: true, message: `Order status updated to ${status}` });
    } catch (error) {
      console.error("Error updating P2P order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // WalletConnect routes
  app.post("/api/walletconnect/connect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pairingTopic } = req.body;
      const session = await walletConnectService.connect(userId, pairingTopic);
      res.json(session);
    } catch (error) {
      console.error("Error connecting WalletConnect:", error);
      res.status(500).json({ message: "Failed to connect" });
    }
  });

  // Celebrity Platform routes
  app.post("/api/celebrities/profiles", isAuthenticated, async (req: any, res) => {
    // Normally admin-only, but open for demo
    const validation = insertCelebrityProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: "Invalid profile data", error: fromError(validation.error).toString() });
    }
    const profile = await storage.createCelebrityProfile(validation.data);
    res.json(profile);
  });

  app.post("/api/celebrities/stake", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertFanStakeSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid stake data", error: fromError(validation.error).toString() });
      }
      const stake = await storage.createFanStake({ ...validation.data, userId });
      res.json(stake);
    } catch (error) {
      console.error("Error creating fan stake:", error);
      res.status(500).json({ message: "Failed to create fan stake" });
    }
  });

  app.post("/api/celebrities/bet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertFanBetSchema.omit({ userId: true }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid bet data", error: fromError(validation.error).toString() });
      }
      const bet = await storage.createFanBet({ ...validation.data, userId });
      res.json(bet);
    } catch (error) {
      console.error("Error creating fan bet:", error);
      res.status(500).json({ message: "Failed to create fan bet" });
    }
  });

  // Spectrum Investment Plans
  app.get("/api/spectrum/plans", isAuthenticated, async (req: any, res) => {
    try {
      const plans = await storage.getSpectrumPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching spectrum plans:", error);
      res.status(500).json({ message: "Failed to fetch spectrum plans" });
    }
  });

  app.post("/api/spectrum/subscribe", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { planId, amount } = req.body;

      if (!planId || !amount) {
        return res.status(400).json({ message: "Plan ID and amount are required" });
      }

      const subscription = await spectrumService.subscribeToPlan(userId, planId, parseFloat(amount));
      res.json(subscription);
    } catch (error: any) {
      console.error("Error subscribing to spectrum plan:", error);
      res.status(500).json({ message: error.message || "Failed to subscribe" });
    }
  });

  app.get("/api/spectrum/subscriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await spectrumService.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Ethereal Assets - Digital assets with religious/spiritual significance
  app.get("/api/ethereal/elements", isAuthenticated, async (req, res) => {
    try {
      const elements = await etherealService.getAllElements();
      res.json(elements);
    } catch (error) {
      console.error("Error fetching ethereal elements:", error);
      res.status(500).json({ message: "Failed to fetch elements" });
    }
  });

  app.post("/api/ethereal/acquire", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { elementId, name, walletId } = req.body;
      
      if (!elementId || !name || !walletId) {
        return res.status(400).json({ message: "elementId, name, and walletId are required" });
      }

      // Verify wallet belongs to user
      const wallet = await storage.getWallet(walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Access denied to wallet" });
      }

      const ownership = await etherealService.acquireElement(
        userId,
        elementId,
        name,
        wallet.address
      );
      
      res.json(ownership);
    } catch (error: any) {
      console.error("Error acquiring ethereal element:", error);
      res.status(500).json({ message: error.message || "Failed to acquire element" });
    }
  });

  app.get("/api/ethereal/my-elements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const elements = await etherealService.getUserElements(userId);
      res.json(elements);
    } catch (error) {
      console.error("Error fetching user elements:", error);
      res.status(500).json({ message: "Failed to fetch elements" });
    }
  });

  // =====================
  // Prayer & Faith Routes
  // =====================✨

  app.post('/api/prayers', isAuthenticated, async (req, res) => {
    try {
      const validation = insertPrayerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid prayer data', error: validation.error.toString() });
      }
      const prayer = await prayerService.submitPrayer(validation.data);
      res.status(201).json(prayer);
    } catch (err) {
      res.status(500).json({ message: 'Failed to submit prayer' });
    }
  });

  app.get('/api/prayers', isAuthenticated, async (req, res) => {
    try {
      const prayers = await prayerService.getPrayers();
      res.json(prayers);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get prayers' });
    }
  });

  app.post('/api/prayers/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const prayerId = req.params.id;
      const userId = req.user.claims.sub;
      await prayerService.joinPrayer(prayerId, userId);
      res.json({ message: 'Successfully joined prayer' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to join prayer' });
    }
  });

  app.get('/api/scriptures/random', isAuthenticated, async (req, res) => {
    try {
      const scripture = await prayerService.getRandomScripture();
      res.json(scripture);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get scripture' });
    }
  });

  app.post('/api/tithing/config', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const validation = insertTithingConfigSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Invalid config data', error: validation.error.toString() });
      }
      const config = await tithingService.configureTithing(validation.data);
      res.json(config);
    } catch (err) {
      res.status(500).json({ message: 'Failed to configure tithing' });
    }
  });

  app.post('/api/tithing/contribute', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, currency, walletId } = req.body;

      if (!amount || !currency || !walletId) {
        return res.status(400).json({ message: 'Amount, currency, and walletId are required'});
      }
      
      const contribution = await tithingService.makeContribution(userId, { amount: parseFloat(amount), currency, walletId });
      res.json(contribution);
    } catch (err: any) {
      res.status(500).json({ message: err.message || 'Failed to make contribution' });
    }
  });

  // Telegram Bot Master Orchestrator Endpoint
  app.post(`/api/telegram/master-orchestrator/${telegramBotService.getBotInfo()?.username}`, async (req, res) => {
    try {
      const update = req.body;
      const parsed = telegramBotService.processUpdate(update);

      if (!parsed) {
        return res.sendStatus(200);
      }

      const { chatId, isNaturalLanguage, command, args } = parsed;
      let responseText: string;

      if (isNaturalLanguage) {
        // Natural Language Processing through Master Orchestrator
        responseText = await masterOrchestrator.handleNaturalLanguage(chatId, args.join(' '));
      } else {
        // Structured Command Handling a an s well
        responseText = await masterOrchestrator.handleCommand(chatId, command, args);
      }

      // Send response back to Telegram
      await telegramBotService.sendMessage(chatId, responseText);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error processing Telegram update:", error);
      res.sendStatus(200); // Always respond 200 to Telegram to avoid retries
    }
  });

  const server = createServer(app);
  websocketService.initialize(server);
  
  return server;
}