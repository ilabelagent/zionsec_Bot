from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(title="HSVE Agent Lite")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/lit/advice")
def advice(context: str = "clean"):
    if context.lower() == "clean":
        return {
            "chain": [
                "high-pass @ 60Hz",
                "de-ess 5-9kHz (mild)",
                "normalize to -14 LUFS",
                "true-peak ceiling -1dBFS",
            ]
        }
    return {"chain": ["analyze", "suggest profile", "apply"]}


@app.post("/lit/clean")
def lit_clean():
    return {"message": "Use /process on the main API to upload a file."}

