# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GodBrain CyberLab** is a professional-grade cybersecurity training and analysis platform combining:
- **Educational CEH Training**: Penetration testing simulations and security awareness
- **AI-Powered Bot System**: Intelligent bots with persistent learning capabilities
- **Life Optimization**: Guardian Angel personal assistant for health, safety, and scheduling
- **Security Operations**: Real-time attack logging, threat intelligence, and cryptographic services
- **Holy Siege Integration**: GPG-signed reconnaissance toolkit for authorized security assessments
- **Spoofing Lab**: Phishing awareness training with customizable templates

The system is spiritually guided and emphasizes ethical use within authorized environments only.

## Development Commands

### TypeScript Build
```bash
# Compile TypeScript to JavaScript
npx tsc

# Type check without compiling
npx tsc --noEmit

# Output directory: ./dist
```

### Running the Application
```bash
# Start the production server (port 3001)
npm start

# Development mode with watch
npm run dev

# Electron GUI application
npm run start          # From gui/ directory
npm run build          # Build desktop app
```

### Access Web Dashboard
```bash
# After starting the server, open in browser:
http://localhost:3001

# 8 Interactive Tabs Available:
# - 🛡️ CyberLab (contract scanning, pen testing, wallet auditing)
# - 🏦 Banking (account linking, transactions, credit scoring)
# - 🎣 Spoofing Lab (7 phishing templates, campaigns, training reports)
# - ⚔️ Holy Siege (GPG-signed reconnaissance, IPFS reports)
# - 👼 Guardian Angel (health tracking, safety, scheduling)
# - 🚨 Attack Monitor (logs, vulnerabilities, threat intelligence)
# - 🔐 Crypter/FUD (payload encryption, HTML obfuscation)
# - 🧠 Bot Learning (skills, executions, memories)
```

### Testing
```bash
# Test all API endpoints
./test-endpoints.sh

# Test attack logging system
./test-attack-logging.sh
```

## Architecture Overview

### Dual Deployment Model

The platform supports two independent architectures:

1. **TypeScript Backend API** (`src/` directory)
   - Express.js REST API on port 3001
   - Five core service modules
   - JSON-based persistent storage in `database/`
   - Learning system with skill progression

2. **Electron Desktop GUI** (`main.js`, `index.html`)
   - Cross-platform desktop application
   - Integrated CEH training modules
   - Local server management
   - No cloud dependencies

### Core Services

**Location**: `src/services/`

1. **cyberLabService.ts** - Two main bot classes:
   - `BotCyberLab` (botId: `"analytics_cyberlab"`)
     - Smart contract vulnerability scanning
     - Penetration testing simulation
     - Attack simulation with mitigation recommendations
     - Wallet security auditing
     - Phishing URL detection

   - `BotBanking` (botId: `"analytics_banking"`)
     - Bank account linking (requires Plaid integration)
     - Balance tracking with memory persistence
     - ACH transfer initiation
     - Transaction categorization and analysis
     - Credit score assessment (requires credit bureau API)
     - Loan qualification analysis
     - Financial health scoring

2. **guardianAngelService.ts** - Personal life optimization assistant
   - Health metrics tracking (heart rate, blood pressure, sleep, etc.)
   - Wellness score calculation (physical, mental, sleep, nutrition)
   - Schedule management with reminders
   - Location safety checking (requires crime/weather APIs)
   - SOS emergency alerts
   - Daily briefings
   - JSON persistence: `guardian-alerts.json`, `guardian-schedule.json`, `guardian-health.json`

3. **attackLogService.ts** - Security operations center
   - Real-time attack logging with severity classification
   - Vulnerability report generation
   - Threat intelligence tracking
   - Statistical analytics
   - JSON persistence: `attack-logs.json`, `vulnerability-reports.json`, `threat-intel.json`

4. **crypterService.ts** - Payload encryption/obfuscation (ethical use only)
   - Multiple encryption methods: AES-256, Base64, XOR, polymorphic, FUD
   - HTML obfuscation for phishing awareness training
   - Stub generator for payload delivery
   - Detection rate estimation

