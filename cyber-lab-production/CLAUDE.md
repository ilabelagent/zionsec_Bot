# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based cybersecurity and banking analytics system that simulates intelligent bots with learning capabilities. The system provides two main bot classes:
- **BotCyberLab**: Security analysis, contract scanning, penetration testing, and threat detection
- **BotBanking**: Banking operations, financial health analysis, loan qualification, and transaction management

## Development Commands

### Build and Compile
```bash
# Compile TypeScript to JavaScript
npx tsc

# Output will be in ./dist directory
```

### Type Checking
```bash
# Check for TypeScript errors without compiling
npx tsc --noEmit
```

### Running the Application
```bash
# Run compiled JavaScript
node dist/services/cyberLabService.js

# Or run TypeScript directly with ts-node
npx ts-node src/services/cyberLabService.ts
```

## Architecture

### Core Service Structure

The main service file is `src/services/cyberLabService.ts` which contains two exported classes:

1. **BotCyberLab** (`botId: "analytics_cyberlab"`)
   - Smart contract vulnerability scanning with pattern analysis
   - Penetration testing simulation
   - Attack simulation and mitigation recommendations
   - Wallet security auditing
   - Phishing detection

2. **BotBanking** (`botId: "analytics_banking"`)
   - Bank account linking and management
   - Balance checking with memory persistence
   - ACH transfer initiation
   - Transaction categorization and analysis
   - Credit score assessment
   - Loan qualification analysis
   - Financial health scoring

### Bot Learning System

Both bot classes integrate with external services (not defined in this repo):
- `botLearningService`: Handles skill progression, execution learning, and memory updates
  - `learnFromExecution()`: Records execution results and success/failure
  - `progressBotSkill()`: Increases skill levels based on task completion
  - `updateBotMemory()`: Stores contextual data with importance scores

- `storage`: Provides memory persistence
  - `getTradingSystemMemory()`: Retrieves stored memories by botId

### Memory and Learning Pattern

The bots use a memory-based learning approach:
- Contract patterns are cached in memory to avoid re-analysis
- Bank balances are stored and updated with small variances
- Loan analyses are persisted with qualification metadata
- Each action progressively increases bot skill levels in specific categories (e.g., "security", "banking", "analytics", "lending")

### Smart Contract Vulnerability Detection

The contract scanner checks for common vulnerabilities:
- Reentrancy attacks (checks for external calls without guards)
- Integer overflow (arithmetic without SafeMath)
- Unchecked external calls
- Access control issues
- Gas optimization problems
- Timestamp dependence
- Tx.origin usage

Risk scoring: Critical (40 pts), High (25 pts), Medium (15 pts), Low (5 pts), capped at 100.

### Financial Health Calculation

The banking bot evaluates financial health based on:
- Credit score (excellent: 750+, good: 680+)
- Debt-to-income ratio (acceptable: <43%)
- Savings rate
- Payment history

Grading system: A (90+), B (80-89), C (70-79), D (60-69), F (<60)

## Environment Configuration

The `.env` file contains:
```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://demo:demo@localhost:5432/cyber_lab
BOT_LEARNING_ENABLED=true
MAX_SKILL_LEVEL=10
```

## Important Implementation Notes

### Missing Dependencies
The codebase references two external services that are not defined in this repository:
- `botLearningService` - must be imported or implemented
- `storage` - must be imported or implemented

These are likely provided by a parent system or need to be implemented separately.

### Incomplete Methods
The `BotBanking.categorizeTransaction(i: number)` method is referenced but not defined in the visible code. This helper method needs to be implemented to return transaction category strings.

### Data Persistence
- The system assumes a PostgreSQL database at the configured `DATABASE_URL`
- Bot memories are stored with types like "security", "banking", "lending"
- Memory keys follow patterns like `contract_${address}`, `balance_${accountId}`, `loan_analysis_${userId}`

## TypeScript Configuration

- Target: ES2022
- Module: CommonJS
- Strict mode enabled
- Source maps and declarations generated
- Output directory: `./dist`
- Source directory: `./src`
