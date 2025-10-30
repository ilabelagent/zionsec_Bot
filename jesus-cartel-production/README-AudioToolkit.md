# Audio Toolkit

This project includes quick scripts and a conservative FFmpeg chain to reduce sibilance, broadband noise, low-end rumble, and high-end hiss while preventing clipping.

## Tools installed (system-wide)
- FFmpeg (BtbN shared build): `ffmpeg`, `ffprobe`, `ffplay`
- SoX: `sox`
- Python 3.12 (for future processing needs)

If a fresh shell doesn’t recognize commands, open a new terminal so PATH updates apply.

## Scripts
- `scripts/clean-audio.ps1`
  - Usage: `powershell -ExecutionPolicy Bypass -File scripts/clean-audio.ps1 -Input path\to\file.wav [-Output out.wav]`
  - Options:
    - `-NoiseReduce` (default 12 dB)
    - `-NoiseFloor` (default -28 dB)
    - `-DeEssCenter` (0..1, default 0.25 ≈ 6 kHz at 48 kHz)
    - `-DeEssStrength` (0..2, default 1.2)
    - `-Highpass` Hz (default 70)
    - `-Lowpass` Hz (default 18000)
    - `-Limiter` (0..1, default 0.95)
    - `-KeepFloatPCM` to preserve float format

- `scripts/inspect-audio.ps1`
  - Usage: `powershell -ExecutionPolicy Bypass -File scripts/inspect-audio.ps1 -Input path\to\file.wav`
  - Shows codec, channels, sample rate, plus quick RMS/Peak via `astats`.

- `scripts/batch-clean.ps1`
  - Batch process a folder recursively or flat.
  - Usage (same options as clean):
    - `powershell -ExecutionPolicy Bypass -File scripts/batch-clean.ps1 -Root path\to\folder [-OutDir path\to\out] [-Recurse] [options...]`
  - If `-OutDir` is omitted, outputs `_clean.wav` next to each source.

## Default filter chain
```
-afftdn=nr=12:nf=-28:om=o,
-deesser=f=0.25:s=1.2,
-highpass=f=70,
-lowpass=f=18000,
-alimiter=limit=0.95
```
- Adjust `-DeEssCenter` up/down to target different sibilance areas.
- Raise/lower `-NoiseReduce` and `-NoiseFloor` to taste.

## Tips
- Always compare before/after for transparency.
- For strong hiss, try a slightly lower `-Lowpass` (e.g., 16000).
- For bass-heavy mixes, try `-Highpass 30` or disable with `-Highpass 0`.

## Conda environment
- Installed Miniconda at `C:\Users\Admin\miniconda3` with an environment `audio`.
- To activate in PowerShell:
  - `& C:\Users\Admin\miniconda3\condabin\conda.bat activate audio`
- To run a Python tool inside the env without activating:
  - `& C:\Users\Admin\miniconda3\condabin\conda.bat run -n audio python -V`
- Preinstalled packages: `numpy`, `scipy`, `numba`, `librosa`, `pysoundfile`, `audioread`, `pydub`, `tqdm`, and `noisereduce` via pip.

## Web Interface
- App files under `web/` (FastAPI + Jinja2). Static assets in `web/static`, templates in `web/templates`.
- Install web deps into the `audio` env:
  - `& C:\Users\Admin\miniconda3\condabin\conda.bat run -n audio python -m pip install fastapi uvicorn[standard] python-multipart jinja2`
- Run the server (binds to all interfaces for LAN access):
  - `powershell -ExecutionPolicy Bypass -File scripts\run-web.ps1 -Port 8000 -Host 0.0.0.0 -Bucket YOUR_BUCKET -Prefix audiobot/outputs`
- Open from any device on your network: `http://YOUR_PC_LAN_IP:8000/`
  - Find IP with `ipconfig` (look for IPv4 Address). Allow firewall when prompted.

### Presets and Progress
- Presets available in the UI: Music, Podcast, Aggressive (or Custom).
- A simple progress overlay appears during processing.

## Stem Separation
- CLI: `powershell -ExecutionPolicy Bypass -File scripts\separate-stems.ps1 -Input path\to\file.wav [-OutDir out] [-Model htdemucs] [-Stems 4|2] [-TwoStemsTarget vocals|drums|bass|other]`
- Web UI: use the "Stem Separation" form on the homepage.
- Requirements (already handled if you followed steps):
  - Install Demucs into the `audio` env: `& C:\Users\Admin\miniconda3\condabin\conda.bat run -n audio python -m pip install demucs`
  - First run downloads model weights (one-time, large download).