5. **botLearningService.ts** - AI learning engine
   - Skill progression (0-10 levels with exponential XP)
   - Execution history tracking
   - Memory system with importance scoring
   - Persistent learning across sessions

6. **storage.ts** - In-memory data persistence layer
   - Trading system memory retrieval
   - Memory management utilities

7. **spoofingLabService.ts** - Kingdom CyberLab phishing awareness training
   - **7 Default Templates**: Banking, CEO compromise, delivery SMS, Microsoft 365 login, IRS scam, tech support popup, QR code parking
   - **Template Categories**: email, sms, webpage, voice, qr_code
   - **Difficulty Levels**: beginner, intermediate, advanced, expert
   - **Customization System**: Templates use {{variable}} placeholders for personalization
   - **Campaign Management**: Create, track, and analyze phishing awareness campaigns
   - **Spoofing Analysis**: Analyze email, domain, caller ID, SMS, and IP spoofing techniques
   - **Training Reports**: Effectiveness scoring based on click/report rates
   - **Educational Focus**: All templates include indicators, prevention methods, and educational notes
   - JSON persistence: `phishing-templates.json`, `phishing-campaigns.json`

   **Template Variables Examples**:
   - Banking: bank_name, customer_name, account_last4, phishing_link
   - CEO Compromise: employee_name, amount, ceo_name, ceo_title
   - SMS: courier_name, tracking_number, short_link
   - Webpage: company_name, action_url
   - QR Code: vehicle_description, license_plate, fine_amount

### Holy Siege System

**Location**: `controller/`, `worker/`, `launcher/`, `docker/`, `ansible/`

**Holy Siege** is a GPG-signed, safe reconnaissance toolkit for authorized security assessments:

**Architecture**:
1. **Controller** (`controller/app.js`) - Fastify server on port 3000
   - Verifies GPG signatures on job manifests
   - Requires submitter to be in ADMIN_KEYS whitelist
   - Enqueues jobs in Redis (bee-queue)
   - Manifest expiry validation
   - `/api/jobs` POST endpoint for signed manifest submission
   - `/api/jobs/:id` GET endpoint for job status

2. **Worker** (`worker/main.js`) - Executes safe reconnaissance
   - Pulls jobs from Redis queue
   - **Non-destructive checks only**:
     - `nmap -sV -Pn` - Service version detection
     - HTTP headers - Server fingerprinting
     - SMTP banner - Email server identification
   - Uploads signed reports to IPFS (`worker/valifi_ipfs.js`)
   - GPG signs all reports

3. **Launcher** (`launcher/run_job.js`) - Job submission client
   - Creates signed manifests with local GPG key
   - Posts to controller for verification and queuing
   - Usage: `node launcher/run_job.js quick-scan <target>`

4. **Docker Deployment** (`docker/`)
   - `docker-compose.yml` - Multi-container orchestration
   - `Dockerfile.controller` - Controller container
   - `Dockerfile.worker` - Worker container
   - Redis service for job queue

5. **Ansible Hardening** (`ansible/hardening.yml`)
   - Non-destructive security hardening playbooks
   - Requires multi-admin sign-off and canary deployment

