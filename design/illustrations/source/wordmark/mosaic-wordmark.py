"""The footer's «iItaly» laid in mosaic, in the cartouches' manner (22 Nov 2026).

Owner, on the first version (a brick-like texture seen through the letters):
«А че надпись кирпичная, сделай мозаичной в общем стиле тогда». In the
cartouches the stones follow the form (opus vermiculatum): rows of tesserae
run along every edge, a slate-blue outer row, an ochre one inside it, then
terracotta. This script lays the word the same way: the letters' distance
field gives rows parallel to the outline, stones are seeded along each row at
one stone's length, every pixel goes to its nearest seed, and the joints
between stones are left open so the paper shows through.

Face: Inter Tight 700, the wordmark's face where SF Pro Display is absent,
letter-spacing -0.055em. Needs numpy, scipy, opencv, Pillow and fontTools
(with brotli, to read the woff2 from the build).

Run from the repository root after `npm run build`:
  python3 design/illustrations/source/wordmark/mosaic-wordmark.py
Writes public/illustrations/footer-mark.svg (one path per colour). Deterministic.
"""
import glob, io, math, random
import numpy as np, cv2
from scipy import ndimage
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SLATE, OCHRE, TERRA = (70, 98, 124), (226, 168, 58), (176, 64, 42)
WORD, TRACK, OUT_W, SS = "iItaly", -0.055, 2432, 2   # SS: drawn at twice the largest size, then reduced
STONE = 17 * SS                                       # a stone's length at the drawing size (about 8.5 CSS px)

def face():
    for path in glob.glob("out/_next/static/media/*.woff2"):
        font = TTFont(path)
        cmap = font.getBestCmap() or {}
        if "Inter Tight" in font["name"].getDebugName(1) and all(ord(c) in cmap for c in WORD):
            font = instancer.instantiateVariableFont(font, {"wght": 700})
            font.flavor = None; buf = io.BytesIO(); font.save(buf); buf.seek(0)
            return buf
    raise SystemExit("Inter Tight with the word's letters not found: run npm run build first")

def mask():
    data = face().getvalue()
    size = 1000
    font = ImageFont.truetype(io.BytesIO(data), size)
    width = sum(font.getlength(c) for c in WORD) + TRACK * size * (len(WORD) - 1)
    size = int(size * (OUT_W * SS - 8 * SS) / width)   # the word fills the width
    font = ImageFont.truetype(io.BytesIO(data), size)
    asc, desc = font.getmetrics()
    W = OUT_W * SS; H = asc + desc + 8 * SS
    im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im); x = 4 * SS
    for c in WORD:
        d.text((x, 4 * SS), c, font=font, fill=255)
        x += font.getlength(c) + TRACK * size
    m = np.array(im) > 127
    rows = np.where(m.any(1))[0]
    return m[max(0, rows[0] - 4 * SS): rows[-1] + 4 * SS + 1]

def lay(m):
    random.seed(11); rng = np.random.default_rng(11)
    dist = ndimage.distance_transform_edt(m)
    seeds = np.zeros(m.shape, np.int32); n = 0; band_of = [0]
    for k in range(int(dist.max() / STONE) + 1):
        level = (k + .5) * STONE
        region = (dist >= level).astype(np.uint8)
        contours, _ = cv2.findContours(region, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        for contour in contours:
            pts = contour[:, 0, :].astype(float)
            if len(pts) < 3: continue
            seg = np.r_[0, np.cumsum(np.hypot(*np.diff(np.r_[pts, pts[:1]], axis=0).T))]
            total = seg[-1]
            count = max(1, round(total / STONE))
            offset = random.uniform(0, total / count)
            for j in range(count):
                s = (offset + j * total / count) % total
                i = np.searchsorted(seg, s, side="right") - 1
                x, y = pts[min(i, len(pts) - 1)]
                x += rng.uniform(-1.2, 1.2) * SS; y += rng.uniform(-1.2, 1.2) * SS
                xi, yi = int(round(x)), int(round(y))
                if 0 <= yi < m.shape[0] and 0 <= xi < m.shape[1] and m[yi, xi] and seeds[yi, xi] == 0:
                    n += 1; seeds[yi, xi] = n; band_of.append(k)
    # every pixel of the letters goes to its nearest seed
    _, (iy, ix) = ndimage.distance_transform_edt(seeds == 0, return_indices=True)
    label = seeds[iy, ix]; label[~m] = 0
    bands = np.array(band_of)
    return label, bands, rng

def svg(label, bands, rng):
    """Each stone as a polygon shrunk toward its centre (the open joint),
    grouped by colour into one path per colour: sharp at every size, one file."""
    unit = 1216 / label.shape[1]                       # viewBox units are CSS pixels at 1216 wide
    joint = .55                                        # half the joint, in CSS pixels
    shades = {0: SLATE, 1: OCHRE, 2: TERRA}
    groups = {}
    for i, sl in enumerate(ndimage.find_objects(label), start=1):
        if sl is None: continue
        cell = (label[sl] == i).astype(np.uint8)
        contours, _ = cv2.findContours(cell, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours: continue
        c = max(contours, key=cv2.contourArea)
        if cv2.contourArea(c) < 6 * SS * SS: continue
        c = cv2.approxPolyDP(c, 1.2 * SS, True)[:, 0, :].astype(float)
        c[:, 0] += sl[1].start; c[:, 1] += sl[0].start
        c *= unit
        centre = c.mean(0)
        v = c - centre; length = np.hypot(*v.T)[:, None]
        c = centre + v * np.clip((length - joint) / np.maximum(length, 1e-6), 0, 1)
        band = min(int(bands[i]), 2)
        step = int(rng.integers(-3, 4))                 # seven shades per band, ±11 in steps
        groups.setdefault((band, step), []).append(c)
    paths = []
    for (band, step), polys in sorted(groups.items()):
        rgb = np.clip(np.array(shades[band]) + step * 3.6, 0, 255).astype(int)
        d = []
        for poly in polys:
            q = np.round(poly * 2) / 2
            parts = [f"M{q[0,0]:g} {q[0,1]:g}"] + [f"l{dx:g} {dy:g}" for dx, dy in np.diff(q, axis=0)] + ["z"]
            d.append("".join(parts))
        paths.append(f'<path fill="#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}" d="{"".join(d)}"/>')
    h = label.shape[0] * unit
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1216 {h:.0f}" width="1216" height="{h:.0f}">' + "".join(paths) + "</svg>"

label, bands, rng = lay(mask())
open("public/illustrations/footer-mark.svg", "w").write(svg(label, bands, rng))
print("stones", label.max())
