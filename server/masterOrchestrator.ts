/**
 * Master Orchestrator - Supreme Control System
 *
 * The ultimate orchestration layer that coordinates ALL platform systems:
 * - 65 AI agents (63 TypeScript + 2 Python)
 * - Trading bots (7 strategies)
 * - Blockchain operations (5 networks)
 * - Payment processing (9+ processors)
 * - Financial services (stocks, bonds, forex, metals)
 * - Learning systems
 * - Security monitoring
 * - Telegram bot control
 *
 * Designed for Telegram bot to have God-mode control over entire platform.
 */

import { agentOrchestrator } from "./agentOrchestrator";
import { storage } from "./storage";
import { tradingBotService } from "./tradingBotService";
import { botLearningService } from "./botLearningService";
import { web3Service } from "./web3Service";
import { marketDataService } from "./marketDataService";
import { cryptoProcessorService } from "./cryptoProcessorService";
import { telegramBotService } from "./telegramBotService";
import { pythonAgentService } from "./pythonAgentService";
import { botStocks, botOptions, botBonds, botForex, botMetals, botCommodities } from "./financialServicesBot";

interface WorkflowStep {
  action: string;
  agentType?: string;
  params?: any;
  condition?: (result: any) => boolean;
}

interface OrchestrationResult {
  success: boolean;
  results: any[];
  errors: string[];
  duration: number;
  agentsUsed: string[];
  notificationSent: boolean;
}

export class MasterOrchestrator {
  private activeWorkflows: Map<string, any> = new Map();
  private systemStatus: 'starting' | 'running' | 'paused' | 'error' = 'starting';

  /**
   * Initialize all systems
   */
  async initialize(): Promise<void> {
    console.log('[MasterOrchestrator] 🚀 Initializing supreme control system...');

    try {
      // Check Python agents
      const pythonHealth = await pythonAgentService.checkHealth();
      console.log('[MasterOrchestrator] Python Agents:', pythonHealth);

      // Check Telegram bot
      const telegramHealth = await telegramBotService.checkHealth();
      console.log('[MasterOrchestrator] Telegram Bot:', telegramHealth ? '✅' : '❌');

      // Initialize agents in database if needed
      await this.ensureAgentsExist();

      this.systemStatus = 'running';
      console.log('[MasterOrchestrator] ✅ All systems operational');

      // Send startup notification
      await telegramBotService.notifySystemEvent(
        'Master Orchestrator Initialized',
        'info',
        'All 65 agents ready. Python agents: Terminal & SDK. Telegram bot online.'
      );
    } catch (error) {
      console.error('[MasterOrchestrator] Initialization error:', error);
      this.systemStatus = 'error';
      throw error;
    }
  }

  /**
   * Execute natural language command
   * Interprets user intent and routes to appropriate agents
   */
  async executeNaturalCommand(command: string, userId?: string): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const results: any[] = [];
    const errors: string[] = [];
    const agentsUsed: string[] = [];

