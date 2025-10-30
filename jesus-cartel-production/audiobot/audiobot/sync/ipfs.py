from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, Tuple

import requests


def ipfs_add(path: Path) -> Optional[Tuple[str, str]]:
    """Add a file to IPFS via HTTP API.

    Returns (cid, url) if successful, else None.
    Environment:
      IPFS_API: e.g., http://127.0.0.1:5001
      IPFS_GATEWAY (optional): public gateway to form a view URL, e.g., https://ipfs.io
    """
    api = os.getenv("IPFS_API")
    if not api:
        return None
    url = api.rstrip("/") + "/api/v0/add?pin=true&wrap-with-directory=false"
    try:
        with open(path, "rb") as f:
            files = {"file": (path.name, f)}
            resp = requests.post(url, files=files, timeout=60)
        resp.raise_for_status()
        data = resp.json() if resp.headers.get("content-type", "").startswith("application/json") else None
        if not data:
            # Fallback: parse last line as JSON
            lines = resp.text.strip().splitlines()
            import json as _json
            data = _json.loads(lines[-1])
        cid = data.get("Hash")
        if not cid:
            return None
        gw = os.getenv("IPFS_GATEWAY", "https://ipfs.io").rstrip("/")
        return cid, f"{gw}/ipfs/{cid}"
    except Exception:
        return None

