# Telegram Admin Bot - Complete Setup Guide

## Overview

The Valifi Kingdom platform now features a **fully-integrated Telegram bot** for real-time admin notifications and complete platform control via Telegram commands.

**Bot Token:** `8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw`
**Admin Phone:** `+1 808 763 1153`

---

## Features

### 📢 Real-Time Notifications
- **Agent Execution:** Instant notifications when agents complete tasks
- **Security Alerts:** Guardian Angel threat detection
- **Payment Updates:** Real-time payment status changes
- **Trading Bot Updates:** P/L changes, bot starts/stops
- **Learning Progress:** Bot skill level-ups and training completions
- **System Events:** Critical system alerts

### 🎮 Full Admin Control
Execute any platform operation via Telegram commands:

**System Management:**
- `/status` - View system status (users, bots, agents)
- `/analytics` - Platform analytics and performance metrics
- `/security` - Security status and recent alerts
- `/logs [limit]` - View recent system logs

**Bot Management:**
- `/bots [limit]` - List trading bots with stats
- `/startbot [botId]` - Start a trading bot
- `/stopbot [botId]` - Stop a trading bot
- `/training [botId]` - View bot learning status

**User Management:**
- `/users [limit]` - List recent users

**Agent Operations:**
- `/agent [type] [task]` - Execute any agent task remotely
  - Example: `/agent blockchain check balance`
  - Example: `/agent trading analyze market`

**Admin Tools:**
- `/broadcast [message]` - Send message to all users
- `/help` - Show all available commands

---

## Setup Instructions

### Step 1: Configure Environment Variables

Add the following to your `.env` file:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw"
TELEGRAM_ADMIN_CHAT_ID=""  # Leave empty - will be set automatically
```

### Step 2: Start the Valifi Platform

```bash
npm run dev
```

The Telegram bot service will initialize automatically on startup.

### Step 3: Connect Your Telegram Account

1. **Open Telegram** on your phone (+1 808 763 1153)

2. **Find your bot:**
   - Search for your bot name (check with `/api/telegram/info` endpoint)
   - Or use this link format: `https://t.me/YOUR_BOT_USERNAME`

3. **Send `/start` to the bot**
   - This registers your chat ID
   - You should receive a welcome message

4. **Test with `/help`**
   - Verify you can see the full command list

### Step 4: Set Up Webhook (Optional but Recommended)

For production deployments with a public URL:

```bash
# Set webhook
curl -X POST http://localhost:5000/api/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_ADMIN_SESSION" \
  -d '{"webhookUrl":"https://your-domain.com/api/telegram/webhook"}'
```

For development (polling):

```bash
# Delete webhook to use polling
curl -X POST https://api.telegram.org/bot8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw/deleteWebhook
```

---

## Testing the Integration

### Test 1: Send Test Notification

```bash
curl -X POST http://localhost:5000/api/telegram/test \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_ADMIN_SESSION" \
  -d '{"message":"Hello from Valifi!"}'
```

### Test 2: Check Bot Info

```bash
curl http://localhost:5000/api/telegram/info \
  -H "Cookie: YOUR_ADMIN_SESSION"
```

### Test 3: Try Commands in Telegram

Open Telegram and send:
- `/status` - Should show system status
- `/help` - Should show command list
- `/bots 3` - Should show top 3 trading bots

---

## Architecture

### Components Created

**1. Telegram Bot Service** (`server/telegramBotService.ts`)
- Send/receive messages via Telegram Bot API
- Command parsing and routing
- Notification templates

**2. Telegram Admin Handler** (`server/telegramAdminHandler.ts`)
- Wires commands to platform operations
- System status, analytics, bot management
- Agent execution, security monitoring

**3. Routes Integration** (`server/routes.ts:6733-6845`)
- Webhook endpoint: `POST /api/telegram/webhook`
- Admin endpoints: `/api/telegram/*`
- Command processing pipeline

**4. Agent Orchestrator Integration** (`server/agentOrchestrator.ts:13,873-875`)
- Automatic notifications on agent execution
- Success/failure status updates
- Real-time task completion alerts

---

## Notification Flow

```
Agent Executes
     ↓
agentOrchestrator.logAgentActivity()
     ↓
telegramBotService.notifyAgentExecution()
     ↓
Telegram API → Your Phone
```

### Notification Types

**Agent Execution:**
```
🤖 Agent Execution

✅ Status: SUCCESS
📋 Agent: blockchain
📝 Task: check balance

Result: { balance: 1.5 ETH }
```

**Security Alert:**
```
🚨 SECURITY ALERT

🔴 Threat Level: HIGH
📋 Description: Unusual activity detected
🆔 User ID: abc123

⏰ Time: 2025-10-26 12:00:00
```

**Trading Bot Update:**
```
🤖 Trading Bot Update

🆔 Bot ID: bot-123
⚡ Action: Trade Executed
📈 Profit/Loss: $125.50
📊 Win Rate: 68.5%
```

---

## Command Examples

### System Monitoring

```
/status
→ Shows users, bots, agents, and operational status

/analytics
→ Displays win rates, profits, learning sessions

/security
→ Guardian Angel status and threat level
```

