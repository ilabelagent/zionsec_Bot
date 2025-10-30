# Jesus Cartel Production - Setup Guide
## Complete Music Publishing Platform with AI Video Generation

**Version:** 2.0 (Enhanced with Visualizer Integration)
**Last Updated:** 2025-10-30

---

## 🎯 What's New

This enhanced version adds:
- ✅ **Automated video generation** via ComfyUI integration
- ✅ **AI-powered visual prompt creation** from audio analysis
- ✅ **Video NFT minting** (ERC-1155)
- ✅ **Medley composer** for multi-song visualizers
- ✅ **Complete release packages** (Audio + Video + NFTs + Tokens)
- ✅ **Audio analysis** with librosa (tempo, energy, mood detection)

---

## 📋 Prerequisites

### Required
- **Node.js** 18+ and npm
- **Python** 3.10+
- **FFmpeg** (for audio/video processing)
- **PostgreSQL** (optional, uses in-memory DB by default)

### Optional (for Full Features)
- **ComfyUI instance** with GPU (16GB+ VRAM recommended)
- **IPFS node** (for decentralized storage)
- **Redis** (for background job queue)
- **AI Provider API key** (Anthropic, OpenAI, or Google)

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Install
```bash
cd jesus-cartel-production

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Build TypeScript
npm run build
```

### 2. Configure Environment
```bash
# Copy example config
cp .env.example .env

# Edit .env and set at minimum:
#  - ENCRYPTION_MASTER_KEY (generate with: openssl rand -hex 32)
#  - COMFYUI_URL (if you have ComfyUI running)
nano .env
```

### 3. Start the Server
```bash
npm start
```

Server runs on **http://localhost:3002**

---

## 🎨 ComfyUI Setup (For Video Generation)

### Option A: Use Existing ComfyUI Instance

If you already have ComfyUI running on another machine:

1. Set in `.env`:
```
COMFYUI_URL=http://192.168.1.100:8188
```

2. Test connection:
```bash
python3 -m audiobot.comfyui.client http://192.168.1.100:8188
```

### Option B: Install ComfyUI Locally

**Requirements:** GPU with 16GB+ VRAM

```bash
# Install ComfyUI
cd ..
git clone https://github.com/comfyanonymous/ComfyUI
cd ComfyUI
pip install -r requirements.txt

# Install required plugins
cd custom_nodes

# WanVideo (text-to-video)
git clone https://github.com/WanVideo/ComfyUI-WanVideo

# VideoHelperSuite
git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite

cd ../..

# Download models (WanVideo)
mkdir -p ComfyUI/models/wanvideo
# Download: wan2.1_i2v_480p_14B_bf16_Comfy-Org.safetensors
# Place in: ComfyUI/models/wanvideo/

# Download Flux model (or SD model)
# Place in: ComfyUI/models/checkpoints/

# Start ComfyUI
cd ComfyUI
python main.py
```

ComfyUI will run on **http://localhost:8188**

### Option C: Use Cloud GPU (RunPod, Vast.ai, etc.)

1. Deploy ComfyUI on cloud GPU instance
2. Get public URL (e.g., `https://xxx-8188.proxy.runpod.net`)
3. Set in `.env`:
```
COMFYUI_URL=https://xxx-8188.proxy.runpod.net
```

---

## 🤖 AI Provider Setup (Optional but Recommended)

For better visual prompt generation, configure an AI provider:

### Option 1: Anthropic Claude (Recommended)
```bash
# Get API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-xxxxx
AUDIOBOT_AI_PROVIDER=anthropic
AUDIOBOT_ANTHROPIC_MODEL=claude-3-5-sonnet-latest
```

### Option 2: OpenAI GPT
```bash
# Get API key from: https://platform.openai.com/
OPENAI_API_KEY=sk-xxxxx
AUDIOBOT_AI_PROVIDER=openai
AUDIOBOT_OPENAI_MODEL=gpt-4o-mini
```

