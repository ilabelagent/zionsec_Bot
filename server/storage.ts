import { users, wallets, transactions, nfts, tokens, songs, jesusCartelReleases, jesusCartelEvents, jesusCartelStreams, agents, agentLogs, securityEvents, payments, kycRecords, quantumJobs, cryptoPayments, tradingBots, botExecutions, armorWallets, mevEvents, exchangeOrders, liquidityPools, mixingRequests, forumCategories, forumThreads, forumReplies, chatSessions, chatMessages, metalInventory, metalTrades, metalProducts, metalOwnership, blogPosts, userDashboardConfigs, dashboardWidgets, userWidgetPreferences, adminUsers, adminAuditLogs, adminBroadcasts, botMarketplaceListings, botRentals, botSubscriptions, botReviews, botLearningSession, botTrainingData, botSkills, tradingSystemMemory, p2pOffers, p2pOrders, p2pPaymentMethods, p2pChatMessages, p2pDisputes, p2pReviews, walletConnectSessions, celebrityProfiles, fanFollows, fanStakes, fanBets, predictionMarkets, celebrityContent, brokerAccounts, brokerOrders, brokerPositions, spectrumPlans, userSpectrumSubscriptions, spectrumEarnings, type User, type InsertUser, type UpsertUser, type Wallet, type InsertWallet, type Transaction, type InsertTransaction, type Nft, type InsertNft, type Token, type InsertToken, type Song, type InsertSong, type JesusCartelRelease, type InsertJesusCartelRelease, type JesusCartelEvent, type InsertJesusCartelEvent, type JesusCartelStream, type InsertJesusCartelStream, type Agent, type InsertAgent, type AgentLog, type InsertAgentLog, type SecurityEvent, type InsertSecurityEvent, type Payment, type InsertPayment, type KycRecord, type InsertKycRecord, type QuantumJob, type InsertQuantumJob, type CryptoPayment, type InsertCryptoPayment, type TradingBot, type InsertTradingBot, type BotExecution, type InsertBotExecution, type ArmorWallet, type InsertArmorWallet, type MevEvent, type InsertMevEvent, type ExchangeOrder, type InsertExchangeOrder, type LiquidityPool, type InsertLiquidityPool, type MixingRequest, type InsertMixingRequest, type ForumCategory, type InsertForumCategory, type ForumThread, type InsertForumThread, type ForumReply, type InsertForumReply, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage, type MetalInventory, type InsertMetalInventory, type MetalTrade, type InsertMetalTrade, type MetalProduct, type InsertMetalProduct, type MetalOwnership, type InsertMetalOwnership, type BlogPost, type InsertBlogPost, type UserDashboardConfig, type InsertUserDashboardConfig, type DashboardWidget, type InsertDashboardWidget, type UserWidgetPreference, type InsertUserWidgetPreference, type AdminUser, type InsertAdminUser, type AdminAuditLog, type InsertAdminAuditLog, type AdminBroadcast, type InsertAdminBroadcast, type BotMarketplaceListing, type InsertBotMarketplaceListing, type BotRental, type InsertBotRental, type BotSubscription, type InsertBotSubscription, type BotReview, type InsertBotReview, type BotLearningSession, type InsertBotLearningSession, type BotTrainingData, type InsertBotTrainingData, type BotSkill, type InsertBotSkill, type TradingSystemMemory, type InsertTradingSystemMemory, type P2POffer, type InsertP2POffer, type P2POrder, type InsertP2POrder, type P2PPaymentMethod, type InsertP2PPaymentMethod, type P2PChatMessage, type InsertP2PChatMessage, type P2PDispute, type InsertP2PDispute, type P2PReview, type InsertP2PReview, type WalletConnectSession, type InsertWalletConnectSession, type CelebrityProfile, type InsertCelebrityProfile, type FanFollow, type InsertFanFollow, type FanStake, type InsertFanStake, type FanBet, type InsertFanBet, type PredictionMarket, type InsertPredictionMarket, type CelebrityContent, type InsertCelebrityContent, financialOrders, financialHoldings, type FinancialOrder, type InsertFinancialOrder, type FinancialHolding, type InsertFinancialHolding, spectrumPlans, userSpectrumSubscriptions, spectrumEarnings, type SpectrumPlan, type InsertSpectrumPlan, type UserSpectrumSubscription, type InsertUserSpectrumSubscription, type SpectrumEarning, type InsertSpectrumEarning, type BrokerAccount, type InsertBrokerAccount, type BrokerOrder, type InsertBrokerOrder, type BrokerPosition, type InsertBrokerPosition, individualAssets, etherealElements, etherealOwnership, type IndividualAsset, type InsertIndividualAsset, type EtherealElement, type InsertEtherealElement, type EtherealOwnership, type InsertEtherealOwnership, prayers, scriptures, prayerTradeCorrelations, userPrayerSettings, type Prayer, type InsertPrayer, type Scripture, type InsertScripture, type PrayerTradeCorrelation, type InsertPrayerTradeCorrelation, type UserPrayerSettings, type InsertUserPrayerSettings, charities, tithingConfigs, tithingHistory, type Charity, type InsertCharity, type TithingConfig, type InsertTithingConfig, type TithingHistory, type InsertTithingHistory, conversationSessions, conversationMemories, conversationMessages, conversationContext, conversationTasks, type ConversationSession, type InsertConversationSession, type ConversationMemory, type InsertConversationMemory, type ConversationMessage, type InsertConversationMessage, type ConversationContext, type InsertConversationContext, type ConversationTask, type InsertConversationTask, projectUploads, type ProjectUpload, type InsertProjectUpload, } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc } from "drizzle-orm";
import * as usersStorage from "./storage/users";
import * as walletsStorage from "./storage/wallets";
import * as transactionsStorage from "./storage/transactions";
import * as nftsStorage from "./storage/nfts";
import * as tokensStorage from "./storage/tokens";
import * as songsStorage from "./storage/songs";
import * as jesusCartelStorage from "./storage/jesus-cartel";
import * as agentsStorage from "./storage/agents";
import * as securityStorage from "./storage/security";
import * as paymentsStorage from "./storage/payments";
import * as kycStorage from "./storage/kyc";
import * as quantumJobsStorage from "./storage/quantum-jobs";
import * as tradingBotsStorage from "./storage/trading-bots";
import * as armorWalletsStorage from "./storage/armor-wallets";
import * as mevEventsStorage from "./storage/mev-events";
import * as exchangeStorage from "./storage/exchange";
import * as forumStorage from "./storage/forum";
import * as chatStorage from "./storage/chat";
import * as metalsStorage from "./storage/metals";
import * as blogStorage from "./storage/blog";
import * as dashboardStorage from "./storage/dashboard";
import * as adminStorage from "./storage/admin";
import * as botMarketplaceStorage from "./storage/bot-marketplace";
import * as botLearningStorage from "./storage/bot-learning";
import * as tradingSystemMemoryStorage from "./storage/trading-system-memory";
import * as brokerStorage from "./storage/broker";
import * as p2pStorage from "./storage/p2p";
import * as walletConnectStorage from "./storage/walletconnect";
import * as celebrityStorage from "./storage/celebrity";
import * as financialsStorage from "./storage/financials";
import * as spectrumStorage from "./storage/spectrum";
import * as etherealStorage from "./storage/ethereal";
import * as prayerStorage from "./storage/prayer";
import * as tithingStorage from "./storage/tithing";
import * as conversationMemoryStorage from "./storage/conversation-memory";
import * as projectUploadsStorage from "./storage/project-uploads";

