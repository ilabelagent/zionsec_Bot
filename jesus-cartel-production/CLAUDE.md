# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jesus Cartel Production is a hybrid TypeScript/Python music publishing platform that combines blockchain NFT minting, AI-powered video generation, and professional audio processing. The system automates the complete music release pipeline from audio upload through NFT/token creation and music video generation.

## Tech Stack

**Backend (TypeScript/Node.js)**
- Express.js API server
- Drizzle ORM for database operations
- Ethers.js for blockchain interactions
- Multi-chain support (Ethereum, Polygon, BSC, Arbitrum, Optimism)

**Audio Processing (Python)**
- librosa for audio analysis
- FFmpeg for audio/video processing
- Demucs for stem separation
- ComfyUI integration for video generation

**Database**
- PostgreSQL (production) or in-memory SQLite (development)
- Drizzle-kit for schema management

## Build and Development Commands

### TypeScript Backend

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Development mode with hot reload
npm run dev

# Production start
npm start
```

### Python AudioBot

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install as editable package
pip install -e .

# Run audio analysis
python -m audiobot.ai.audio_analyzer path/to/audio.wav

# Generate video prompts
python -m audiobot.ai.generate_prompts_cli analysis.json --style music_video

# Generate video via ComfyUI
python -m audiobot.comfyui.generate_video --audio song.wav --comfyui http://localhost:8188
```

### Database Management

```bash
# Push schema changes to database
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Testing

There are no automated tests in this codebase currently. When adding tests, follow these patterns:

```bash
# Run audio analysis test
python -m audiobot.ai.audio_analyzer test/fixtures/sample.wav

# Test ComfyUI connection
python -m audiobot.comfyui.client http://localhost:8188
```

## Architecture Overview

### Dual Runtime System

The platform operates as a **TypeScript backend** (Express.js) that orchestrates **Python workers** (AudioBot) via subprocess calls and API bridges. This separation allows:

- TypeScript handles web APIs, blockchain transactions, and database operations
- Python handles CPU/GPU-intensive audio analysis and video generation
- Services communicate through JSON over stdout/stdin or REST endpoints

### Key Service Layers

**1. Publishing Pipeline (TypeScript)**
- `jesusCartelService.ts` - Core music publishing, NFT minting, token creation
- `videoNFTService.ts` - ERC-1155 video NFT minting
- `web3Service.ts` - Multi-chain blockchain interactions
- `visualizerService.ts` - Orchestrates Python audiobot for video generation

**2. Audio Processing (Python)**
- `audiobot/ai/audio_analyzer.py` - Extract tempo, energy, mood, harmonic content
- `audiobot/ai/prompt_generator.py` - Map audio features to visual prompts (AI or heuristic)
- `audiobot/comfyui/client.py` - ComfyUI API client for image/video generation
- `audiobot/medley/composer.py` - Multi-song medley video creator

**3. Video Generation Flow**

```
Audio Upload → librosa Analysis → Prompt Generation (AI/Heuristic)
  → ComfyUI Workflow (Flux → WanVideo) → Video Output → Optional NFT Minting
```

The visualizer service (`visualizerService.ts`) manages job queuing and calls Python scripts. Jobs are tracked in `jobs` Map with states: queued → processing → completed/failed.

### Database Schema

The schema is defined in `src/database/db.ts` using Drizzle ORM:

- **wallets** - Encrypted wallet storage (mnemonic, private key, addresses)
- **releases** - Song releases with NFT contract addresses
- **events** - Music events
- **transactions** - Blockchain transaction records
- **songTokens** - ERC-20 tokens created for songs
- **videoNFTs** - ERC-1155 video NFT records

All wallet data is encrypted using AES-256-GCM via `encryptionService.ts`. The `ENCRYPTION_MASTER_KEY` environment variable must be set.

### Multi-Chain Support

Blockchain operations in `web3Service.ts` support 5 networks through RPC URLs configured in `.env`:

- Ethereum (ETHEREUM_RPC_URL)
- Polygon (POLYGON_RPC_URL)
- Binance Smart Chain (BSC_RPC_URL)
- Arbitrum (ARBITRUM_RPC_URL)
- Optimism (OPTIMISM_RPC_URL)

NFT contracts are deployed dynamically per song. The service uses ethers.js to compile and deploy Solidity contracts defined inline.

## Critical Environment Variables

```bash
# Required for basic operation
ENCRYPTION_MASTER_KEY      # Generate: openssl rand -hex 32
PORT                       # Default: 3002

# Required for blockchain features
ETHEREUM_RPC_URL          # Any of the 5 chain RPC URLs
POLYGON_RPC_URL
BSC_RPC_URL
ARBITRUM_RPC_URL
OPTIMISM_RPC_URL

# Required for video generation
COMFYUI_URL               # e.g., http://localhost:8188

# AI provider for prompt generation (choose one)
AUDIOBOT_AI_PROVIDER      # anthropic, openai, gemini, or heuristic
ANTHROPIC_API_KEY         # If using anthropic
OPENAI_API_KEY           # If using openai
GOOGLE_API_KEY           # If using gemini

