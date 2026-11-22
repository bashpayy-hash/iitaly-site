"""The scene behind the share card (public/og.jpg), 23 Nov 2026.

Owner, with a Telegram screenshot of the link preview, plain words on paper:
«почему эта страница такая страшная, сделай ее нормально красивой с
иллюстрацией в нашем стиле». The card carries the /plan terrace
(design/illustrations/source/scenes/plan-terrace.webp): the terrace over
Florence, Vespi launching a paper plane. On the card the headline stands on
the sky at the right, where three planes glide in the page's picture, so they
are painted out here; the plane in Vespi's paw stays.

Run from the repository root (needs numpy, opencv, Pillow):
  python3 design/social/source/share-card-scene.py
Writes design/social/source/share-card-scene.webp, 1200×630. Deterministic.
Then draw the card: node design/social/source/share-card.mjs
"""
import cv2
import numpy as np
from PIL import Image

MASTER = "design/illustrations/source/scenes/plan-terrace.webp"
OUT = "design/social/source/share-card-scene.webp"
PLANES = ((2005, 450, 2165, 515), (2215, 500, 2375, 560), (2400, 380, 2560, 440))   # x0, y0, x1, y1 in the master

picture = cv2.cvtColor(np.asarray(Image.open(MASTER).convert("RGB")), cv2.COLOR_RGB2BGR)
height, width = picture.shape[:2]
for seed, (x0, y0, x1, y1) in enumerate(PLANES):
    pad = 80
    left, top, right, bottom = max(0, x0 - pad), max(0, y0 - pad), min(width, x1 + pad), min(height, y1 + pad)
    region = picture[top:bottom, left:right].copy()
    mask = np.zeros(region.shape[:2], np.uint8)
    cv2.ellipse(mask, ((x0 + x1) // 2 - left, (y0 + y1) // 2 - top), ((x1 - x0) // 2 + 14, (y1 - y0) // 2 + 14), 0, 0, 360, 255, -1)
    # The sky is a slow gradient: fill at a quarter size, enlarge, soften, and
    # give it back the picture's own fine grain.
    small = cv2.resize(region, None, fx=.25, fy=.25, interpolation=cv2.INTER_AREA)
    small_mask = cv2.dilate(cv2.resize(mask, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST), np.ones((3, 3), np.uint8))
    fill = cv2.resize(cv2.inpaint(small, small_mask, 6, cv2.INPAINT_TELEA), (region.shape[1], region.shape[0]), interpolation=cv2.INTER_CUBIC)
    fill = cv2.GaussianBlur(fill, (0, 0), 6).astype(np.float32) + np.random.default_rng(seed).normal(0, 1.6, region.shape).astype(np.float32)
    soft = cv2.GaussianBlur(mask, (0, 0), 7).astype(np.float32)[..., None] / 255
    picture[top:bottom, left:right] = np.clip(region * (1 - soft) + fill * soft, 0, 255).astype(np.uint8)

frame = Image.fromarray(cv2.cvtColor(picture, cv2.COLOR_BGR2RGB)).crop((0, 0, width, round(width * 630 / 1200)))
frame.resize((1200, 630), Image.LANCZOS).save(OUT, quality=95, method=6)
print(OUT, frame.size, "-> 1200x630")
