"""FastAPI service: extract video direct URLs via yt-dlp.

This module is kept for local dev / compatibility. On Vercel, prefer file-based
functions in ``api/extract.py`` and ``api/health.py``.
"""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ._logic import ExtractRequest, ExtractResponse, extract_info

app = FastAPI(title="yt-dlp-web API", version="1.0.0")

_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")
_origins = [o.strip() for o in _origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _extract(url: str) -> ExtractResponse:
    return extract_info(url)


@app.get("/health")
@app.get("/api/health")
@app.get("/api/main/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/extract", response_model=ExtractResponse)
@app.post("/api/extract", response_model=ExtractResponse)
@app.post("/api/main/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest) -> ExtractResponse:
    """Multiple paths: local uvicorn, Vercel rewrites, and python entry ``api/main``."""
    return _extract(str(req.url))