export class DatabaseStorage {
  // Users
  getUser = usersStorage.getUser;
  getUserByEmail = usersStorage.getUserByEmail;
  getAllUsers = usersStorage.getAllUsers;
  getTotalUsersCount = usersStorage.getTotalUsersCount;
  updateUserStatus = usersStorage.updateUserStatus;
  upsertUser = usersStorage.upsertUser;
  updateUserKycStatus = usersStorage.updateUserKycStatus;

  // Wallets
  getWallet = walletsStorage.getWallet;
  getWalletsByUserId = walletsStorage.getWalletsByUserId;
  getWalletByAddress = walletsStorage.getWalletByAddress;
  createWallet = walletsStorage.createWallet;
  updateWalletBalance = walletsStorage.updateWalletBalance;

  // Transactions
  getTransaction = transactionsStorage.getTransaction;
  getTransactionsByWalletId = transactionsStorage.getTransactionsByWalletId;
  createTransaction = transactionsStorage.createTransaction;
  updateTransactionStatus = transactionsStorage.updateTransactionStatus;

  // NFTs
  getNft = nftsStorage.getNft;
  getNftsByWalletId = nftsStorage.getNftsByWalletId;
  createNft = nftsStorage.createNft;

  // Tokens
  getToken = tokensStorage.getToken;
  getTokensByWalletId = tokensStorage.getTokensByWalletId;
  getTokenByContractAddress = tokensStorage.getTokenByContractAddress;
  createToken = tokensStorage.createToken;