**Configuration**:
- `ADMIN_KEYS` - Comma-separated GPG key IDs authorized to submit jobs
- `REDIS_URL` - Redis connection string (default: redis://127.0.0.1:6379)
- `IPFS_API` - IPFS upload endpoint (default: https://ipfs.io/api/v0/add)

**Ethical Guidelines** (see `docs/ETHICAL_GUIDE.md`):
- ✅ Only scan systems you own or have written permission to test
- ✅ Keep authorization documents attached to manifests
- ❌ Never access systems without consent
- ❌ No stealth, evasion, MITM, or exploit code

### API Endpoints (416 lines in server.ts)

**CyberLab Security** (`/api/cyberlab/*`)
- `POST /scan-contract` - Scan smart contracts for vulnerabilities
- `POST /penetration-test` - Run penetration test on target URL
- `POST /simulate-attack` - Simulate attack with mitigation recommendations
- `POST /audit-wallet` - Security audit for crypto wallets
- `POST /detect-phishing` - Analyze URLs for phishing indicators

**Banking Operations** (`/api/banking/*`)
- `POST /link-account` - Link bank account via Plaid token
- `GET /balance/:accountId` - Retrieve account balance
- `POST /ach` - Initiate ACH transfer (deposit/withdrawal)
- `GET /transactions/:accountId?days=30` - Get transaction history
- `GET /categorize/:accountId` - Categorize transactions
- `GET /credit-score/:userId` - Get credit score
- `POST /loan-qualification` - Analyze loan eligibility
- `GET /financial-health/:userId` - Calculate financial health score

**Bot Learning** (`/api/learning/*`)
- `GET /skills?botId=<id>` - Get bot skill levels
- `GET /executions?botId=<id>` - Get execution history
- `GET /memories?botId=<id>` - Get stored memories

**Attack Intelligence** (`/api/attacks/*`)
- `GET /logs?severity=&status=&attackType=&limit=100` - Get attack logs
- `GET /vulnerabilities?target=&targetType=&minRiskScore=&limit=100` - Get vulnerability reports
- `GET /threats?threatType=&minConfidence=&limit=100` - Get threat intelligence
- `GET /statistics` - Get attack statistics
- `DELETE /clear?olderThan=<date>` - Clear old logs

**Guardian Angel** (`/api/guardian/*`)
- `POST /health` - Track health metrics
- `GET /wellness/:userId` - Analyze wellness score
- `POST /schedule` - Add schedule item
- `GET /schedule/:userId?startDate=&endDate=` - Get schedule
- `PUT /schedule/:itemId/complete` - Complete schedule item
- `POST /safety` - Check location safety
- `POST /sos` - Send emergency SOS
- `GET /briefing/:userId` - Get daily briefing
- `GET /alerts?type=&priority=&acknowledged=` - Get alerts
- `PUT /alerts/:alertId/acknowledge` - Acknowledge alert
- `GET /health-history?days=30` - Get health history

**Crypter System** (`/api/crypter/*`)
- `POST /encrypt` - Encrypt payload with method (aes256, base64, xor, polymorphic, fud)
- `POST /decrypt` - Decrypt payload with key
- `POST /obfuscate-html` - Obfuscate HTML for training
- `POST /generate-stub` - Generate decryption stub

**Spoofing Lab** (`/api/spoofing/*`)
- `GET /templates?category=&difficulty=` - Get phishing templates (filtered)
- `GET /templates/:id` - Get specific template details
- `POST /templates` - Create custom phishing template
- `POST /customize/:templateId` - Customize template with variables
- `GET /campaigns?status=&createdBy=` - Get all campaigns (filtered)
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns` - Create new awareness campaign
- `POST /campaigns/:id/stats` - Update campaign statistics (sent, clicked, reported, educated)
- `POST /analyze` - Analyze spoofing techniques (email, domain, caller_id, sms, ip)
- `GET /campaigns/:id/report` - Generate training effectiveness report

### Bot Learning System

**Learning Flow**:
1. Bot executes task (e.g., scanContract, getBalance)
2. `botLearningService.learnFromExecution()` logs success/failure
3. `botLearningService.progressBotSkill()` awards XP in skill category
4. `botLearningService.updateBotMemory()` stores contextual data
5. Skills level up exponentially (0-10 levels, MAX_SKILL_LEVEL=10)

**Skill Categories**:
- `security` - CyberLab security operations
- `banking` - Banking account operations
- `analytics` - Data analysis
- `credit` - Credit scoring
- `lending` - Loan qualification
- `payload_encryption` - Crypter operations (crypterService)
- `offensive` - Offensive security operations
- `template_creation` - Creating phishing templates (spoofingLab)
- `template_customization` - Customizing templates with variables (spoofingLab)
- `campaign_management` - Managing awareness campaigns (spoofingLab)
- `spoofing_analysis` - Analyzing spoofing techniques (spoofingLab)
- `training_assessment` - Evaluating training effectiveness (spoofingLab)

**Memory Patterns**:
- Contract scans: `contract_${address}`
- Bank balances: `balance_${accountId}`
- Loan analyses: `loan_analysis_${userId}`
- Financial data: `financial_data_${userId}`
- Each memory has importance score (0-100) and timestamp

### Smart Contract Vulnerability Detection

**Vulnerability Types** (cyberLabService.ts:scanContract):
- Reentrancy attacks - External calls without guards
- Integer overflow - Arithmetic without SafeMath
- Unchecked external calls - Missing return value checks
- Access control - Missing onlyOwner/require statements
- Gas optimization - Inefficient loops and storage
- Timestamp dependence - block.timestamp usage
- Tx.origin usage - Authentication vulnerabilities

**Risk Scoring**:
- Critical: 40 points
- High: 25 points
- Medium: 15 points
- Low: 5 points
- Maximum risk score: 100 (capped)

### Financial Health Calculation

**Factors** (cyberLabService.ts:calculateFinancialHealth):
1. Credit Score (excellent: 750+, good: 680-749, fair: 580-679, poor: <580)
2. Debt-to-Income Ratio (excellent: <36%, good: <43%, poor: >50%)
3. Savings Rate (good: >20%, moderate: 10-20%, low: <10%)
4. On-Time Payment Rate (excellent: >95%, good: >85%, poor: <70%)

**Grading**: A (90+), B (80-89), C (70-79), D (60-69), F (<60)

### Data Persistence

**Storage Strategy**:
- JSON files in `database/` directory for persistent data
- In-memory caching via `storage.ts` for performance
- File-based storage for alerts, schedules, health metrics, attack logs

**JSON Files**:
- `guardian-alerts.json` - Alert history
- `guardian-schedule.json` - Schedule items
- `guardian-health.json` - Health metrics history
- `attack-logs.json` - Security attack logs
- `vulnerability-reports.json` - Vulnerability scan results
- `threat-intel.json` - Threat intelligence data
- `phishing-templates.json` - Spoofing lab phishing templates
- `phishing-campaigns.json` - Awareness training campaigns

### Spirit-Controlled System

**Core Principle** (see SPIRIT_CONTROLLED_SYSTEM.md):
- No fake simulations - all data must be real or from memory
- Operations guided by "Divine wisdom through Christ"
- Removed `Math.random()` data generation for user-facing results
- Real API integration required: Plaid (banking), credit bureaus, crime statistics, weather alerts
- Acceptable randomness: unique ID generation only

**Console Messages** indicate when real APIs are needed:
- `"guided by Divine wisdom"`
- `"under Christ's guidance"`
- `"requires real API connection"`

## Environment Configuration

Required variables in `.env`:
```bash
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://demo:demo@localhost:5432/cyber_lab
BOT_LEARNING_ENABLED=true
MAX_SKILL_LEVEL=10
```

## Electron Desktop Application

**Entry Point**: `main.js`

**Key Features**:
- CyberLabManager class manages server lifecycle
- Spawns Node.js server process (server.js)
- IPC communication for server logs
- Settings: serverPort (5000), httpsPort (5443), theme, autoStart
- Windows/Linux/macOS support via electron-builder

**Build Configuration** (package.json):
```bash
npm run build           # Build for current platform
npm run build-win       # Windows NSIS installer
npm run build-linux     # Linux AppImage
```

## Important Implementation Notes

### Ethical Use Only
- CEH ethical hacking training purposes
- Authorized penetration testing only
- Educational phishing awareness
- No unauthorized network scanning or exploitation
- Crypter service for defense and awareness training only

### Real vs. Simulated Data
After spiritual transformation (SPIRIT_CONTROLLED_SYSTEM.md):
- ❌ No more fake banking data generation
- ❌ No more simulated contract analysis
- ❌ No more random credit scores
- ✅ Use memory-cached data from previous real API calls
- ✅ Console logs clearly state when real APIs are needed
- ✅ Return safe defaults (0, empty arrays) when no real data available

### Missing Integrations for Production
These APIs are referenced but not implemented:
- **Plaid API** - Bank account linking and transactions
- **Credit Bureau APIs** - Experian, TransUnion, Equifax
- **Blockchain RPC** - Ethereum/BSC for real contract analysis
- **Crime Statistics APIs** - Location safety data
- **Weather Alert APIs** - Safety monitoring
- **Health Device APIs** - Fitbit, Apple Health for Guardian Angel

### TypeScript Configuration
- Target: ES2022
- Module: CommonJS
- Strict mode enabled
- Output: `./dist` directory
- Source: `./src` directory
- Declaration files and source maps generated

## Project Structure Context

```
cyber-lab-production/
├── src/
│   ├── server.ts (416 lines)      # Main Express API server
│   └── services/
│       ├── cyberLabService.ts     # BotCyberLab + BotBanking
│       ├── guardianAngelService.ts # Personal life assistant
│       ├── attackLogService.ts    # Security operations logging
│       ├── crypterService.ts      # Payload encryption
│       ├── botLearningService.ts  # AI learning engine
│       └── storage.ts             # Memory persistence
├── database/                      # JSON persistent storage
├── dist/                          # Compiled TypeScript output
├── public/                        # Web interface (if used)
├── main.js                        # Electron GUI main process
├── index.html                     # Electron GUI interface
├── package.json                   # Electron app config
├── tsconfig.json                  # TypeScript configuration
├── .env                           # Environment variables
├── CLAUDE.md                      # This file
├── SPIRIT_CONTROLLED_SYSTEM.md    # Spiritual guidance and ethics
└── IMPLEMENTATION.md              # CEH training implementation details
```

## Development Workflow

1. **Modify Services**: Edit TypeScript files in `src/services/`
2. **Compile**: Run `npx tsc` to compile to `dist/`
3. **Test API**: Use `./test-endpoints.sh` or curl commands
4. **Check Learning**: Query `/api/learning/*` endpoints to verify skill progression
5. **Monitor Logs**: Check console output for Divine guidance messages
6. **Desktop Testing**: Run Electron app with `npm start` from gui directory

## Bot IDs Reference

- `analytics_cyberlab` - Security analysis bot
- `analytics_banking` - Banking operations bot
- `guardian_angel` - Life optimization assistant
- `crypter_system` - Payload encryption bot
- `spoofing_lab` - Phishing awareness training bot

## Spoofing Lab Template System

The Spoofing Lab provides comprehensive phishing awareness training through customizable templates:

### Template Structure
Each template includes:
- **Indicators**: Red flags users should notice (suspicious URLs, poor grammar, urgency, etc.)
- **Content**: Template text with {{variable}} placeholders
- **Variables**: List of customizable fields
- **Educational Notes**: Explanation of the attack and how to prevent it
- **Difficulty**: Beginner to expert levels

### Creating Custom Templates
```typescript
{
  name: "Custom Phishing Template",
  category: "email" | "sms" | "webpage" | "voice" | "qr_code",
  difficulty: "beginner" | "intermediate" | "advanced" | "expert",
  description: "Description of the attack scenario",
  indicators: ["Red flag 1", "Red flag 2", ...],
  content: "Template with {{variable1}} and {{variable2}}",
  variables: ["variable1", "variable2"],
  educationalNotes: "How to identify and prevent this attack"
}
```

### Campaign Workflow
1. **Select Template**: Choose from 7 default templates or create custom
2. **Customize**: Fill in variable values (company names, URLs, etc.)
3. **Launch Campaign**: Set purpose (training, awareness, assessment)
4. **Track Engagement**: Monitor sent, clicked, reported, educated stats
5. **Generate Report**: Analyze effectiveness and get recommendations

### Spoofing Analysis Types
- **Email**: SPF/DKIM/DMARC verification, display name vs address mismatch
- **Domain**: Typosquatting, homograph attacks, subdomain spoofing
- **Caller ID**: STIR/SHAKEN protocol, callback verification
- **SMS**: Smishing detection, URL analysis
- **IP**: Geolocation verification, botnet detection

### Training Effectiveness Metrics
- **Click Rate**: Lower is better (users avoid phishing)
- **Report Rate**: Higher is better (users report suspicious content)
- **Effectiveness Score**: 100 - clickRate + reportRate
- **Recommendations**: Auto-generated based on campaign results