### Option 3: Google Gemini
```bash
# Get API key from: https://aistudio.google.com/
GOOGLE_API_KEY=xxxxx
AUDIOBOT_AI_PROVIDER=gemini
AUDIOBOT_GEMINI_MODEL=gemini-1.5-flash
```

### Option 4: Heuristic (No AI, Free)
```bash
# Uses rule-based prompt generation (no API key needed)
AUDIOBOT_AI_PROVIDER=heuristic
```

---

## 💾 IPFS Setup (Optional, for NFT Storage)

### Local IPFS Node
```bash
# Install Kubo (IPFS)
wget https://dist.ipfs.tech/kubo/v0.22.0/kubo_v0.22.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.22.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh

# Initialize and start
ipfs init
ipfs daemon --enable-gc

# In .env:
IPFS_API=http://127.0.0.1:5001
IPFS_GATEWAY=https://ipfs.io
```

### Pinata or Infura (Managed IPFS)
```bash
# Use their API endpoints
IPFS_API=https://ipfs.infura.io:5001/api/v0
```

---

## 🎵 Usage Examples

### 1. Generate Music Video
```bash
curl -X POST http://localhost:3002/api/visualizer/generate \
  -F "audio=@song.wav" \
  -F "title=My Song" \
  -F "artist=My Artist" \
  -F "style=music_video"

# Response: { "job_id": "job_xxx", "status": "queued" }

# Check status:
curl http://localhost:3002/api/visualizer/status/job_xxx
```

### 2. Complete Release Package
```bash
curl -X POST http://localhost:3002/api/publish/complete-package \
  -F "audio=@song.wav" \
  -F "title=My Song" \
  -F "artist=My Artist" \
  -F "network=polygon" \
  -F "walletId=0x..." \
  -F "generateVideo=true" \
  -F "mintVideoNFT=true" \
  -F "createToken=true"

# Creates:
#  - Music video
#  - Audio NFT
#  - Video NFT
#  - Song token
#  - IPFS uploads
```

### 3. Create Medley
```bash
# Create config file
cat > medley_config.json << EOF
{
  "songs": [
    {"path": "song1.wav", "title": "First", "artist": "Artist A", "start": 0, "end": 180},
    {"path": "song2.wav", "title": "Second", "artist": "Artist B", "start": 0, "end": 180},
    {"path": "song3.wav", "title": "Third", "artist": "Artist C", "start": 0, "end": 180}
  ]
}
EOF

# Generate medley
python -m audiobot.medley.composer \
  --config medley_config.json \
  --output medley.mp4 \
  --comfyui http://localhost:8188 \
  --theme journey
```

### 4. Analyze Audio Only
```bash
python -m audiobot.ai.audio_analyzer song.wav
```

### 5. Generate Prompts Only
```bash
python -m audiobot.ai.audio_analyzer song.wav > analysis.json
python -m audiobot.ai.generate_prompts_cli analysis.json --style music_video
```

---

## 🌐 Available Endpoints

### Core Publishing
- `POST /api/publish/song` - Publish song with NFT
- `POST /api/wallet/create` - Create blockchain wallet
- `GET /api/releases/latest` - Get latest releases

### Enhanced Visualizer
- `POST /api/visualizer/generate` - Generate music video
- `GET /api/visualizer/status/:job_id` - Check generation status
- `GET /api/visualizer/jobs` - List all jobs
- `GET /api/visualizer/health` - Service health check

### Video NFTs
- `POST /api/nft/video/mint` - Mint video NFT
- `GET /api/nft/video/:network/:contract/:tokenId` - Get video NFT details

### Complete Packages
- `POST /api/publish/complete-package` - Full release package
- `POST /api/publish/quick` - Quick publish (audio + video)

### Admin
- `GET /admin/admin.html` - Admin dashboard
- `GET /admin/publishing.html` - Publishing interface
- `GET /admin/wallet.html` - Wallet manager

---

## 🔧 Configuration Reference

### Video Generation Settings

