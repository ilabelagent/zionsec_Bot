#!/usr/bin/env bash
set -euo pipefail

# Minimal watcher: resolve IPNS → new CIDs → pull via ipfs get → push WAV to GCS → publish Pub/Sub

: "${TEAMSPACE_DIR:=/teamspace/studios/this_studio/jesus-cartel-production}"
: "${IPNS_NAME:=}"                 # e.g., k51qzi5uqu5d...
: "${INCOMING_BUCKET:=}"           # e.g., gs://hsve-incoming
: "${PUBSUB_TOPIC:=hsve-new-wav}"

SEEN_DB="$TEAMSPACE_DIR/data/hsve_seen.txt"
TMP_DIR="$TEAMSPACE_DIR/data/hsve_tmp"
mkdir -p "$(dirname "$SEEN_DB")" "$TMP_DIR"

if [ -z "$IPNS_NAME" ] || [ -z "$INCOMING_BUCKET" ]; then
  echo "[watch] IPNS_NAME and INCOMING_BUCKET required" >&2
  exit 0
fi

DIR_CID=$(ipfs resolve "/ipns/$IPNS_NAME" | sed 's#^/ipfs/##')
ipfs ls "$DIR_CID" | awk '{print $2}' | while read -r FILE_CID; do
  grep -q "$FILE_CID" "$SEEN_DB" 2>/dev/null && continue
  echo "[watch] New CID: $FILE_CID"
  rm -rf "$TMP_DIR/file" && mkdir -p "$TMP_DIR/file"
  ipfs get -o "$TMP_DIR/file" "$FILE_CID"
  WAV=$(find "$TMP_DIR/file" -type f -iname '*.wav' | head -n1 || true)
  if [ -n "$WAV" ]; then
    gsutil cp "$WAV" "$INCOMING_BUCKET/"
    echo "$FILE_CID" >> "$SEEN_DB"
    NAME=$(basename "$WAV")
    gcloud pubsub topics publish "$PUBSUB_TOPIC" --message "{\"cid\":\"$FILE_CID\",\"name\":\"$NAME\"}"
  fi
done

