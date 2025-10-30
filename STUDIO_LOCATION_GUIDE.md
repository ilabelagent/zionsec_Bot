# 📍 STUDIO LOCATION GUIDE - Lightning AI Teamspace

## 🎯 Current Studio Information

**Studio Name:** `this_studio`
**Full Path:** `/teamspace/studios/this_studio/`
**Owner:** `ilabeliman`
**Hostname:** `cs-01k7zf995rrn6p9a7jdrshxhcv`

---

## 🗺️ Teamspace Structure

```
/teamspace/                              ← Root of Lightning AI teamspace
│
├── studios/                             ← All studios live here
│   └── this_studio/                     ← YOUR CURRENT STUDIO
│       ├── valifi/                      ← Original Valifi platform
│       ├── jesus-cartel-production/     ← ✅ Jesus Cartel standalone
│       ├── cyber-lab-production/        ← ✅ Cyber Lab standalone
│       ├── start-jesus-cartel.sh        ← Startup script
│       ├── start-cyber-lab.sh           ← Startup script
│       ├── FINAL_HANDOFF.md            ← Handoff documentation
│       ├── DEPLOYMENT_COMPLETE.md       ← Deployment guide
│       └── QUICK_ACCESS_GUIDE.md        ← Quick start guide
│
├── jobs/                                ← Lightning AI job outputs
├── uploads/                             ← User uploads
└── gcs_connections/                     ← Cloud storage connections
```

---

## 🚀 How to Access Your Studio

### Option 1: Lightning AI Web Interface

1. **Go to Lightning AI Dashboard:**
   - Visit: https://lightning.ai/
   - Log in with your credentials

2. **Navigate to Studios:**
   - Click on "Studios" in the left sidebar
   - Look for studio named `this_studio`

3. **Open the Studio:**
   - Click on `this_studio` to open it
   - This will launch the studio environment

4. **Access Terminal:**
   - In the studio interface, find the terminal icon
   - Click to open a terminal session
   - You'll be in: `/teamspace/studios/this_studio/`

### Option 2: Direct Terminal Navigation

If you're already in a terminal session:

```bash
# Navigate to studio root
cd /teamspace/studios/this_studio/

# List all deployments
ls -la
```

### Option 3: SSH Access (If Configured)

If Lightning AI provides SSH access:

```bash
# SSH into your studio
ssh ilabeliman@cs-01k7zf995rrn6p9a7jdrshxhcv.lightning.ai

# Navigate to studio
cd /teamspace/studios/this_studio/
```

---

## 📂 Key Directories in Your Studio

### Jesus Cartel Production
```bash
Location: /teamspace/studios/this_studio/jesus-cartel-production/
Purpose:  Music publishing platform with blockchain NFT automation
Port:     3000
```

**Navigate:**
```bash
cd /teamspace/studios/this_studio/jesus-cartel-production/
```

**Contents:**
```
jesus-cartel-production/
├── src/
│   ├── index.ts                      ← Main entry point
│   └── services/
│       ├── jesusCartelService.ts     ← Publishing engine
│       ├── web3Service.ts            ← Blockchain operations
│       └── encryptionService.ts      ← Security & encryption
├── .env                              ← Environment config
├── package.json                      ← Dependencies
├── tsconfig.json                     ← TypeScript config
└── README.md                         ← Documentation
```

### Cyber Lab Production
```bash
Location: /teamspace/studios/this_studio/cyber-lab-production/
Purpose:  Security analysis platform with vulnerability scanning
Port:     3001
```

**Navigate:**
```bash
cd /teamspace/studios/this_studio/cyber-lab-production/
```

**Contents:**
```
cyber-lab-production/
├── src/
│   └── services/
│       └── cyberLabService.ts        ← Security engine
├── .env                              ← Environment config
└── tsconfig.json                     ← TypeScript config
```

### Valifi (Original Platform)
```bash
Location: /teamspace/studios/this_studio/valifi/
Purpose:  Original Valifi platform (where services were extracted from)
Port:     5000
```

**Navigate:**
```bash
cd /teamspace/studios/this_studio/valifi/
```

---

## 🔍 Quick Navigation Commands

### Find Your Current Location
```bash
pwd
# Output: /teamspace/studios/this_studio/valifi (or wherever you are)
```

### Go to Studio Root
```bash
cd /teamspace/studios/this_studio/
```

### List All Studios
```bash
ls -la /teamspace/studios/
```

### View Studio Structure
```bash
tree -L 2 /teamspace/studios/this_studio/
# or
find /teamspace/studios/this_studio/ -maxdepth 1 -type d
```