    try {
      console.log(`[MasterOrchestrator] 🎯 Processing: "${command}"`);

      // Parse command intent
      const intent = this.parseIntent(command);
      console.log(`[MasterOrchestrator] Intent detected:`, intent);

      // Route to appropriate handler
      let result: any;

      switch (intent.category) {
        case 'trading':
          result = await this.handleTradingCommand(intent, userId);
          break;

        case 'blockchain':
          result = await this.handleBlockchainCommand(intent, userId);
          break;

        case 'financial':
          result = await this.handleFinancialCommand(intent);
          break;

        case 'agent':
          result = await this.handleAgentCommand(intent);
          break;

        case 'system':
          result = await this.handleSystemCommand(intent);
          break;

        case 'analytics':
          result = await this.handleAnalyticsCommand(intent);
          break;

        case 'workflow':
          result = await this.executeWorkflow(intent.workflow || []);
          break;

        case 'learning':
          result = await this.handleLearningCommand(intent, userId);
          break;

        default:
          // Auto-detect and execute with LangGraph
          result = await agentOrchestrator.execute(command, 'auto');
          agentsUsed.push('auto-orchestrator');
      }

      results.push(result);

      // Send success notification
      await telegramBotService.sendAdminMessage(
        `✅ <b>Command Executed</b>\n\n📝 <b>Command:</b> ${command}\n\n<b>Result:</b>\n${JSON.stringify(result, null, 2).substring(0, 300)}...`
      );

      return {
        success: true,
        results,
        errors,
        duration: Date.now() - startTime,
        agentsUsed,
        notificationSent: true,
      };
    } catch (error: any) {
      console.error('[MasterOrchestrator] Execution error:', error);
      errors.push(error.message);

      await telegramBotService.sendAdminMessage(
        `❌ <b>Command Failed</b>\n\n📝 <b>Command:</b> ${command}\n\n<b>Error:</b>\n${error.message}`
      );

      return {
        success: false,
        results,
        errors,
        duration: Date.now() - startTime,
        agentsUsed,
        notificationSent: true,
      };
    }
  }

  /**
   * Parse natural language intent
   */
  private parseIntent(command: string): any {
    const lower = command.toLowerCase();

    // Trading keywords
    if (lower.includes('trade') || lower.includes('buy') || lower.includes('sell') ||
        lower.includes('bot') && (lower.includes('start') || lower.includes('stop'))) {
      return {
        category: 'trading',
        action: lower.includes('buy') ? 'buy' : lower.includes('sell') ? 'sell' : 'manage',
        params: this.extractParams(command),
      };
    }

    // Blockchain keywords
    if (lower.includes('wallet') || lower.includes('blockchain') || lower.includes('eth') ||
        lower.includes('balance') || lower.includes('transaction')) {
      return {
        category: 'blockchain',
        action: lower.includes('balance') ? 'balance' :
                lower.includes('send') ? 'send' : 'query',
        params: this.extractParams(command),
      };
    }

    // Financial services
    if (lower.includes('stock') || lower.includes('bond') || lower.includes('forex') ||
        lower.includes('metal') || lower.includes('gold') || lower.includes('quote')) {
      return {
        category: 'financial',
        action: 'query',
        asset: lower.includes('stock') ? 'stock' :
               lower.includes('bond') ? 'bond' :
               lower.includes('forex') ? 'forex' : 'metal',
        params: this.extractParams(command),
      };
    }

    // System commands
    if (lower.includes('status') || lower.includes('health') || lower.includes('restart') ||
        lower.includes('start all') || lower.includes('shutdown')) {
      return {
        category: 'system',
        action: lower.includes('status') ? 'status' :
                lower.includes('restart') ? 'restart' :
                lower.includes('start') ? 'start' : 'shutdown',
      };
    }

    // Analytics
    if (lower.includes('analyze') || lower.includes('report') || lower.includes('stats') ||
        lower.includes('metric') || lower.includes('analytics')) {
      return {
        category: 'analytics',
        action: 'generate',
        params: this.extractParams(command),
      };
    }

    // Learning
    if (lower.includes('train') || lower.includes('learn') || lower.includes('skill')) {
      return {
        category: 'learning',
        action: lower.includes('train') ? 'train' : 'analyze',
        params: this.extractParams(command),
      };
    }

    // Workflow (multi-step)
    if (lower.includes('then') || lower.includes('after') || lower.includes('if')) {
      return {
        category: 'workflow',
        workflow: this.parseWorkflow(command),
      };
    }

    // Default: agent execution
    return {
      category: 'agent',
      action: 'execute',
      command,
    };
  }

  /**
   * Extract parameters from command
   */
  private extractParams(command: string): any {
    const params: any = {};

    // Extract ticker symbols (e.g., AAPL, BTC, ETH)
    const tickerMatch = command.match(/\b[A-Z]{2,5}\b/);
    if (tickerMatch) {
      params.symbol = tickerMatch[0];
    }

    // Extract amounts
    const amountMatch = command.match(/\$?([\d,]+\.?\d*)/);
    if (amountMatch) {
      params.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract bot IDs
    const botIdMatch = command.match(/bot[:\s-]+([\w-]+)/i);
    if (botIdMatch) {
      params.botId = botIdMatch[1];
    }

    return params;
  }

  /**
   * Parse multi-step workflow
   */
  private parseWorkflow(command: string): WorkflowStep[] {
    // Simple workflow parsing (can be enhanced with AI)
    const steps: WorkflowStep[] = [];
    const parts = command.split(/\s+then\s+|\s+and\s+|\s+after\s+/i);

    for (const part of parts) {
      steps.push({
        action: part.trim(),
      });
    }

    return steps;
  }

  /**
   * Handle trading commands
   */
  private async handleTradingCommand(intent: any, userId?: string): Promise<any> {
    const { action, params } = intent;

    if (action === 'buy' || action === 'sell') {
      // Execute trade via appropriate bot
      if (params.symbol) {
        const quote = await botStocks.getQuote(params.symbol);
        return {
          action,
          symbol: params.symbol,
          quote,
          message: `${action.toUpperCase()} ${params.symbol} at ${quote.price}`,
        };
      }
    }

    if (action === 'manage') {
      // Bot management
      if (params.botId) {
        const bot = await storage.getBot(params.botId);
        return bot;
      } else {
        const bots = await storage.getAllBots(10, 0);
        return { bots: bots.length, list: bots };
      }
    }

    return { message: 'Trading command processed' };
  }

  /**
   * Handle blockchain commands
   */
  private async handleBlockchainCommand(intent: any, userId?: string): Promise<any> {
    const { action, params } = intent;

    if (action === 'balance' && userId) {
      const wallets = await storage.getWalletsByUser(userId);
      const balances = [];

      for (const wallet of wallets) {
        const balance = await web3Service.getBalance(wallet.address, wallet.network);
        balances.push({
          network: wallet.network,
          address: wallet.address,
          balance,
        });
      }

      return { wallets: balances };
    }

    // Use blockchain agent
    return await agentOrchestrator.execute(intent.action, 'blockchain');
  }

  /**
   * Handle financial services commands
   */
  private async handleFinancialCommand(intent: any): Promise<any> {
    const { asset, params } = intent;

    if (params.symbol) {
      switch (asset) {
        case 'stock':
          return await botStocks.getQuote(params.symbol);
        case 'forex':
          return await botForex.getQuote(params.symbol);
        case 'bond':
          return await botBonds.getQuote(params.symbol);
        case 'metal':
          return await botMetals.getQuote(params.symbol);
        default:
          return await marketDataService.getStockQuote(params.symbol);
      }
    }

    return { message: 'Please specify a symbol' };
  }

  /**
   * Handle agent commands
   */
  private async handleAgentCommand(intent: any): Promise<any> {
    return await agentOrchestrator.execute(intent.command, 'auto');
  }

  /**
   * Handle system commands
   */
  private async handleSystemCommand(intent: any): Promise<any> {
    const { action } = intent;

    switch (action) {
      case 'status':
        return await this.getSystemStatus();

      case 'start':
        await this.initialize();
        return { message: 'All systems started' };

      case 'restart':
        this.systemStatus = 'starting';
        await this.initialize();
        return { message: 'All systems restarted' };

      default:
        return { status: this.systemStatus };
    }
  }

  /**
   * Handle analytics commands
   */
  private async handleAnalyticsCommand(intent: any): Promise<any> {
    const totalUsers = await storage.getTotalUsersCount();
    const totalBots = await storage.getTotalBotsCount();
    const allBots = await storage.getAllBots(100, 0);

    const avgWinRate = allBots.reduce((sum, b) => sum + parseFloat(b.winRate || "0"), 0) / (allBots.length || 1);
    const totalProfit = allBots.reduce((sum, b) => sum + parseFloat(b.totalProfit || "0"), 0);

    return {
      users: totalUsers,
      bots: totalBots,
      avgWinRate: avgWinRate.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle learning commands
   */
  private async handleLearningCommand(intent: any, userId?: string): Promise<any> {
    const { action, params } = intent;

    if (action === 'train' && params.botId) {
      const sessionId = await botLearningService.startLearningSession(
        params.botId,
        'reinforcement'
      );
      return { sessionId, message: 'Training started' };
    }

    if (params.botId) {
      return await botLearningService.getBotLearningStats(params.botId);
    }

    return { message: 'Please specify a bot ID' };
  }

  /**
   * Execute multi-step workflow
   */
  async executeWorkflow(steps: WorkflowStep[]): Promise<any> {
    const results = [];

    for (const step of steps) {
      try {
        const result = await this.executeNaturalCommand(step.action);
        results.push(result);

        // Check condition if present
        if (step.condition && !step.condition(result)) {
          break; // Stop workflow if condition fails
        }
      } catch (error: any) {
        results.push({ error: error.message });
        break; // Stop on error
      }
    }

    return { workflow: results };
  }

  /**
   * Get comprehensive system status
   */
  async getSystemStatus(): Promise<any> {
    const [totalUsers, totalBots, agents, pythonHealth] = await Promise.all([
      storage.getTotalUsersCount(),
      storage.getTotalBotsCount(),
      storage.getAllAgents(),
      pythonAgentService.checkHealth(),
    ]);

    const allBots = await storage.getAllBots(100, 0);
    const activeBots = allBots.filter(b => b.isActive).length;
    const activeAgents = agents.filter(a => a.status === 'active').length;

    return {
      status: this.systemStatus,
      users: totalUsers,
      bots: { total: totalBots, active: activeBots },
      agents: { total: agents.length, active: activeAgents },
      pythonAgents: pythonHealth,
      activeWorkflows: this.activeWorkflows.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Ensure all agent types exist in database
   */
  private async ensureAgentsExist(): Promise<void> {
    const agentTypes = [
      // Core (11)
      'orchestrator', 'blockchain', 'web3', 'payment', 'kyc', 'security',
      'publishing', 'quantum', 'analytics', 'monitoring', 'guardian_angel',

      // Financial (13)
      'financial_401k', 'financial_ira', 'financial_pension', 'financial_bonds',
      'financial_stocks', 'financial_options', 'financial_forex', 'financial_metals',
      'financial_commodities', 'financial_mutual_funds', 'financial_reit',
      'financial_crypto_derivatives', 'financial_portfolio',

      // Trading (8)
      'trading_amm', 'trading_liquidity', 'trading_defi', 'trading_bridge',
      'trading_lending', 'trading_gas_optimizer', 'trading_mining', 'trading_advanced',

      // Wallet (5)
      'wallet_hd', 'wallet_hardware', 'wallet_multisig', 'wallet_seed_management',
      'security_privacy',

      // Platform (15)
      'platform', 'platform_admin_control', 'platform_admin_dashboard',
      'platform_contact_manager', 'platform_communication', 'platform_mail',
      'platform_translation', 'platform_education', 'platform_onboarding',
      'platform_vip_desk', 'platform_enterprise', 'platform_escrow',
      'platform_advanced_services', 'platform_innovative', 'platform_address_book',

      // Analytics (6)
      'analytics_portfolio', 'analytics_transaction_history', 'analytics_divine_oracle',
      'analytics_word', 'analytics_cyberlab', 'analytics_banking',

      // NFT (3)
      'nft_minting', 'collectibles', 'smart_contract',

      // Community (2)
      'community_exchange', 'multichain',

      // Python (2)
      'python_terminal', 'python_sdk',
    ];

    for (const type of agentTypes) {
      const existing = await storage.getAgentsByType(type);
      if (existing.length === 0) {
        await storage.createAgent({
          name: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          type: type as any,
          status: 'active',
          config: {},
          capabilities: [type],
        });
      }
    }

    console.log(`[MasterOrchestrator] ✅ ${agentTypes.length} agent types verified`);
  }

  /**
   * Execute all agent capabilities
   */
  async orchestrateAll(task: string): Promise<any> {
    console.log(`[MasterOrchestrator] 🌟 FULL ORCHESTRATION: ${task}`);

    // Use natural language processing
    return await this.executeNaturalCommand(task);
  }
}

export const masterOrchestrator = new MasterOrchestrator();
