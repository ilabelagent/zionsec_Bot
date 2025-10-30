from __future__ import annotations

import io
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, StreamingResponse

from audiobot.processing.clean import clean_audio

app = FastAPI(title="Holy Spirit Vocal Engine API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/process")
async def process(
    file: UploadFile = File(...),
    target_lufs: float = Form(-14.0),
    no_deess: bool = Form(False),
    download: bool = Form(True),
):
    temp_in = Path("outputs/tmp_in.wav")
    temp_out = Path("outputs/tmp_out.wav")
    temp_in.parent.mkdir(parents=True, exist_ok=True)
    with open(temp_in, "wb") as f:
        f.write(await file.read())
    clean_audio(str(temp_in), str(temp_out), target_lufs=target_lufs, deess=not no_deess)
    if download:
        data = temp_out.read_bytes()
        return StreamingResponse(io.BytesIO(data), media_type="audio/wav", headers={
            "Content-Disposition": f"attachment; filename=clean_{file.filename or 'audio.wav'}"
        })
    return JSONResponse({"ok": True, "path": str(temp_out)})


@app.post("/batch")
async def batch(files: List[str], out_dir: Optional[str] = None, target_lufs: float = -14.0, no_deess: bool = False):
    out = Path(out_dir or "outputs/batch")
    out.mkdir(parents=True, exist_ok=True)
    done = []
    for p in files:
        src = Path(p)
        dest = out / src.name
        try:
            clean_audio(str(src), str(dest), target_lufs=target_lufs, deess=not no_deess)
            done.append(str(dest))
        except Exception as e:
            done.append({"file": str(src), "error": str(e)})
    return {"outputs": done}


@app.post("/preset")
async def preset(name: str = Form(...), file: UploadFile = File(...)):
    dest = Path("presets") / f"{name}.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(await file.read())
    return {"ok": True, "path": str(dest)}