  // Songs
  getSong = songsStorage.getSong;
  getSongsByUserId = songsStorage.getSongsByUserId;
  getSongsWithDetailsByUserId = songsStorage.getSongsWithDetailsByUserId;
  createSong = songsStorage.createSong;
  updateSongPublication = songsStorage.updateSongPublication;

  // Jesus Cartel
  getLatestReleases = jesusCartelStorage.getLatestReleases;
  getFeaturedReleases = jesusCartelStorage.getFeaturedReleases;
  getRelease = jesusCartelStorage.getRelease;
  createRelease = jesusCartelStorage.createRelease;
  updateRelease = jesusCartelStorage.updateRelease;
  deleteRelease = jesusCartelStorage.deleteRelease;
  incrementStreamCount = jesusCartelStorage.incrementStreamCount;
  incrementLikeCount = jesusCartelStorage.incrementLikeCount;
  getUpcomingEvents = jesusCartelStorage.getUpcomingEvents;
  getFeaturedEvents = jesusCartelStorage.getFeaturedEvents;
  getEvent = jesusCartelStorage.getEvent;
  createEvent = jesusCartelStorage.createEvent;
  updateEvent = jesusCartelStorage.updateEvent;
  deleteEvent = jesusCartelStorage.deleteEvent;
  trackStream = jesusCartelStorage.trackStream;
  getReleaseStreams = jesusCartelStorage.getReleaseStreams;
  getUserStreams = jesusCartelStorage.getUserStreams;

  // Agents
  getAgent = agentsStorage.getAgent;
  getAllAgents = agentsStorage.getAllAgents;
  getAgentsByType = agentsStorage.getAgentsByType;
  createAgent = agentsStorage.createAgent;
  updateAgentStatus = agentsStorage.updateAgentStatus;
  updateAgentMetrics = agentsStorage.updateAgentMetrics;
  createAgentLog = agentsStorage.createAgentLog;
  getAgentLogs = agentsStorage.getAgentLogs;

  // Security
  getSecurityEvent = securityStorage.getSecurityEvent;
  getSecurityEventsByUserId = securityStorage.getSecurityEventsByUserId;
  getUnresolvedSecurityEvents = securityStorage.getUnresolvedSecurityEvents;
  createSecurityEvent = securityStorage.createSecurityEvent;
  resolveSecurityEvent = securityStorage.resolveSecurityEvent;

  // Payments
  getPayment = paymentsStorage.getPayment;
  getPaymentsByUserId = paymentsStorage.getPaymentsByUserId;
  getPaymentByStripeId = paymentsStorage.getPaymentByStripeId;
  createPayment = paymentsStorage.createPayment;
  updatePaymentStatus = paymentsStorage.updatePaymentStatus;
  getCryptoPayment = paymentsStorage.getCryptoPayment;
  getCryptoPaymentsByUserId = paymentsStorage.getCryptoPaymentsByUserId;
  getCryptoPaymentByInvoiceId = paymentsStorage.getCryptoPaymentByInvoiceId;
  createCryptoPayment = paymentsStorage.createCryptoPayment;
  updateCryptoPaymentStatus = paymentsStorage.updateCryptoPaymentStatus;

