# ⚡ QUICK ACCESS GUIDE - Jesus Cartel & Cyber Lab

## 🎯 Fastest Way to Get Started

### 1️⃣ Start Jesus Cartel (Music Publishing)

```bash
cd /teamspace/studios/this_studio/jesus-cartel-production
npm install && npm start
```

**Access:** http://localhost:3000

---

### 2️⃣ Start Cyber Lab (Security Analysis)

```bash
cd /teamspace/studios/this_studio/cyber-lab-production
npm install && npm start
```

**Access:** http://localhost:3001

---

## 📍 Service Locations

| Service | Directory | Port |
|---------|-----------|------|
| **Jesus Cartel** | `/teamspace/studios/this_studio/jesus-cartel-production/` | 3000 |
| **Cyber Lab** | `/teamspace/studios/this_studio/cyber-lab-production/` | 3001 |

---

## 🔥 One-Line Start Commands

### Jesus Cartel
```bash
cd /teamspace/studios/this_studio/jesus-cartel-production && npm install && npm start
```

### Cyber Lab
```bash
cd /teamspace/studios/this_studio/cyber-lab-production && npm install && npm start
```

---

## 🧪 Quick Test

### Test Jesus Cartel
```bash
curl http://localhost:3000/health
```

Expected: `{"status":"healthy","service":"jesus-cartel",...}`

### Test Cyber Lab
```bash
curl -X POST http://localhost:3001/api/cyber-lab/scan-contract \
  -H "Content-Type: application/json" \
  -d '{"contractAddress":"0x123","network":"ethereum"}'
```

---

## 📚 Full Documentation

- **Deployment Guide:** `/teamspace/studios/this_studio/DEPLOYMENT_COMPLETE.md`
- **Jesus Cartel README:** `jesus-cartel-production/README.md`
- **Migration Docs:** `valifi/LIGHTNING_MIGRATION/`

---

## ✅ Status

Both services are:
- ✅ Deployed and configured
- ✅ Ready to start with `npm install && npm start`
- ✅ Running on separate ports (3000, 3001)
- ✅ Completely independent from Valifi

---

**That's it! You're ready to go!** 🚀
