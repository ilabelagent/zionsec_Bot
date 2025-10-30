#!/usr/bin/env bash
set -euo pipefail

# Where the app lives on Lightning Teamspace
: "${TEAMSPACE_DIR:=/teamspace/studios/this_studio/jesus-cartel-production}"
: "${ENV_NAME:=audio}"
: "${CONDA_DIR:=$HOME/miniconda3}"

# Optional cloud env integration
: "${GCS_BUCKET:=}"
: "${GCS_PREFIX:=audiobot/outputs}"
: "${IPFS_API:=}"
: "${IPFS_GATEWAY:=https://ipfs.io}"

echo "[+] Creating Teamspace directories under $TEAMSPACE_DIR"
mkdir -p "$TEAMSPACE_DIR" "$TEAMSPACE_DIR/data" "$TEAMSPACE_DIR/logs"
chmod -R 775 "$TEAMSPACE_DIR"

echo "[+] Ensuring Miniconda at $CONDA_DIR and env $ENV_NAME"
if [ ! -d "$CONDA_DIR" ]; then
  curl -fsSL https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o /tmp/m.sh
  bash /tmp/m.sh -b -p "$CONDA_DIR"
fi
source "$CONDA_DIR/etc/profile.d/conda.sh"
conda activate || true
if ! conda env list | grep -q "^$ENV_NAME\\s"; then
  conda create -y -n "$ENV_NAME" python=3.12
fi
conda activate "$ENV_NAME"

echo "[+] Installing Python deps in $ENV_NAME"
pip install --upgrade pip
pip install fastapi uvicorn[standard] demucs litserve openai anthropic google-generativeai google-cloud-storage

echo "[+] Installing app (editable)"
cd "$TEAMSPACE_DIR"
if [ ! -f pyproject.toml ] && [ -d "$PWD/../.." ]; then
  echo "[!] pyproject.toml not found in $TEAMSPACE_DIR. Place the repo files here first."
  exit 1
fi
pip install -e .

echo "[+] Writing environment file $TEAMSPACE_DIR/.env (if not present)"
if [ ! -f "$TEAMSPACE_DIR/.env" ]; then
  cat > "$TEAMSPACE_DIR/.env" <<EOF
GCS_BUCKET=${GCS_BUCKET}
GCS_PREFIX=${GCS_PREFIX}
IPFS_API=${IPFS_API}
IPFS_GATEWAY=${IPFS_GATEWAY}
EOF
fi

echo "[+] Done. You can launch services with systemd (see cloud/lightning/systemd) or run manually:\n  uvicorn web.app:app --host 0.0.0.0 --port 8000\n  python -m audiobot serve-lit -H 0.0.0.0 -p 8080"