# Optional
DATABASE_URL              # Falls back to in-memory SQLite
IPFS_API                 # For decentralized storage
REDIS_URL                # For background job queue
```

## Common Development Workflows

### Publishing a Song with Video

```bash
# Complete package: audio NFT + video + video NFT + token
curl -X POST http://localhost:3002/api/publish/complete-package \
  -F "audio=@song.wav" \
  -F "title=Song Title" \
  -F "artist=Artist Name" \
  -F "network=polygon" \
  -F "walletId=0x..." \
  -F "generateVideo=true" \
  -F "mintVideoNFT=true" \
  -F "createToken=true"
```

### Generating Video Only

```bash
curl -X POST http://localhost:3002/api/visualizer/generate \
  -F "audio=@song.wav" \
  -F "title=Song Title" \
  -F "artist=Artist Name" \
  -F "style=music_video"
```

### Creating a Medley

```bash
# Create config file with multiple songs
python -m audiobot.medley.composer \
  --config medley_config.json \
  --output medley.mp4 \
  --comfyui http://localhost:8188 \
  --theme journey
```

## Code Organization Principles

**Route Handlers** (`src/routes.ts`, `src/routes-enhanced.ts`)
- Thin controllers that validate input and delegate to services
- Return consistent JSON responses with `{ success, data, error }` structure

**Service Layer** (`src/services/`)
- Contains all business logic
- Services are stateless and can throw errors for error handling middleware
- Async operations return Promises

**Python Modules** (`audiobot/`)
- Organized by domain: `ai/`, `comfyui/`, `medley/`, `skills/`
- Each module is runnable with `python -m audiobot.module.name`
- Use argparse for CLI interfaces

**Shared Assets** (`shared/`)
- Static files served by Express
- Admin UI HTML files
- Audio and image assets

## External Dependencies

### ComfyUI Setup

The video generation features require a ComfyUI instance with:
- **WanVideo plugin** for text-to-video generation
- **VideoHelperSuite plugin** for video assembly
- **Flux or Stable Diffusion model** for image generation
- **16GB+ GPU VRAM** recommended

ComfyUI can run locally, on another machine (set COMFYUI_URL), or on cloud GPU services (RunPod, Vast.ai).

### IPFS (Optional)

For decentralized NFT storage, configure:
- Local IPFS daemon or
- Pinata/Infura hosted IPFS

Files are uploaded via `storage.ts` service.

## Performance Considerations

**Video Generation Times** (RTX 4090):
- Audio analysis: 10-30s
- AI prompt generation: 2-5s
- Image generation (Flux): 10-15s
- Video generation (WanVideo 120 frames): 5-10min
- **Total: ~10-15min per song**

**Resource Requirements**:
- Backend RAM: 8GB minimum
- ComfyUI GPU VRAM: 16GB minimum
- Storage: ~1GB per complete release package

**Job Queue**: The visualizer service uses an in-memory Map for job tracking. For production with multiple workers, consider migrating to Redis with a proper job queue (Bull, BullMQ).

## Blockchain Interaction Notes

- Gas estimation is automatic but may fail on some networks
- All wallet operations use AES-256-GCM encryption
- Private keys never leave the server unencrypted
- NFT metadata follows OpenSea standards
- ERC-20 tokens have 18 decimals by default
- Transaction hashes are stored for audit trail

## Audio Analysis Features

The `audio_analyzer.py` module extracts:
- **Tempo** (BPM) via beat tracking
- **Energy** level from RMS
- **Brightness** via spectral centroid
- **Harmonic/Percussive** content separation
- **Musical key** detection
- **Mood classification** (happy/sad/energetic/calm)

Results are JSON serialized for consumption by TypeScript services.

## Known Limitations

- No authentication/authorization system (add before production deployment)
- No automated test suite
- Job queue is in-memory (will not survive restarts)
- No rate limiting on API endpoints
- ComfyUI timeout is fixed at 30 minutes
- Database migrations must be managed manually via drizzle-kit

## Troubleshooting

**"ComfyUI connection failed"**
- Verify ComfyUI is running: `curl http://localhost:8188/system_stats`
- Check COMFYUI_URL in `.env`
- Ensure firewall allows port 8188

**"ENCRYPTION_MASTER_KEY not set"**
- Generate key: `openssl rand -hex 32`
- Add to `.env` file

**"Video generation timeout"**
- Increase timeout in `visualizerService.ts` (max_wait parameter)
- Check ComfyUI logs for VRAM issues
- Reduce frame count or resolution

**"Module not found" errors in Python**
- Install audiobot package: `pip install -e .`
- Verify all requirements: `pip install -r requirements.txt`

## Additional Documentation

- `SETUP.md` - Detailed setup instructions for all components
- `ENHANCEMENT_INTEGRATION_PLAN.md` - Architecture design and integration details
- `README-AudioToolkit.md` - AudioBot module documentation
- `.env.example` - Complete environment variable reference
