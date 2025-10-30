/**
 * Telegram Bot Service - Admin Feedback & Notifications
 * Sends real-time updates to admin via Telegram
 *
 * Bot Token: 8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw
 * Admin Phone: +1 808 763 1153
 */

interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_notification?: boolean;
}

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export class TelegramBotService {
  private botToken: string;
  private adminChatId: string | null = null;
  private baseUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!this.botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN is not set in the environment variables. Please set a secure token for the Telegram bot.");
    }
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    this.isEnabled = !!this.botToken;

    // Admin chat ID will be determined on first message or set manually
    this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || null;
  }

  /**
   * Send message to admin
   */
  async sendAdminMessage(
    message: string,
    parseMode: 'HTML' | 'Markdown' = 'HTML',
    silent: boolean = false
  ): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('[Telegram] Bot disabled - no token configured');
      return false;
    }

    if (!this.adminChatId) {
      console.log('[Telegram] No admin chat ID configured');
      return false;
    }

    try {
      const payload: TelegramMessage = {
        text: message,
        parse_mode: parseMode,
        disable_notification: silent,
      };

      const response = await fetch(`${this.baseUrl}/sendMessage?chat_id=${this.adminChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: TelegramResponse = await response.json();

      if (data.ok) {
        console.log('[Telegram] Message sent successfully');
        return true;
      } else {
        console.error('[Telegram] Failed to send message:', data.description);
        return false;
      }
    } catch (error) {
      console.error('[Telegram] Error sending message:', error);
      return false;
    }
  }

  /**
   * Set admin chat ID (call this after admin sends /start to bot)
   */
  setChatId(chatId: string) {
    this.adminChatId = chatId;
    console.log(`[Telegram] Admin chat ID set to: ${chatId}`);
  }

  /**
   * Get bot info
   */
  async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data: TelegramResponse = await response.json();
      return data.result;
    } catch (error) {
      console.error('[Telegram] Error getting bot info:', error);
      return null;
    }
  }

  /**
   * Get updates (for webhook setup or polling)
   */
  async getUpdates(offset?: number): Promise<any[]> {
    try {
      const url = offset
        ? `${this.baseUrl}/getUpdates?offset=${offset}`
        : `${this.baseUrl}/getUpdates`;

      const response = await fetch(url);
      const data: TelegramResponse = await response.json();

      return data.ok ? data.result : [];
    } catch (error) {
      console.error('[Telegram] Error getting updates:', error);
      return [];
    }
  }

  /**
   * Set webhook URL
   */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: webhookUrl }),
      });

      const data: TelegramResponse = await response.json();

      if (data.ok) {
        console.log('[Telegram] Webhook set successfully:', webhookUrl);
        return true;
      } else {
        console.error('[Telegram] Failed to set webhook:', data.description);
        return false;
      }
    } catch (error) {
      console.error('[Telegram] Error setting webhook:', error);
      return false;
    }
  }

  /**
   * Delete webhook (use polling instead)
   */
  async deleteWebhook(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/deleteWebhook`, {
        method: 'POST',
      });

      const data: TelegramResponse = await response.json();

      if (data.ok) {
        console.log('[Telegram] Webhook deleted successfully');
        return true;
      } else {
        console.error('[Telegram] Failed to delete webhook:', data.description);
        return false;
      }
    } catch (error) {
      console.error('[Telegram] Error deleting webhook:', error);
      return false;
    }
  }

  /**
   * Notification Templates
   */

  async notifyAgentExecution(agentType: string, task: string, success: boolean, result?: any) {
    const emoji = success ? '✅' : '❌';
    const status = success ? 'SUCCESS' : 'FAILED';

    const message = `
🤖 <b>Agent Execution</b>

${emoji} <b>Status:</b> ${status}
📋 <b>Agent:</b> ${agentType}
📝 <b>Task:</b> ${task}

${result ? `<b>Result:</b>\n${JSON.stringify(result, null, 2).substring(0, 200)}` : ''}
    `.trim();

    return this.sendAdminMessage(message);
  }

  async notifyUserAction(action: string, userId: string, details?: any) {
    const message = `
👤 <b>User Action</b>

🔔 <b>Action:</b> ${action}
🆔 <b>User ID:</b> ${userId}

${details ? `<b>Details:</b>\n${JSON.stringify(details, null, 2).substring(0, 200)}` : ''}
    `.trim();

    return this.sendAdminMessage(message);
  }

  async notifySecurityAlert(threatLevel: string, description: string, userId?: string) {
    const emoji = threatLevel === 'critical' ? '🚨' :
                  threatLevel === 'high' ? '⚠️' :
                  threatLevel === 'medium' ? '⚡' : 'ℹ️';

    const message = `
${emoji} <b>SECURITY ALERT</b>

🔴 <b>Threat Level:</b> ${threatLevel.toUpperCase()}
📋 <b>Description:</b> ${description}
${userId ? `🆔 <b>User ID:</b> ${userId}` : ''}

⏰ <b>Time:</b> ${new Date().toISOString()}
    `.trim();

    return this.sendAdminMessage(message);
  }

  async notifyPayment(amount: string, currency: string, userId: string, status: string) {
    const emoji = status === 'completed' ? '💰' :
                  status === 'pending' ? '⏳' : '❌';

    const message = `
${emoji} <b>Payment Update</b>

💵 <b>Amount:</b> ${amount} ${currency}
👤 <b>User ID:</b> ${userId}
📊 <b>Status:</b> ${status.toUpperCase()}

⏰ <b>Time:</b> ${new Date().toISOString()}
    `.trim();

    return this.sendAdminMessage(message);
  }

  async notifyTradingBot(botId: string, action: string, profit?: number, winRate?: number) {
    const profitEmoji = profit && profit > 0 ? '📈' : profit && profit < 0 ? '📉' : '➡️';

    const message = `
🤖 <b>Trading Bot Update</b>

🆔 <b>Bot ID:</b> ${botId}
⚡ <b>Action:</b> ${action}
${profit !== undefined ? `${profitEmoji} <b>Profit/Loss:</b> $${profit.toFixed(2)}` : ''}
${winRate !== undefined ? `📊 <b>Win Rate:</b> ${winRate.toFixed(2)}%` : ''}

⏰ <b>Time:</b> ${new Date().toISOString()}
    `.trim();

    return this.sendAdminMessage(message);
  }

  async notifySystemEvent(event: string, severity: 'info' | 'warning' | 'error', details?: string) {
    const emoji = severity === 'error' ? '🔴' :
                  severity === 'warning' ? '🟡' : '🟢';

    const message = `
${emoji} <b>System Event</b>

📋 <b>Event:</b> ${event}
⚠️ <b>Severity:</b> ${severity.toUpperCase()}
${details ? `📝 <b>Details:</b> ${details}` : ''}

⏰ <b>Time:</b> ${new Date().toISOString()}
    `.trim();

    return this.sendAdminMessage(message);
  }

  async notifyLearningProgress(botId: string, skillName: string, leveledUp: boolean, newLevel: number) {
    const emoji = leveledUp ? '🎉' : '📚';

    const message = `
${emoji} <b>Bot Learning Update</b>

🤖 <b>Bot ID:</b> ${botId}
⚡ <b>Skill:</b> ${skillName}
${leveledUp ? `🆙 <b>LEVEL UP!</b> Now Level ${newLevel}` : `📊 <b>Level:</b> ${newLevel}`}

⏰ <b>Time:</b> ${new Date().toISOString()}
    `.trim();

    return this.sendAdminMessage(message);
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(stats: {
    totalUsers: number;
    totalBots: number;
    activeBots: number;
    totalTrades: number;
    totalProfit: number;
    learningSessions: number;
  }) {
    const message = `
📊 <b>Daily Summary Report</b>

👥 <b>Users:</b> ${stats.totalUsers}
🤖 <b>Bots:</b> ${stats.totalBots} (${stats.activeBots} active)
📈 <b>Trades:</b> ${stats.totalTrades}
💰 <b>Profit:</b> $${stats.totalProfit.toFixed(2)}
🎓 <b>Learning Sessions:</b> ${stats.learningSessions}

⏰ <b>Date:</b> ${new Date().toLocaleDateString()}
    `.trim();

    return this.sendAdminMessage(message);
  }

  /**
   * Check bot health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const info = await this.getBotInfo();
      return !!info;
    } catch {
      return false;
    }
  }

  /**
   * ADMIN COMMAND HANDLERS
   * Process incoming commands from admin
   */

  async handleCommand(chatId: string, command: string, args: string[]): Promise<string> {
    // Set admin chat ID on first interaction
    if (!this.adminChatId) {
      this.setChatId(chatId);
    }

    // Verify this is the admin
    if (this.adminChatId && chatId !== this.adminChatId) {
      return '🚫 Unauthorized. This bot is for admin use only.';
    }

    switch (command) {
      case '/start':
        return this.handleStart();

      case '/help':
        return this.handleHelp();

      case '/status':
        return await telegramAdminHandler.getSystemStatus();

      case '/analytics':
        return await telegramAdminHandler.getAnalytics();

      case '/bots':
        return await telegramAdminHandler.listBots(args.length > 0 ? parseInt(args[0]) : 5);

      case '/users':
        return await telegramAdminHandler.listUsers(args.length > 0 ? parseInt(args[0]) : 5);

      case '/agent':
        if (args.length < 2) {
          return '❌ Usage: /agent [type] [task]\n\nExample: /agent blockchain check balance';
        }
        return await telegramAdminHandler.executeAgent(args[0], args.slice(1).join(' '));

      case '/startbot':
        if (args.length === 0) {
          return '❌ Usage: /startbot [botId]';
        }
        return await telegramAdminHandler.startBot(args[0]);

      case '/stopbot':
        if (args.length === 0) {
          return '❌ Usage: /stopbot [botId]';
        }
        return await telegramAdminHandler.stopBot(args[0]);

      case '/logs':
        return await telegramAdminHandler.viewLogs(args.length > 0 ? parseInt(args[0]) : 10);

      case '/broadcast':
        if (args.length === 0) {
          return '❌ Usage: /broadcast [message]';
        }
        return await telegramAdminHandler.broadcast(args.join(' '));

      case '/security':
        return await telegramAdminHandler.getSecurityStatus();

      case '/training':
        return await telegramAdminHandler.getTrainingStatus(args.length > 0 ? args[0] : 'all');

      case '/orchestrate':
        return await this.handleOrchestrate(args);

      case '/workflow':
        return await this.handleWorkflow(args);

      case '/initall':
        return await this.handleInitAll();

      case '/godmode':
        return await this.handleGodMode(args);

      default:
        return `❓ Unknown command: ${command}\n\nSend /help to see available commands.`;
    }
  }

  /**
   * Handle natural language message (non-command)
   */
  async handleNaturalLanguage(chatId: string, message: string): Promise<string> {
    // Set admin chat ID on first interaction
    if (!this.adminChatId) {
      this.setChatId(chatId);
    }

    // Verify this is the admin
    if (this.adminChatId && chatId !== this.adminChatId) {
      return '🚫 Unauthorized. This bot is for admin use only.';
    }

    // Return placeholder - will be replaced with master orchestrator call
    return `ORCHESTRATE_NATURAL:${message}`;
  }

  private handleStart(): string {
    return `
🎉 <b>Valifi Kingdom Admin Bot</b>

✅ Bot connected successfully!
📱 Chat ID registered for admin notifications

Use /help to see available commands.
    `.trim();
  }

  private handleHelp(): string {
    return `
📚 <b>Available Admin Commands</b>

<b>🌟 GOD MODE (New!):</b>
/godmode [command] - Natural language supreme control
/orchestrate [task] - Intelligent multi-agent orchestration
/workflow [steps] - Execute multi-step workflows
/initall - Initialize ALL systems

<b>System Status:</b>
/status - View system status
/analytics - View platform analytics
/security - Security alerts and status

<b>Bot Management:</b>
/bots [limit] - List all trading bots
/startbot [botId] - Start a trading bot
/stopbot [botId] - Stop a trading bot
/training [botId] - View bot training status

<b>User Management:</b>
/users [limit] - List recent users

<b>Agent Operations:</b>
/agent [type] [task] - Execute agent task
  Example: /agent blockchain check balance

<b>Admin Tools:</b>
/logs [limit] - View recent system logs
/broadcast [message] - Send message to all users

<b>💬 Natural Language:</b>
Just type anything! No command needed.
  "Buy 100 shares of AAPL"
  "Check all wallet balances"
  "Start all bots then analyze performance"

Send any command to control the platform remotely!
    `.trim();
  }



  private async handleOrchestrate(args: string[]): Promise<string> {
    const command = args.join(' ');
    return `ORCHESTRATE_PLACEHOLDER:${command}`;
  }

  private async handleWorkflow(args: string[]): Promise<string> {
    const workflow = args.join(' ');
    return `WORKFLOW_PLACEHOLDER:${workflow}`;
  }

  private async handleInitAll(): Promise<string> {
    return 'INITALL_PLACEHOLDER';
  }

  private async handleGodMode(args: string[]): Promise<string> {
    const command = args.join(' ');
    return `GODMODE_PLACEHOLDER:${command}`;
  }

  /**
   * Process incoming Telegram update
   */
  processUpdate(update: any): { chatId: string; command: string; args: string[]; isNaturalLanguage?: boolean } | null {
    try {
      if (!update.message?.text) {
        return null;
      }

      const chatId = update.message.chat.id.toString();
      const text = update.message.text.trim();

      // Parse command and args
      if (text.startsWith('/')) {
        const parts = text.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        return { chatId, command, args, isNaturalLanguage: false };
      }

      // Natural language input
      return {
        chatId,
        command: 'natural',
        args: [text],
        isNaturalLanguage: true,
      };
    } catch (error) {
      console.error('[Telegram] Error processing update:', error);
      return null;
    }
  }

  /**
   * Send message to specific chat
   */
  async sendMessage(
    chatId: string,
    message: string,
    parseMode: 'HTML' | 'Markdown' = 'HTML'
  ): Promise<boolean> {
    try {
      const payload: TelegramMessage = {
        text: message,
        parse_mode: parseMode,
      };

      const response = await fetch(`${this.baseUrl}/sendMessage?chat_id=${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: TelegramResponse = await response.json();
      return data.ok;
    } catch (error) {
      console.error('[Telegram] Error sending message:', error);
      return false;
    }
  }
}

export const telegramBotService = new TelegramBotService();
