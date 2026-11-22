"""Mosaic textures for the home page's route cards (22 Nov 2026).

Owner, on the three cards under «Один шаг. Понятный маршрут.»: «слишком plain
white… добавить какие-то текстуры или узоров… чтобы было на что обратить
внимание… стильно». The cartouches on these cards are laid in the tesserae of
the floor of the Galleria Vittorio Emanuele II (cartouche-2026-11-19.json), so
each card becomes a panel of that floor: a ground of small cream tesserae laid
in slightly wavy rows, and a border of two ochre rows around a slate-blue one
(ochre and terracotta on the dark card), with a terracotta corner block, as in
the borders of Roman floors. The palette is sampled from the cartouches.

Run from the repository root: python3 design/illustrations/source/textures/mosaic-textures.py
Writes public/textures/mosaic-*.webp. Deterministic (fixed seeds).
"""
import math, random
from PIL import Image, ImageDraw

OUT = "public/textures"
SLATE, OCHRE, TERRA = (70, 98, 124), (226, 168, 58), (170, 58, 34)


def ground(name, base, spread, grout, W=384, rowh=12, seed=3, warm=1.3, sc=2, q=78):
    """A seamless square of tesserae; shown at half size (192px) for sharpness."""
    random.seed(seed); n = W // rowh
    big = Image.new("RGB", (W * sc, W * sc), grout); d = ImageDraw.Draw(big)
    amp = [random.uniform(.6, 1.4) for _ in range(n)]; ph = [random.uniform(0, 2 * math.pi) for _ in range(n)]
    wave = lambda r, x: amp[r % n] * math.sin(2 * math.pi * x / W + ph[r % n])
    for r in range(n):
        ws = []
        while sum(ws) < W: ws.append(random.uniform(9, 15))
        k = W / sum(ws); ws = [w * k for w in ws]; x = random.uniform(0, ws[0])
        for w in ws:
            g = random.uniform(1.4, 2.0); y0, y1 = r * rowh, (r + 1) * rowh
            pts = [(x + g / 2, y0 + wave(r, x) + g / 2), (x + w - g / 2, y0 + wave(r, x + w) + g / 2),
                   (x + w - g / 2, y1 + wave(r + 1, x + w) - g / 2), (x + g / 2, y1 + wave(r + 1, x) - g / 2)]
            pts = [(px + random.uniform(-.5, .5), py + random.uniform(-.5, .5)) for px, py in pts]
            kk = random.uniform(-spread, spread); t = random.uniform(-spread * .35, spread * .35)
            col = tuple(max(0, min(255, int(v))) for v in (base[0] + kk + t, base[1] + kk, base[2] + kk - t * warm))
            for dx in (-W, 0, W):
                for dy in (-W, 0, W):
                    d.polygon([((px + dx) * sc, (py + dy) * sc) for px, py in pts], fill=col)
            x += w
    big.resize((W, W), Image.LANCZOS).save(f"{OUT}/{name}.webp", quality=q, method=6)


def band(name, rows, W=192, H=12, sc=2, seed=9):
    """A seamless strip of the border, 12px tall, stored at twice the size; and its upright twin."""
    random.seed(seed)
    im = Image.new("RGBA", (W * sc, H * sc), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y0, h, col in rows:
        ws = []
        while sum(ws) < W: ws.append(random.uniform(4.5, 7.5))
        k = W / sum(ws); ws = [w * k for w in ws]; x = 0
        for w in ws:
            kk = random.uniform(-10, 10); c = tuple(max(0, min(255, int(v + kk))) for v in col) + (255,)
            for dx in (-W, 0, W):
                pts = [(x + .5 + dx, y0 + .5), (x + w - .5 + dx, y0 + .5), (x + w - .5 + dx, y0 + h - .5), (x + .5 + dx, y0 + h - .5)]
                d.polygon([(px * sc, py * sc) for px, py in pts], fill=c)
            x += w
    im.save(f"{OUT}/{name}-h.webp", lossless=True, method=6)
    im.rotate(90, expand=True).save(f"{OUT}/{name}-v.webp", lossless=True, method=6)


def corner(name, outer, inner, sc=2):
    """Four terracotta stones around an ochre one, 14px."""
    im = Image.new("RGBA", (14 * sc, 14 * sc), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for x, y in ((0, 0), (7, 0), (0, 7), (7, 7)):
        d.rectangle([(x + .5) * sc, (y + .5) * sc, (x + 6.5) * sc, (y + 6.5) * sc], fill=outer + (255,))
    d.rectangle([4.5 * sc, 4.5 * sc, 9.5 * sc, 9.5 * sc], fill=inner + (255,))
    im.save(f"{OUT}/{name}.webp", lossless=True, method=6)


ground("mosaic-ground", (251, 246, 237), 2.4, (238, 229, 215))
ground("mosaic-ground-dark", (44, 38, 34), 2.0, (33, 28, 25), seed=5, warm=.5)
band("mosaic-band", [(0, 3.2, OCHRE), (3.9, 4.6, SLATE), (9.2, 2.8, OCHRE)])
band("mosaic-band-dark", [(0, 3.2, OCHRE), (3.9, 4.6, TERRA), (9.2, 2.8, OCHRE)])
corner("mosaic-corner", TERRA, OCHRE)