  // KYC
  getKycRecord = kycStorage.getKycRecord;
  getKycRecordByUserId = kycStorage.getKycRecordByUserId;
  createKycRecord = kycStorage.createKycRecord;
  updateKycVerification = kycStorage.updateKycVerification;

  // Quantum Jobs
  getQuantumJob = quantumJobsStorage.getQuantumJob;
  getQuantumJobsByUserId = quantumJobsStorage.getQuantumJobsByUserId;
  createQuantumJob = quantumJobsStorage.createQuantumJob;
  updateQuantumJobStatus = quantumJobsStorage.updateQuantumJobStatus;

  // Trading Bots
  getBot = tradingBotsStorage.getBot;
  getUserBots = tradingBotsStorage.getUserBots;
  getAllBots = tradingBotsStorage.getAllBots;
  getTotalBotsCount = tradingBotsStorage.getTotalBotsCount;
  createBot = tradingBotsStorage.createBot;
  updateBot = tradingBotsStorage.updateBot;
  deleteBot = tradingBotsStorage.deleteBot;
  getBotExecution = tradingBotsStorage.getBotExecution;
  getBotExecutions = tradingBotsStorage.getBotExecutions;
  createBotExecution = tradingBotsStorage.createBotExecution;
  updateBotExecutionStatus = tradingBotsStorage.updateBotExecutionStatus;

  // Armor Wallets
  getArmorWallet = armorWalletsStorage.getArmorWallet;
  getArmorWalletsByUserId = armorWalletsStorage.getArmorWalletsByUserId;
  getArmorWalletByAddress = armorWalletsStorage.getArmorWalletByAddress;
  createArmorWallet = armorWalletsStorage.createArmorWallet;
  updateArmorWallet = armorWalletsStorage.updateArmorWallet;

  // MEV Events
  getMevEvent = mevEventsStorage.getMevEvent;
  getMevEventsByUserId = mevEventsStorage.getMevEventsByUserId;
  getMevEventsByNetwork = mevEventsStorage.getMevEventsByNetwork;
  createMevEvent = mevEventsStorage.createMevEvent;

  // Exchange
  getExchangeOrder = exchangeStorage.getExchangeOrder;
  getExchangeOrdersByUserId = exchangeStorage.getExchangeOrdersByUserId;
  createExchangeOrder = exchangeStorage.createExchangeOrder;
  getLiquidityPool = exchangeStorage.getLiquidityPool;
  getAllLiquidityPools = exchangeStorage.getAllLiquidityPools;
  createLiquidityPool = exchangeStorage.createLiquidityPool;
  getMixingRequest = exchangeStorage.getMixingRequest;
  getMixingRequestsByUserId = exchangeStorage.getMixingRequestsByUserId;
  createMixingRequest = exchangeStorage.createMixingRequest;

  // Forum
  getForumCategory = forumStorage.getForumCategory;
  getAllForumCategories = forumStorage.getAllForumCategories;
  createForumCategory = forumStorage.createForumCategory;
  getForumThread = forumStorage.getForumThread;
  getAllForumThreads = forumStorage.getAllForumThreads;
  createForumThread = forumStorage.createForumThread;
  getForumReply = forumStorage.getForumReply;
  getAllForumReplies = forumStorage.getAllForumReplies;
  createForumReply = forumStorage.createForumReply;

  // Chat
  getChatSession = chatStorage.getChatSession;
  getChatSessionsByUserId = chatStorage.getChatSessionsByUserId;
  createChatSession = chatStorage.createChatSession;
  getChatMessage = chatStorage.getChatMessage;
  getChatMessagesBySessionId = chatStorage.getChatMessagesBySessionId;
  createChatMessage = chatStorage.createChatMessage;