## Modular Bot (Standalone + Memory)
- Package: `audiobot` in this repo provides a modular, memory-backed bot with CLI and web serving hooks.
- Memory: SQLite at `data/audiobot.db` records jobs, metrics, and presets.

### CLI
- Clean:
  - `audiobot clean path\to\file.wav --use-recommend --learn`
  - Flags mirror the scripts (noise reduce/floor, de-ess, high/low-pass, limiter, keep-float)
- Separate:
  - `audiobot separate path\to\song.wav -s 4 -m htdemucs`
- Inspect:
  - `audiobot inspect path\to\file.wav`
- Presets:
  - Save: `audiobot preset save MyFav -f params.json`
  - List: `audiobot preset list`
  - Get: `audiobot preset get MyFav`
- Train (preference learning from JSONL):
  - `audiobot train training_data.jsonl`
  - Each line: `{ "context": "clean", "params": { "noise_reduce": 14, ... } }`
- Serve web:
  - `audiobot serve -H 0.0.0.0 -p 8000`

### LitServe Agents (Advice + Clean)
- Install optional SDKs in the `audio` env (already installed): `litserve`, `openai`, `anthropic`, `google-generativeai`.
- Run LitServe (falls back to FastAPI shim if LitServe module changes):
  - `audiobot serve-lit -H 0.0.0.0 -p 8080`
- Endpoints:
  - POST `/lit/advice` — body: `{ "context": "clean|podcast|music", "stats": {..}, "file_b64": "..." }` → suggested params
  - POST `/lit/clean` — body: `{ "file_b64": "...", "params": {..}, "keep_float": false }` → cleaned file as base64
- Configure providers via env:
  - `OPENAI_API_KEY` + `AUDIOBOT_OPENAI_MODEL` (default `gpt-4o-mini`)
  - `ANTHROPIC_API_KEY` + `AUDIOBOT_ANTHROPIC_MODEL` (default `claude-3-5-sonnet-latest`)
  - `GOOGLE_API_KEY` + `AUDIOBOT_GEMINI_MODEL` (default `gemini-1.5-flash`)
  - Choose provider: `AUDIOBOT_AI_PROVIDER=openai|anthropic|gemini|heuristic`

## Cloud Sync (GCS/Firebase)
- Auto-upload on success: When `GCS_BUCKET` is set, cleaned files and stems upload to `gs://$GCS_BUCKET/$GCS_PREFIX/`.
  - The app automatically uses the service key at `Z:\Projects\audiobot\peaceful-access-473817-v1-b6c23a77fab4.json` if present.
  - You can also set `GOOGLE_APPLICATION_CREDENTIALS` explicitly to your JSON key file.
  - Default prefix: `audiobot/outputs` (override via `GCS_PREFIX`).
- Start web with envs (Windows):
  - `powershell -ExecutionPolicy Bypass -File scripts\run-web.ps1 -Bucket YOUR_BUCKET -Prefix audiobot/outputs`
- Pull outputs locally (requires `gsutil` from Google Cloud SDK):
  - `powershell -ExecutionPolicy Bypass -File scripts\gcs-rsync-pull.ps1 -Bucket YOUR_BUCKET -Prefix audiobot/outputs -OutDir .\cloud-outputs`
- Firebase Storage: points to a GCS bucket, so use the same bucket name here.

## IPFS Publishing (optional)
- Set `IPFS_API` to your node API, e.g. `http://127.0.0.1:5001`.
- Optionally set `IPFS_GATEWAY` for view URLs (default `https://ipfs.io`).
- On success, the bot attaches `{ cid, url }` for cleaned files and each stem.
- Remote (Linux) quickstart:
  - Install Kubo (IPFS): https://docs.ipfs.tech/install/command-line/#install-kubo
  - `ipfs init && ipfs daemon --enable-gc --migrate=true`
  - Export `IPFS_API=http://127.0.0.1:5001` before running the app.

### Build and Run Standalone
- Build single-file exe in the conda env:
  - `powershell -ExecutionPolicy Bypass -File scripts\build-standalone.ps1`
- Result: `dist/audiobot.exe`
- Run: `dist\audiobot.exe clean path\to\file.wav`

### Training Notes
- The bot maintains running averages for numeric parameters per context (e.g., "clean").
- You can extend training by plugging in external models; the CLI’s `train` command ingests JSONL to update preferences.
