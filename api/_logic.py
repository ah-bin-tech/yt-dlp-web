"""Shared extraction logic for Vercel Python functions and local dev."""

from __future__ import annotations

from typing import Any

import yt_dlp
from fastapi import HTTPException
from pydantic import BaseModel, HttpUrl


class ExtractRequest(BaseModel):
    url: HttpUrl


class FormatItem(BaseModel):
    format_id: str | None = None
    ext: str | None = None
    resolution: str | None = None
    url: str
    vcodec: str | None = None
    acodec: str | None = None
    filesize_approx: int | None = None


class ExtractResponse(BaseModel):
    title: str | None = None
    thumbnail: str | None = None
    webpage_url: str | None = None
    formats: list[FormatItem]
    error: str | None = None


def _pick_resolution(f: dict[str, Any]) -> str | None:
    w, h = f.get("width"), f.get("height")
    if w and h:
        return f"{w}x{h}"
    res = f.get("resolution")
    if res and res != "audio only":
        return str(res)
    return None


def extract_info(url: str) -> ExtractResponse:
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "nocheckcertificate": True,
    }
    formats_out: list[FormatItem] = []

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    if not info:
        return ExtractResponse(formats=[], error="empty_info")

    title = info.get("title")
    thumbnail = info.get("thumbnail")
    webpage_url = info.get("webpage_url") or url

    raw_formats = info.get("formats") or []
    for f in raw_formats:
        direct = f.get("url")
        if not direct:
            continue
        formats_out.append(
            FormatItem(
                format_id=f.get("format_id"),
                ext=f.get("ext"),
                resolution=_pick_resolution(f),
                url=direct,
                vcodec=f.get("vcodec"),
                acodec=f.get("acodec"),
                filesize_approx=f.get("filesize") or f.get("filesize_approx"),
            )
        )

    if not formats_out and info.get("url"):
        formats_out.append(
            FormatItem(
                url=info["url"],
                ext=info.get("ext"),
                resolution=_pick_resolution(info),
                vcodec=info.get("vcodec"),
                acodec=info.get("acodec"),
            )
        )

    return ExtractResponse(
        title=title,
        thumbnail=thumbnail,
        webpage_url=webpage_url,
        formats=formats_out,
    )