  // Metals
  getMetalInventoryItem = metalsStorage.getMetalInventoryItem;
  getMetalInventoryByUserId = metalsStorage.getMetalInventoryByUserId;
  createMetalInventory = metalsStorage.createMetalInventory;
  getMetalTrade = metalsStorage.getMetalTrade;
  getMetalTradesByUserId = metalsStorage.getMetalTradesByUserId;
  createMetalTrade = metalsStorage.createMetalTrade;
  getAllMetalProducts = metalsStorage.getAllMetalProducts;
  getMetalProduct = metalsStorage.getMetalProduct;
  createMetalProduct = metalsStorage.createMetalProduct;
  getUserMetalOwnership = metalsStorage.getUserMetalOwnership;
  getMetalOwnership = metalsStorage.getMetalOwnership;
  createMetalOwnership = metalsStorage.createMetalOwnership;
  updateMetalOwnershipLocation = metalsStorage.updateMetalOwnershipLocation;

  // Blog
  getBlogPost = blogStorage.getBlogPost;
  getAllBlogPosts = blogStorage.getAllBlogPosts;
  createBlogPost = blogStorage.createBlogPost;

  // Dashboard
  getUserDashboardConfig = dashboardStorage.getUserDashboardConfig;
  createOrUpdateDashboardConfig = dashboardStorage.createOrUpdateDashboardConfig;
  getDashboardWidgets = dashboardStorage.getDashboardWidgets;
  createDashboardWidget = dashboardStorage.createDashboardWidget;
  getUserWidgetPreferences = dashboardStorage.getUserWidgetPreferences;
  createOrUpdateWidgetPreference = dashboardStorage.createOrUpdateWidgetPreference;
  deleteWidgetPreference = dashboardStorage.deleteWidgetPreference;

  // Admin
  getAdminUser = adminStorage.getAdminUser;
  getAllAdminUsers = adminStorage.getAllAdminUsers;
  adminUserExists = adminStorage.adminUserExists;
  createAdminUser = adminStorage.createAdminUser;
  updateAdminRole = adminStorage.updateAdminRole;
  getAdminAuditLogs = adminStorage.getAdminAuditLogs;
  createAdminAuditLog = adminStorage.createAdminAuditLog;
  getAdminBroadcasts = adminStorage.getAdminBroadcasts;
  createAdminBroadcast = adminStorage.createAdminBroadcast;
  markBroadcastAsSent = adminStorage.markBroadcastAsSent;

  // Bot Marketplace
  getBotMarketplaceListings = botMarketplaceStorage.getBotMarketplaceListings;
  getBotMarketplaceListing = botMarketplaceStorage.getBotMarketplaceListing;
  createBotMarketplaceListing = botMarketplaceStorage.createBotMarketplaceListing;
  updateBotMarketplaceListing = botMarketplaceStorage.updateBotMarketplaceListing;
  getBotRental = botMarketplaceStorage.getBotRental;
  getUserBotRentals = botMarketplaceStorage.getUserBotRentals;
  createBotRental = botMarketplaceStorage.createBotRental;
  updateBotRental = botMarketplaceStorage.updateBotRental;
  getBotSubscription = botMarketplaceStorage.getBotSubscription;
  getUserBotSubscriptions = botMarketplaceStorage.getUserBotSubscriptions;
  createBotSubscription = botMarketplaceStorage.createBotSubscription;
  updateBotSubscription = botMarketplaceStorage.updateBotSubscription;
  getBotReviews = botMarketplaceStorage.getBotReviews;
  createBotReview = botMarketplaceStorage.createBotReview;

  // Bot Learning
  getBotLearningSessions = botLearningStorage.getBotLearningSessions;
  createBotLearningSession = botLearningStorage.createBotLearningSession;
  updateBotLearningSession = botLearningStorage.updateBotLearningSession;
  createBotTrainingData = botLearningStorage.createBotTrainingData;
  getBotTrainingData = botLearningStorage.getBotTrainingData;
  getBotSkills = botLearningStorage.getBotSkills;
  createBotSkill = botLearningStorage.createBotSkill;
  updateBotSkill = botLearningStorage.updateBotSkill;

