# Jesus Cartel UI - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Server

```bash
npm install
npm run build
npm start
```

Server will run on: **http://localhost:3002**

---

## 📱 Available Interfaces

### Public Website
**URL:** http://localhost:3002/ (or http://localhost:3002/index.html)

Browse music releases and events. Perfect for end users.

### Admin Dashboard
**URL:** http://localhost:3002/admin/admin.html

Monitor system status, view stats, access quick actions.

### Publishing Dashboard
**URL:** http://localhost:3002/admin/publishing.html

Publish songs to blockchain with NFTs and tokens.

### Wallet Manager
**URL:** http://localhost:3002/admin/wallet.html

Create wallets, import wallets, check balances, send transactions.

---

## 🎯 Common Tasks

### Task 1: Create a Wallet

1. Go to: http://localhost:3002/admin/wallet.html
2. Enter a User ID (e.g., "user-123")
3. Select Network (Polygon recommended)
4. Click "Create Wallet"
5. **IMPORTANT:** Copy and save the mnemonic phrase securely!
6. Copy the wallet address

### Task 2: Publish a Song

1. Go to: http://localhost:3002/admin/publishing.html
2. Fill in song details:
   - Song ID: `song-001`
   - Title: `My First Song`
   - Artist: `Your Name`
3. Select network (Polygon)
4. Keep NFT and Token enabled
5. Enter token supply: `1000000`
6. Enter your wallet ID from Task 1
7. Review and click "Publish to Blockchain"
8. Wait for confirmation
9. Copy NFT and Token contract addresses

### Task 3: View Releases

1. Go to: http://localhost:3002/
2. Scroll to "Latest Releases"
3. Use filter tabs: All / Featured / Latest
4. Click any release for details
5. Like or play releases

### Task 4: Check Wallet Balance

1. Go to: http://localhost:3002/admin/wallet.html
2. Click "Check Balance" tab
3. Enter wallet address
4. Select network
5. Click "Check Balance"
6. View balance

### Task 5: Send Transaction

1. Go to: http://localhost:3002/admin/wallet.html
2. Click "Send Transaction" tab
3. Enter private key
4. Enter recipient address
5. Enter amount (e.g., 0.001)
6. Select network
7. Confirm and send
8. View transaction hash

---

## 🎨 UI Features

### Public Website Features
✅ Responsive design (mobile, tablet, desktop)
✅ Filter releases by category
✅ View release details in modal
✅ Like releases
✅ Track streams
✅ Browse events
✅ Modern gradient design

### Admin Dashboard Features
✅ Real-time system stats
✅ Network status
✅ API endpoint list
✅ Activity log
✅ Auto-refresh (5s)
✅ Quick action buttons

### Publishing Dashboard Features
✅ 4-step wizard
✅ Progress indicator
✅ Network selection
✅ NFT minting option
✅ Token creation option
✅ Loading animations
✅ Result display

### Wallet Manager Features
✅ Create new wallets
✅ Import from mnemonic
✅ Import from private key
✅ Check balances
✅ Send transactions
✅ Copy-to-clipboard
✅ Security warnings

---

## 🌐 Supported Networks

All UIs support these networks:

- **Ethereum** (ETH)
- **Polygon** (MATIC) ⭐ Recommended
- **BSC** (BNB)
- **Arbitrum** (ETH)
- **Optimism** (ETH)

---

## 🔒 Security Reminders

⚠️ **Important:**
- Never share private keys
- Save mnemonic phrases securely offline
- Use testnet for development
- Transactions are irreversible
- Always verify addresses before sending

---

## 📊 API Endpoints

Test endpoints:

```bash
# Get API info
curl http://localhost:3002/api

# Health check
curl http://localhost:3002/health

# Get releases
curl http://localhost:3002/api/releases/latest

# Get events
curl http://localhost:3002/api/events/upcoming

# Get networks
curl http://localhost:3002/api/networks
```

---

## 🐛 Troubleshooting

**Server won't start?**
```bash
# Kill existing process
kill $(lsof -ti:3002)
# or
pkill -f "node.*index.js"

# Restart
npm start
```

**UI not loading?**
- Check browser console (F12)
- Verify server is running
- Try incognito/private mode
- Clear browser cache

**API errors?**
- Check `.env` file exists
- Verify `ENCRYPTION_MASTER_KEY` is set
- Check network connectivity
- Review server logs

---

## 📖 Full Documentation

For detailed documentation, see: `UI_DOCUMENTATION.md`

---

## 🎉 You're Ready!

Open http://localhost:3002 and start exploring!

**Pro Tip:** Start with creating a wallet, then publish a test song to see the full workflow.

---

**Questions?** Check the main README.md or UI_DOCUMENTATION.md
