#!/bin/bash

###############################################################################
# Valifi Kingdom - Master Startup Script
# Starts ALL systems for complete platform orchestration
###############################################################################

set -e  # Exit on error

echo "🚀 Starting Valifi Kingdom Master Orchestration System"
echo "================================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo -e "${BLUE}Step 1: Environment Check${NC}"
echo "----------------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi
echo -e "${GREEN}✅ Node.js:${NC} $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found"
    exit 1
fi
echo -e "${GREEN}✅ Python:${NC} $(python3 --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo -e "${GREEN}✅ npm:${NC} $(npm --version)"

echo ""

echo -e "${BLUE}Step 2: Check Environment Variables${NC}"
echo "----------------------------------------"

# Check for .env file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/valifi"

# Encryption
MASTER_ENCRYPTION_KEY="your-master-encryption-key-32-chars"

# Telegram Bot
TELEGRAM_BOT_TOKEN="8092654579:AAEq30qgHM3ZnRwsH5i2hyZ6udzYWRDRUWw"
TELEGRAM_ADMIN_CHAT_ID=""

# Optional API Keys
ANTHROPIC_API_KEY=""
OPENAI_API_KEY=""
GOOGLE_GEMINI_API_KEY=""
EOF
    echo -e "${GREEN}✅ Created .env file${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Source environment
set -a
source .env
set +a

echo ""

echo -e "${BLUE}Step 3: Install Dependencies${NC}"
echo "----------------------------------------"

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Node.js dependencies installed${NC}"
fi

# Check Python dependencies
if [ -f "requirements.txt" ]; then
    echo "Checking Python dependencies..."
    pip3 list | grep -q litserve || pip3 install -r requirements.txt
    echo -e "${GREEN}✅ Python dependencies installed${NC}"
fi

echo ""

echo -e "${BLUE}Step 4: Start Python Agents${NC}"
echo "----------------------------------------"

# Check if Python agents are already running
if netstat -tuln 2>/dev/null | grep -q ':8001' || ss -tuln 2>/dev/null | grep -q ':8001'; then
    echo -e "${YELLOW}⚠️  Port 8001 already in use (Terminal Agent may be running)${NC}"
else
    if [ -f "deployment/start_agents.py" ]; then
        echo "Starting Python LitServe agents..."
        nohup python3 deployment/start_agents.py > logs/python_agents.log 2>&1 &
        PYTHON_PID=$!
        echo -e "${GREEN}✅ Python agents starting (PID: $PYTHON_PID)${NC}"
        sleep 3
    else
        echo -e "${YELLOW}⚠️  Python agent startup script not found${NC}"
    fi
fi

echo ""

echo -e "${BLUE}Step 5: Database Check${NC}"
echo "----------------------------------------"

# Check PostgreSQL connection
if command -v psql &> /dev/null; then
    if psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✅ Database connected${NC}"
    else
        echo -e "${YELLOW}⚠️  Cannot connect to database${NC}"
        echo "   Make sure PostgreSQL is running"
    fi
else
    echo -e "${YELLOW}⚠️  psql not found - skipping database check${NC}"
fi

echo ""

echo -e "${BLUE}Step 6: Start Main Platform${NC}"
echo "----------------------------------------"

# Workaround for dependency issues
npm install typescript
npm install tsx
npm install vite

echo "Starting Valifi Kingdom platform..."
echo ""
echo "================================================================"
echo "🌟 VALIFI KINGDOM - SUPREME ORCHESTRATION MODE 🌟"
echo "================================================================"
echo ""
echo "📱 Admin Panel:     http://localhost:5000/admin"
echo "🏠 Dashboard:       http://localhost:5000/dashboard"
echo "🐍 Terminal Agent:  http://localhost:8001"
echo "📚 SDK Agent:       http://localhost:8002"
echo ""
echo "Telegram Bot Commands:"
echo "  /initall      - Initialize all systems"
echo "  /godmode      - Natural language supreme control"
echo "  /orchestrate  - Multi-agent orchestration"
echo "  /workflow     - Execute multi-step workflows"
echo "  /help         - All commands"
echo ""
echo "Natural Language:"
echo "  Just type anything to the bot!"
echo "  Example: 'Check all wallet balances and start trading bots'"
echo ""
echo "================================================================"
echo ""

# Start the platform
NODE_ENV=development node_modules/.bin/tsx server/index.ts

# Cleanup on exit
trap 'echo "Shutting down..."; pkill -f start_agents.py; exit' INT TERM