  // Trading System Memory
  getTradingSystemMemory = tradingSystemMemoryStorage.getTradingSystemMemory;
  getTradingSystemMemoryByKey = tradingSystemMemoryStorage.getTradingSystemMemoryByKey;
  createTradingSystemMemory = tradingSystemMemoryStorage.createTradingSystemMemory;
  updateTradingSystemMemory = tradingSystemMemoryStorage.updateTradingSystemMemory;

  // Broker
  getBrokerAccount = brokerStorage.getBrokerAccount;
  getUserBrokerAccounts = brokerStorage.getUserBrokerAccounts;
  createBrokerAccount = brokerStorage.createBrokerAccount;
  updateBrokerAccount = brokerStorage.updateBrokerAccount;
  getBrokerOrder = brokerStorage.getBrokerOrder;
  getBrokerOrderByExternalId = brokerStorage.getBrokerOrderByExternalId;
  getBrokerOrdersByAccountId = brokerStorage.getBrokerOrdersByAccountId;
  createBrokerOrder = brokerStorage.createBrokerOrder;
  updateBrokerOrder = brokerStorage.updateBrokerOrder;
  getBrokerPosition = brokerStorage.getBrokerPosition;
  getBrokerPositionBySymbol = brokerStorage.getBrokerPositionBySymbol;
  getBrokerPositionsByAccountId = brokerStorage.getBrokerPositionsByAccountId;
  createBrokerPosition = brokerStorage.createBrokerPosition;
  updateBrokerPosition = brokerStorage.updateBrokerPosition;

  // P2P
  getP2POffers = p2pStorage.getP2POffers;
  getP2POffer = p2pStorage.getP2POffer;
  createP2POffer = p2pStorage.createP2POffer;
  updateP2POffer = p2pStorage.updateP2POffer;
  getP2POrders = p2pStorage.getP2POrders;
  getP2POrder = p2pStorage.getP2POrder;
  createP2POrder = p2pStorage.createP2POrder;
  updateP2POrder = p2pStorage.updateP2POrder;
  getUserP2PPaymentMethods = p2pStorage.getUserP2PPaymentMethods;
  createP2PPaymentMethod = p2pStorage.createP2PPaymentMethod;
  getOrderChatMessages = p2pStorage.getOrderChatMessages;
  createP2PChatMessage = p2pStorage.createP2PChatMessage;
  getP2PDisputes = p2pStorage.getP2PDisputes;
  getP2PDispute = p2pStorage.getP2PDispute;
  createP2PDispute = p2pStorage.createP2PDispute;
  updateP2PDispute = p2pStorage.updateP2PDispute;
  getUserP2PReviews = p2pStorage.getUserP2PReviews;
  createP2PReview = p2pStorage.createP2PReview;

  // WalletConnect
  getWalletConnectSessions = walletConnectStorage.getWalletConnectSessions;
  getActiveWalletSession = walletConnectStorage.getActiveWalletSession;
  createWalletConnectSession = walletConnectStorage.createWalletConnectSession;
  updateWalletSessionStatus = walletConnectStorage.updateWalletSessionStatus;
  disconnectWalletSession = walletConnectStorage.disconnectWalletSession;