```bash
# In API requests:
{
  "width": 1024,        # Video width (default: 1024)
  "height": 1024,       # Video height (default: 1024)
  "frames": 120,        # Number of frames (default: 120 = 5s @ 24fps)
  "seed": -1,           # Random seed (-1 = random)
  "style": "music_video" # Style: music_video, visualizer, abstract
}
```

### Audio Processing

AudioBot automatically:
- Analyzes tempo, energy, brightness
- Detects mood and characteristics
- Extracts harmonic/percussive content
- Identifies dominant musical key

### Prompt Generation

Supports multiple styles:
- **music_video**: Narrative cinematic visuals
- **visualizer**: Abstract audio-reactive animations
- **lyric_video**: Text-focused with backgrounds
- **abstract**: Pure visual experimentation

---

## 📊 Performance Expectations

### Generation Times (on RTX 4090)
- Audio analysis: ~10-30s
- Prompt generation: ~2-5s (with AI) or instant (heuristic)
- Image generation (Flux): ~10-15s
- Video generation (WanVideo, 120 frames): ~5-10min
- **Total per song: ~10-15min**

### Resource Usage
- RAM: 8GB minimum, 16GB recommended
- GPU VRAM: 16GB minimum (for ComfyUI)
- Storage: ~1GB per song package
- Network: Depends on IPFS/blockchain usage

---

## 🐛 Troubleshooting

### ComfyUI Connection Failed
```bash
# Test connection
curl http://your-comfyui-url:8188/system_stats

# If fails, check:
#  1. ComfyUI is running
#  2. Firewall allows port 8188
#  3. URL in .env is correct
```

### Video Generation Timeout
```bash
# Increase timeout in visualizerService.ts:
max_wait: 1800  # 30 minutes

# Or check ComfyUI logs for errors
```

### IPFS Upload Fails
```bash
# Check IPFS daemon
ipfs swarm peers  # Should show connections

# Test upload
echo "test" | ipfs add
```

### NFT Minting Fails
```bash
# Check wallet has gas
# Check RPC URL is accessible
# Verify network name is correct (ethereum/polygon/bsc/arbitrum/optimism)
```

### Audio Analysis Error
```bash
# Install audio libraries
pip install librosa soundfile numpy

# Test
python -c "import librosa; print(librosa.__version__)"
```

---

## 📚 Project Structure

```
jesus-cartel-production/
├── audiobot/                 # Python audio processing
│   ├── ai/                   # AI modules
│   │   ├── audio_analyzer.py     # Audio analysis with librosa
│   │   ├── prompt_generator.py   # AI prompt generation
│   │   └── generate_prompts_cli.py
│   ├── comfyui/              # ComfyUI integration
│   │   ├── client.py             # ComfyUI Python client
│   │   └── generate_video.py    # Video generation CLI
│   ├── medley/               # Medley composer
│   │   └── composer.py
│   └── skills/               # Audio processing skills
├── src/                      # TypeScript backend
│   ├── services/
│   │   ├── visualizerService.ts  # Video generation orchestration
│   │   ├── videoNFTService.ts    # Video NFT minting
│   │   └── jesusCartelService.ts # Core publishing
│   ├── routes.ts             # Main API routes
│   └── routes-enhanced.ts    # Enhanced visualizer routes
├── web/                      # Web interfaces
│   ├── admin/                # Admin dashboards
│   └── static/               # Public website
└── shared/                   # Shared assets
```

---

## 🎓 Learning Resources

- [ComfyUI Documentation](https://comfyui.org/docs)
- [WanVideo Tutorial](https://comfyui.org/en/create-stunning-animated-videos-with-flux1-and-wanvideo)
- [Librosa Audio Analysis](https://librosa.org/doc/latest/tutorial.html)
- [ERC-1155 Multi-Token Standard](https://eips.ethereum.org/EIPS/eip-1155)

---

## 🤝 Support

For issues or questions:
1. Check this setup guide
2. Review `ENHANCEMENT_INTEGRATION_PLAN.md`
3. Check logs: `logs/` directory
4. Create issue in repository

---

## 📜 License

MIT License - See LICENSE file

---

**Happy Creating! 🎵🎬**
