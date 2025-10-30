from __future__ import annotations

import io
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, Depends, Header, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from audiobot.processing.clean import clean_audio
from audiobot.config import SETTINGS
from audiobot.sync.gcs import upload_if_configured
from audiobot.sync.ipfs import pin_file

def _auth_dep(authorization: str | None = Header(default=None)):
    token = SETTINGS.bearer_token.strip()
    if not token or token == "change-me":
        return  # auth disabled by default token
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    incoming = authorization.split(" ", 1)[1].strip()
    if incoming != token:
        raise HTTPException(status_code=401, detail="Invalid token")


app = FastAPI(title="Holy Spirit Vocal Engine API", dependencies=[Depends(_auth_dep)])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process")
async def process(
    file: UploadFile = File(...),
    target_lufs: float = Form(-14.0),
    no_deess: bool = Form(False),
    download: bool = Form(True),
    to_gcs: bool = Form(False),
    to_ipfs: bool = Form(False),
):
    temp_in = Path("outputs/tmp_in.wav")
    temp_out = Path("outputs/tmp_out.wav")
    temp_in.parent.mkdir(parents=True, exist_ok=True)
    with open(temp_in, "wb") as f:
        f.write(await file.read())
    clean_audio(str(temp_in), str(temp_out), target_lufs=target_lufs, deess=not no_deess)
    meta = {}
    if to_gcs:
        gcs = upload_if_configured(str(temp_out))
        if gcs:
            meta["gcs"] = gcs
    if to_ipfs:
        ipfs = pin_file(str(temp_out))
        if ipfs:
            meta["ipfs"] = ipfs
    if download:
        data = temp_out.read_bytes()
        return StreamingResponse(io.BytesIO(data), media_type="audio/wav", headers={
            "Content-Disposition": f"attachment; filename=clean_{file.filename or 'audio.wav'}"
        })
    return JSONResponse({"ok": True, "path": str(temp_out), **({"meta": meta} if meta else {})})


@app.post("/batch")
async def batch(files: List[str], out_dir: Optional[str] = None, target_lufs: float = -14.0, no_deess: bool = False, to_gcs: bool = False, to_ipfs: bool = False):
    out = Path(out_dir or "outputs/batch")
    out.mkdir(parents=True, exist_ok=True)
    done = []
    for p in files:
        src = Path(p)
        dest = out / src.name
        try:
            clean_audio(str(src), str(dest), target_lufs=target_lufs, deess=not no_deess)
            entry: dict = {"path": str(dest)}
            if to_gcs:
                gcs = upload_if_configured(str(dest))
                if gcs:
                    entry["gcs"] = gcs
            if to_ipfs:
                ipfs = pin_file(str(dest))
                if ipfs:
                    entry["ipfs"] = ipfs
            done.append(entry)
        except Exception as e:
            done.append({"file": str(src), "error": str(e)})
    return {"outputs": done}


@app.post("/preset")
async def preset(name: str = Form(...), file: UploadFile = File(...)):
    dest = Path("presets") / f"{name}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(await file.read())
    return {"ok": True, "path": str(dest)}
