"""Build the pictures for the live Satellites card on the About page (assets/study-cards.js) from the satellites page's own.

    python scripts/build_card_pictures.py        (needs Pillow, NumPy and CairoSVG: pip install pillow numpy cairosvg)

Writes to site/assets/about/:
  sat-sprites.webp       the 13 satellites on the ring, in launch order (RING below, the order of SATELLITES in
                         assets/satellites.js), each fitted into a 240 x 192 cell, 5 cells to a row
  earth-card.webp        NASA's Blue Marble with the cloud map laid on, 1024 x 512, as the satellites page's shader does
  earth-card-glint.webp  open water without cloud, where the sun glints, 512 x 256
  sat-sky.webp           the Milky Way photo, cover-fitted to 1280 x 800, with its stars redrawn from space-stars.bin

Run it again after adding, removing or reordering a satellite (and change RING in assets/study-cards.js to match),
then python scripts/stamp_assets.py.
"""
from pathlib import Path
import io
import struct

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SITE = Path(__file__).resolve().parents[1] / "site"
S = SITE / "assets" / "satellites"
OUT = SITE / "assets" / "about"
RING = ["terra.webp", "aqua.webp", "smos.webp", "gcom-w.webp", "landsat.webp", "gpm.webp", "sentinel-1.webp",
        "smap.webp", "sentinel-2.webp", "cygnss.webp", "iss.webp", "gosat-gw.svg", "nisar.webp"]
CW, CH = 240, 192


def picture(name):
    if name.endswith(".svg"):
        import cairosvg
        return Image.open(io.BytesIO(cairosvg.svg2png(url=str(S / name), output_width=800))).convert("RGBA")
    return Image.open(S / name).convert("RGBA")


def sprites():
    sheet = Image.new("RGBA", (CW * 5, CH * 3), (0, 0, 0, 0))
    for k, name in enumerate(RING):
        im = picture(name)
        im = im.crop(im.split()[3].getbbox())
        sc = min(CW / im.width, CH / im.height)
        im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
        sheet.alpha_composite(im, ((k % 5) * CW + (CW - im.width) // 2, (k // 5) * CH + (CH - im.height) // 2))
    sheet.save(OUT / "sat-sprites.webp", "WEBP", quality=84, method=6)


def earth():
    size = (1024, 512)
    day = np.asarray(Image.open(S / "earth-day-4k.webp").convert("RGB").resize(size, Image.LANCZOS)).astype(np.float32)
    cl = np.asarray(Image.open(S / "earth-clouds.webp").convert("L").resize(size, Image.LANCZOS)).astype(np.float32)[..., None] / 255
    wa = np.asarray(Image.open(S / "earth-water.webp").convert("L").resize(size, Image.LANCZOS)).astype(np.float32) / 255
    col = day * (1 - cl * 0.92) + np.array([0.94, 0.95, 0.97]) * 255 * cl * 0.92
    Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(OUT / "earth-card.webp", "WEBP", quality=80, method=6)
    glint = Image.fromarray(np.clip(wa * (1 - cl[..., 0]) * 255, 0, 255).astype(np.uint8)).resize((512, 256), Image.LANCZOS)
    glint.save(OUT / "earth-card-glint.webp", "WEBP", quality=70, method=6)


def sky(W=1280, H=800, SS=2):
    g = Image.open(S / "space-glow.webp").convert("RGB")
    IW, IH = g.size
    sc = max(W / IW, H / IH)
    iw, ih = IW * sc, IH * sc
    ox, oy = (W - iw) / 2, (H - ih) / 2
    g = g.resize((round(iw), round(ih)), Image.LANCZOS).crop((round(-ox), round(-oy), round(-ox) + W, round(-oy) + H))
    big = g.resize((W * SS, H * SS), Image.BICUBIC).convert("RGBA")
    stars, halos = Image.new("RGBA", big.size), Image.new("RGBA", big.size)
    ds, dh = ImageDraw.Draw(stars), ImageDraw.Draw(halos)
    data = (S / "space-stars.bin").read_bytes()  # 8 bytes a star: x, y (of 65535 across the photo), brightness, colour
    for k in range(len(data) // 8):
        xs, ys, bn, r, gg, b = struct.unpack_from("<HHBBBB", data, k * 8)
        x, y = (ox + xs / 65535 * iw) * SS, (oy + ys / 65535 * ih) * SS
        if not (-8 < x < W * SS + 8 and -8 < y < H * SS + 8):
            continue
        bn /= 255
        rgb = (int(150 + r * .4), int(150 + gg * .4), int(150 + b * .4))
        rad, a = (0.28 + 0.95 * bn ** 1.25) * SS * 0.9, min(1, 0.12 + 0.95 * bn ** 0.8)
        if bn > 0.7:
            rr = rad * 4.5
            dh.ellipse((x - rr, y - rr, x + rr, y + rr), fill=rgb + (int(255 * 0.14 * bn),))
        ds.ellipse((x - rad, y - rad, x + rad, y + rad), fill=rgb + (int(255 * a),))
    big.alpha_composite(halos.filter(ImageFilter.GaussianBlur(3 * SS)))
    big.alpha_composite(stars)
    big.convert("RGB").resize((W, H), Image.LANCZOS).save(OUT / "sat-sky.webp", "WEBP", quality=82, method=6)


if __name__ == "__main__":
    sprites()
    earth()
    sky()
    for f in ("sat-sprites.webp", "earth-card.webp", "earth-card-glint.webp", "sat-sky.webp"):
        print(f, (OUT / f).stat().st_size, "bytes")