  // Celebrity
  getCelebrityProfile = celebrityStorage.getCelebrityProfile;
  getCelebrityProfileByUserId = celebrityStorage.getCelebrityProfileByUserId;
  getAllCelebrityProfiles = celebrityStorage.getAllCelebrityProfiles;
  createCelebrityProfile = celebrityStorage.createCelebrityProfile;
  updateCelebrityProfile = celebrityStorage.updateCelebrityProfile;
  updateCelebrityFollowerCount = celebrityStorage.updateCelebrityFollowerCount;
  updateCelebrityTotalStaked = celebrityStorage.updateCelebrityTotalStaked;
  getCelebrityFollows = celebrityStorage.getCelebrityFollows;
  getUserFollows = celebrityStorage.getUserFollows;
  isFollowing = celebrityStorage.isFollowing;
  createFollow = celebrityStorage.createFollow;
  deleteFollow = celebrityStorage.deleteFollow;
  getCelebrityStakes = celebrityStorage.getCelebrityStakes;
  getUserStakes = celebrityStorage.getUserStakes;
  createStake = celebrityStorage.createStake;
  updateStakeStatus = celebrityStorage.updateStakeStatus;
  getCelebrityBets = celebrityStorage.getCelebrityBets;
  getUserBets = celebrityStorage.getUserBets;
  createBet = celebrityStorage.createBet;
  updateBetStatus = celebrityStorage.updateBetStatus;
  getPredictionMarkets = celebrityStorage.getPredictionMarkets;
  getPredictionMarket = celebrityStorage.getPredictionMarket;
  createPredictionMarket = celebrityStorage.createPredictionMarket;
  updatePredictionMarket = celebrityStorage.updatePredictionMarket;
  getCelebrityContent = celebrityStorage.getCelebrityContent;
  getCelebrityContentItem = celebrityStorage.getCelebrityContentItem;
  createCelebrityContent = celebrityStorage.createCelebrityContent;
  updateContentViews = celebrityStorage.updateContentViews;
  updateContentLikes = celebrityStorage.updateContentLikes;

  // Financials
  createFinancialOrder = financialsStorage.createFinancialOrder;
  getFinancialOrdersByUserId = financialsStorage.getFinancialOrdersByUserId;
  getFinancialOrder = financialsStorage.getFinancialOrder;
  updateFinancialOrderStatus = financialsStorage.updateFinancialOrderStatus;
  createFinancialHolding = financialsStorage.createFinancialHolding;
  getFinancialHoldingsByUserId = financialsStorage.getFinancialHoldingsByUserId;
  getFinancialHoldingsByAssetType = financialsStorage.getFinancialHoldingsByAssetType;
  updateFinancialHolding = financialsStorage.updateFinancialHolding;

  // Spectrum
  getAllSpectrumPlans = spectrumStorage.getAllSpectrumPlans;
  getSpectrumPlan = spectrumStorage.getSpectrumPlan;
  getSpectrumPlanByTier = spectrumStorage.getSpectrumPlanByTier;
  createSpectrumPlan = spectrumStorage.createSpectrumPlan;
  updateSpectrumPlan = spectrumStorage.updateSpectrumPlan;
  getUserSpectrumSubscription = spectrumStorage.getUserSpectrumSubscription;
  getUserSpectrumSubscriptionById = spectrumStorage.getUserSpectrumSubscriptionById;
  createSpectrumSubscription = spectrumStorage.createSpectrumSubscription;
  updateSpectrumSubscription = spectrumStorage.updateSpectrumSubscription;
  cancelSpectrumSubscription = spectrumStorage.cancelSpectrumSubscription;
  getSpectrumEarnings = spectrumStorage.getSpectrumEarnings;
  getSpectrumEarningsBySubscription = spectrumStorage.getSpectrumEarningsBySubscription;
  createSpectrumEarning = spectrumStorage.createSpectrumEarning;
  getAllActiveSpectrumSubscriptions = spectrumStorage.getAllActiveSpectrumSubscriptions;

  // Ethereal
  getAllEtherealElements = etherealStorage.getAllEtherealElements;
  getEtherealElement = etherealStorage.getEtherealElement;
  createEtherealElement = etherealStorage.createEtherealElement;
  updateEtherealElementMintCount = etherealStorage.updateEtherealElementMintCount;
  getEtherealOwnership = etherealStorage.getEtherealOwnership;
  getUserEtherealOwnerships = etherealStorage.getUserEtherealOwnerships;
  createEtherealOwnership = etherealStorage.createEtherealOwnership;
  updateEtherealOwnershipQuantity = etherealStorage.updateEtherealOwnershipQuantity;
  getIndividualAsset = etherealStorage.getIndividualAsset;
  getUserIndividualAssets = etherealStorage.getUserIndividualAssets;
  getUserAssetsByType = etherealStorage.getUserAssetsByType;
  createIndividualAsset = etherealStorage.createIndividualAsset;
  updateIndividualAssetValue = etherealStorage.updateIndividualAssetValue;

