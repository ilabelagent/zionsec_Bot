from __future__ import annotations

import os
from pathlib import Path
from typing import Optional


DEFAULT_CREDS = r"Z:\Projects\audiobot\peaceful-access-473817-v1-b6c23a77fab4.json"


def _resolve_creds_path() -> Optional[str]:
    p = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if p and Path(p).exists():
        return p
    # Fallback to provided path if present
    if Path(DEFAULT_CREDS).exists():
        return DEFAULT_CREDS
    return None


def _make_client():
    try:
        from google.cloud import storage  # type: ignore
    except Exception as e:
        return None
    creds_path = _resolve_creds_path()
    try:
        if creds_path:
            return storage.Client.from_service_account_json(creds_path)
        # will use ADC if configured
        return storage.Client()
    except Exception:
        return None


def maybe_upload(local_path: Path) -> Optional[str]:
    """Upload a file to GCS if GCS_BUCKET is configured.

    Returns the gs:// URL on success, else None.
    """
    bucket_name = os.getenv("GCS_BUCKET") or os.getenv("AUDIOBOT_GCS_BUCKET")
    if not bucket_name:
        return None
    prefix = os.getenv("GCS_PREFIX", "audiobot/outputs").strip("/")
    client = _make_client()
    if client is None:
        return None
    try:
        bucket = client.bucket(bucket_name)
        blob_name = f"{prefix}/{Path(local_path).name}" if prefix else Path(local_path).name
        blob = bucket.blob(blob_name)
        blob.upload_from_filename(str(local_path))
        return f"gs://{bucket_name}/{blob_name}"
    except Exception:
        return None