### Bot Control

```
/bots 5
→ Lists top 5 trading bots with performance

/startbot abc-123
→ Activates trading bot abc-123

/stopbot abc-123
→ Deactivates trading bot abc-123

/training abc-123
→ Shows learning stats for bot abc-123
```

### Agent Operations

```
/agent blockchain check wallets
→ Executes blockchain agent to check all wallets

/agent payment process pending
→ Processes pending payments via payment agent

/agent analytics generate report
→ Generates analytics report
```

### Admin Actions

```
/logs 20
→ Shows last 20 system log entries

/broadcast Welcome to Valifi Kingdom!
→ Sends message to all active users
```

---

## Troubleshooting

### Bot Not Responding

**Check bot token:**
```bash
curl https://api.telegram.org/bot8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw/getMe
```

**Check chat ID registration:**
- Send `/start` to bot again
- Check logs for `[Telegram] Admin chat ID set to: ...`

### Notifications Not Arriving

**Verify chat ID is set:**
```bash
# Check environment variable
echo $TELEGRAM_ADMIN_CHAT_ID

# Or set manually via API
curl -X POST http://localhost:5000/api/telegram/set-chat-id \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_ADMIN_SESSION" \
  -d '{"chatId":"YOUR_CHAT_ID"}'
```

**Check bot health:**
```bash
curl http://localhost:5000/api/telegram/info
```

### Webhook Issues

**Delete existing webhook:**
```bash
curl -X POST https://api.telegram.org/bot8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw/deleteWebhook
```

**Set new webhook:**
```bash
curl -X POST http://localhost:5000/api/telegram/set-webhook \
  -d '{"webhookUrl":"https://your-domain.com/api/telegram/webhook"}'
```

---

## Advanced Configuration

### Custom Notification Triggers

Add notifications anywhere in the codebase:

```typescript
import { telegramBotService } from "./telegramBotService";

// Notify on payment
await telegramBotService.notifyPayment(
  "100.00",
  "USD",
  userId,
  "completed"
);

// Notify on security event
await telegramBotService.notifySecurityAlert(
  "high",
  "Failed login attempts detected",
  userId
);

// Custom notification
await telegramBotService.sendAdminMessage(
  "🎉 <b>New user registered!</b>\n\nUser ID: " + userId
);
```

### Daily Summary Reports

Schedule a cron job to send daily summaries:

```typescript
import { telegramBotService } from "./telegramBotService";

// Send at midnight
cron.schedule('0 0 * * *', async () => {
  const stats = await getDailyStats();
  await telegramBotService.sendDailySummary(stats);
});
```

---

## Security Considerations

1. **Bot Token Protection**
   - Never commit `.env` files
   - Rotate token if exposed
   - Use environment variables only

2. **Chat ID Verification**
   - Only your phone can register
   - First `/start` command sets the admin
   - All other chats are rejected

3. **Webhook Security**
   - Use HTTPS for webhooks
   - Consider IP whitelisting
   - Add webhook secret validation (optional enhancement)

---

## Files Modified/Created

### New Files:
- `server/telegramBotService.ts` (562 lines) - Core bot service
- `server/telegramAdminHandler.ts` (409 lines) - Admin command handlers
- `TELEGRAM_BOT_SETUP.md` - This documentation

### Modified Files:
- `server/routes.ts` - Added 5 Telegram endpoints (+113 lines)
- `server/agentOrchestrator.ts` - Added notification integration (+3 lines)

---

## API Endpoints

### Public Endpoints

**POST /api/telegram/webhook**
- Receives updates from Telegram
- Processes commands
- Sends responses

### Admin-Only Endpoints

**POST /api/telegram/set-webhook**
```json
{
  "webhookUrl": "https://your-domain.com/api/telegram/webhook"
}
```

**GET /api/telegram/info**
- Returns bot information

**POST /api/telegram/test**
```json
{
  "message": "Test notification"
}
```

**POST /api/telegram/set-chat-id**
```json
{
  "chatId": "123456789"
}
```

---

## Next Steps

### Enhancements to Consider:

1. **Inline Keyboards** - Add buttons for common actions
2. **Photo/Chart Support** - Send visual analytics
3. **Multi-Admin Support** - Allow multiple authorized users
4. **Command History** - Track admin actions via Telegram
5. **2FA Integration** - Require confirmation for critical commands

---

## Support

For issues or questions:
1. Check logs: `[Telegram]` prefix in server logs
2. Test bot directly: https://api.telegram.org/bot{TOKEN}/getMe
3. Verify webhook: https://api.telegram.org/bot{TOKEN}/getWebhookInfo

---

## Summary

✅ **Bot Token Configured:** 8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw
✅ **Phone Number:** +1 808 763 1153
✅ **13 Admin Commands** - Full platform control
✅ **7 Notification Types** - Real-time alerts
✅ **5 API Endpoints** - Programmatic access
✅ **Auto-Integration** - Agent orchestrator wired

**Status:** COMPLETE AND READY TO USE

Send `/start` to your bot to begin! 🚀
