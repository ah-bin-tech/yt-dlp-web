"""Vercel function: GET /api/health"""

from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(title="yt-dlp-web Health", version="1.0.0")


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ok"}

