# Cyber Lab Production

A comprehensive cybersecurity and banking analytics platform with AI-powered bot learning capabilities.

## Features

### 🛡️ CyberLab (Security Analysis)
- **Smart Contract Scanner** - Detect vulnerabilities in blockchain contracts
- **Penetration Testing** - Simulate security assessments
- **Attack Simulation** - Test defense mechanisms
- **Wallet Audit** - Security analysis for crypto wallets
- **Phishing Detection** - Identify malicious URLs

### 🏦 Banking (Financial Analytics)
- **Account Linking** - Connect bank accounts
- **Balance Checking** - View account balances
- **ACH Transfers** - Initiate deposits and withdrawals
- **Transaction Analysis** - View and categorize transactions
- **Credit Scoring** - Check credit scores
- **Loan Qualification** - Analyze loan eligibility
- **Financial Health** - Comprehensive financial assessment

### 🧠 Bot Learning
- **Skill Progression** - Bots level up as they perform tasks
- **Execution History** - Track all bot activities
- **Memory System** - Bots remember past analyses

## Quick Start

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

The server will start on `http://localhost:3001`

### Development Mode

```bash
npm run dev
```

## Usage

### Web Interface

Open your browser and navigate to:
```
http://localhost:3001
```

You'll see three main tabs:

1. **🛡️ CyberLab** - All security analysis features
2. **🏦 Banking** - All banking and financial features
3. **🧠 Bot Learning** - View bot skills, executions, and memories

### Example Usage

#### Scan a Smart Contract
1. Go to CyberLab tab
2. Enter a contract address (e.g., `0x1234567890abcdef`)
3. Enter network (e.g., `ethereum`)
4. Click "Scan Contract"
5. View vulnerabilities, risk score, and recommendations

#### Check Phishing URL
1. Go to CyberLab tab
2. Find "Phishing Detection" card
3. Enter URL (e.g., `http://192.168.1.1/verify`)
4. Click "Check URL"
5. See phishing indicators and confidence score

#### Analyze Financial Health
1. Go to Banking tab
2. Find "Financial Health" card
3. Enter user ID
4. Click "Calculate Health"
5. View score, grade, factors, and recommendations

#### View Bot Learning Progress
1. Go to Bot Learning tab
2. Select a bot or view all
3. Click "Load Skills" to see skill levels
4. Click "Load Executions" for activity history
5. Click "Load Memories" to see stored data

## API Endpoints

### CyberLab Endpoints

```bash
POST /api/cyberlab/scan-contract
POST /api/cyberlab/penetration-test
POST /api/cyberlab/simulate-attack
POST /api/cyberlab/audit-wallet
POST /api/cyberlab/detect-phishing
```

### Banking Endpoints

```bash
POST /api/banking/link-account
GET  /api/banking/balance/:accountId
POST /api/banking/ach
GET  /api/banking/transactions/:accountId
GET  /api/banking/categorize/:accountId
GET  /api/banking/credit-score/:userId
POST /api/banking/loan-qualification
GET  /api/banking/financial-health/:userId
```

### Learning Endpoints

```bash
GET /api/learning/skills
GET /api/learning/executions
GET /api/learning/memories
```

## Testing

Run the test script to verify all endpoints:

```bash
./test-endpoints.sh
```

## Architecture

- **Backend**: Express.js + TypeScript
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Learning System**: In-memory bot skill progression
- **Storage**: In-memory data persistence

## Environment Variables

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://demo:demo@localhost:5432/cyber_lab
BOT_LEARNING_ENABLED=true
MAX_SKILL_LEVEL=10
```

## Project Structure

```
cyber-lab-production/
├── src/
│   ├── server.ts                    # Express server
│   └── services/
│       ├── cyberLabService.ts       # Core bot implementations
│       ├── botLearningService.ts    # Learning system
│       └── storage.ts               # Memory storage
├── public/
│   ├── index.html                   # Web interface
│   ├── styles.css                   # Styling
│   └── app.js                       # Frontend logic
├── dist/                            # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## Bot IDs

- `analytics_cyberlab` - Security analysis bot
- `analytics_banking` - Banking operations bot

## Skill Categories

- `security` - CyberLab security operations
- `banking` - Banking account operations
- `analytics` - Data analysis tasks
- `credit` - Credit scoring
- `lending` - Loan qualification

## License

ISC