### Check Deployed Services
```bash
ls -la /teamspace/studios/this_studio/ | grep -E "(jesus|cyber)"
```

---

## 🌐 Accessing Services from Web

### Lightning AI Port Forwarding

Lightning AI automatically exposes ports from your studio:

1. **Start a service** (e.g., Jesus Cartel on port 3000)
2. **Lightning AI detects the port** and creates a public URL
3. **Access via Lightning AI interface:**
   - In studio, click on "Ports" tab
   - Find port 3000 (or 3001 for Cyber Lab)
   - Click the URL to access service

**Example URLs** (Lightning AI generates these):
```
Jesus Cartel: https://[studio-id]-3000.lightning.ai
Cyber Lab:    https://[studio-id]-3001.lightning.ai
```

### Local Access (Within Studio)

From terminal in the studio:
```bash
# Test Jesus Cartel
curl http://localhost:3000/health

# Test Cyber Lab
curl http://localhost:3001/api/cyber-lab/scan-contract \
  -X POST -H "Content-Type: application/json" \
  -d '{"contractAddress":"0x123","network":"ethereum"}'
```

---

## 📋 Studio Environment Information

**Operating System:** Linux (Ubuntu-based)
**User Account:** `ilabeliman`
**User ID:** 1000
**Groups:** sudo, docker
**Shell:** Bash

**Permissions:**
- ✅ Read/Write access to `/teamspace/studios/this_studio/`
- ✅ Sudo access (admin privileges)
- ✅ Docker access (container management)
- ❌ Cannot create new top-level studios (requires admin)

**Storage:**
- Studio files: `/teamspace/studios/this_studio/`
- User home: `/home/ilabeliman/` (limited use)
- Persistent storage: All `/teamspace/studios/` data persists

---

## 🚀 Quick Start from Studio

Once you're in the studio terminal:

### Start Jesus Cartel
```bash
cd /teamspace/studios/this_studio/
./start-jesus-cartel.sh
```

### Start Cyber Lab
```bash
cd /teamspace/studios/this_studio/
./start-cyber-lab.sh
```

### Start Both (in separate terminals)
```bash
# Terminal 1
/teamspace/studios/this_studio/start-jesus-cartel.sh

# Terminal 2
/teamspace/studios/this_studio/start-cyber-lab.sh
```

---

## 🔧 Troubleshooting Studio Access

### Can't Find the Studio?

**Check available studios:**
```bash
ls -la /teamspace/studios/
```

**Verify you're in the right place:**
```bash
pwd
# Should show: /teamspace/studios/this_studio/[subdirectory]
```

### Permission Denied?

**Check your user:**
```bash
whoami
# Should show: ilabeliman

id
# Should show: uid=1000(ilabeliman) gid=1000(ilabeliman)
```

**Check file permissions:**
```bash
ls -la /teamspace/studios/this_studio/
```

### Lost in Directories?

**Return to studio root:**
```bash
cd /teamspace/studios/this_studio/
```

**See current directory tree:**
```bash
find . -maxdepth 2 -type d | sort
```

---

## 📚 Additional Resources

**Documentation Files in Studio:**
- `FINAL_HANDOFF.md` - Complete deployment summary
- `DEPLOYMENT_COMPLETE.md` - Full deployment guide
- `QUICK_ACCESS_GUIDE.md` - Fast-start instructions
- `jesus-cartel-production/README.md` - Jesus Cartel docs

**External Resources:**
- Lightning AI Docs: https://lightning.ai/docs/
- Lightning AI Community: https://lightning.ai/community/

---

## ✅ Verification Checklist

Confirm your studio access:

- [ ] Can navigate to `/teamspace/studios/this_studio/`
- [ ] Can see `jesus-cartel-production/` directory
- [ ] Can see `cyber-lab-production/` directory
- [ ] Can execute startup scripts (`./start-*.sh`)
- [ ] Can read documentation files
- [ ] Terminal shows correct username (`ilabeliman`)
- [ ] Can create/edit files in studio directory

---

## 🎯 Studio Location Summary

**Your Studio:** `this_studio`
**Full Path:** `/teamspace/studios/this_studio/`
**Services Deployed:**
- Jesus Cartel → `/teamspace/studios/this_studio/jesus-cartel-production/`
- Cyber Lab → `/teamspace/studios/this_studio/cyber-lab-production/`

**Access Methods:**
1. Lightning AI web dashboard → Studios → `this_studio`
2. Terminal: `cd /teamspace/studios/this_studio/`
3. Startup scripts: `./start-jesus-cartel.sh` or `./start-cyber-lab.sh`

---

*Guide created: 2025-10-21*
*Studio: this_studio*
*Location: /teamspace/studios/this_studio/*