  // Prayer
  createPrayer = prayerStorage.createPrayer;
  getUserPrayers = prayerStorage.getUserPrayers;
  getPrayer = prayerStorage.getPrayer;
  createScripture = prayerStorage.createScripture;
  getAllScriptures = prayerStorage.getAllScriptures;
  getScripturesByCategory = prayerStorage.getScripturesByCategory;
  getScripturesCount = prayerStorage.getScripturesCount;
  createPrayerTradeCorrelation = prayerStorage.createPrayerTradeCorrelation;
  getUserPrayerCorrelations = prayerStorage.getUserPrayerCorrelations;
  getPrayerCorrelation = prayerStorage.getPrayerCorrelation;
  getUserPrayerSettings = prayerStorage.getUserPrayerSettings;
  upsertUserPrayerSettings = prayerStorage.upsertUserPrayerSettings;
  updateUserPrayerSettings = prayerStorage.updateUserPrayerSettings;

  // Tithing
  getAllCharities = tithingStorage.getAllCharities;
  getActiveCharities = tithingStorage.getActiveCharities;
  getCharity = tithingStorage.getCharity;
  createCharity = tithingStorage.createCharity;
  updateCharity = tithingStorage.updateCharity;
  updateCharityTotals = tithingStorage.updateCharityTotals;
  getTithingConfigByUserId = tithingStorage.getTithingConfigByUserId;
  createTithingConfig = tithingStorage.createTithingConfig;
  updateTithingConfig = tithingStorage.updateTithingConfig;
  getTithingHistory = tithingStorage.getTithingHistory;
  getTithingHistoryItem = tithingStorage.getTithingHistoryItem;
  createTithingHistory = tithingStorage.createTithingHistory;
  updateTithingHistory = tithingStorage.updateTithingHistory;

  // Conversation Memory
  getConversationSession = conversationMemoryStorage.getConversationSession;
  getConversationSessionByIdentifier = conversationMemoryStorage.getConversationSessionByIdentifier;
  createConversationSession = conversationMemoryStorage.createConversationSession;
  updateConversationSession = conversationMemoryStorage.updateConversationSession;
  getConversationMemories = conversationMemoryStorage.getConversationMemories;
  getConversationMemoryByKey = conversationMemoryStorage.getConversationMemoryByKey;
  getConversationMemoriesByType = conversationMemoryStorage.getConversationMemoriesByType;
  createConversationMemory = conversationMemoryStorage.createConversationMemory;
  updateConversationMemory = conversationMemoryStorage.updateConversationMemory;
  deleteConversationMemory = conversationMemoryStorage.deleteConversationMemory;
  getConversationMessages = conversationMemoryStorage.getConversationMessages;
  createConversationMessage = conversationMemoryStorage.createConversationMessage;
  getConversationContexts = conversationMemoryStorage.getConversationContexts;
  getConversationContextByKey = conversationMemoryStorage.getConversationContextByKey;
  getConversationContextsByType = conversationMemoryStorage.getConversationContextsByType;
  createConversationContext = conversationMemoryStorage.createConversationContext;
  updateConversationContext = conversationMemoryStorage.updateConversationContext;
  deleteConversationContext = conversationMemoryStorage.deleteConversationContext;
  getConversationTasks = conversationMemoryStorage.getConversationTasks;
  getConversationTask = conversationMemoryStorage.getConversationTask;
  createConversationTask = conversationMemoryStorage.createConversationTask;
  updateConversationTask = conversationMemoryStorage.updateConversationTask;

  // Project Uploads
  getProjectUploadsByUserId = projectUploadsStorage.getProjectUploadsByUserId;
  getProjectUploadById = projectUploadsStorage.getProjectUploadById;
  createProjectUpload = projectUploadsStorage.createProjectUpload;
  updateProjectPublishStatus = projectUploadsStorage.updateProjectPublishStatus;
  incrementProjectViews = projectUploadsStorage.incrementProjectViews;
  deleteProjectUpload = projectUploadsStorage.deleteProjectUpload;
}

export const storage = new DatabaseStorage();