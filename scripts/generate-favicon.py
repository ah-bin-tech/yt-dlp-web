"""Generate ``src/app/favicon.ico``. Requires: pip install Pillow."""

from pathlib import Path

from PIL import Image, ImageDraw


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pad = max(1, size // 16)
    draw.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=max(2, size // 5),
        fill=(24, 24, 27, 255),
    )
    cx, cy = size // 2, size // 2
    tri = max(2, size // 4)
    pts = [(cx - tri // 2, cy - tri), (cx - tri // 2, cy + tri), (cx + tri, cy)]
    draw.polygon(pts, fill=(250, 250, 250, 255))
    r = max(1, size // 16)
    draw.ellipse(
        [size - 3 * pad - 2 * r, pad + r, size - pad - r, pad + 3 * r],
        fill=(59, 130, 246, 255),
    )
    return img


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out = root / "src" / "app" / "favicon.ico"
    i48, i32, i16 = draw_icon(48), draw_icon(32), draw_icon(16)
    i48.save(
        out,
        format="ICO",
        sizes=[(48, 48), (32, 32), (16, 16)],
        append_images=[i32, i16],
    )
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
