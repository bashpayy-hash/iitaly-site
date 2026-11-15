# Highlight covers 1080x1920 from square medallions. Instagram cuts a circle
# out of the middle and the profile shows it smaller still, so the medallion
# (owner, 15 Nov: «на profile page уже идёт обрезка») is cut out along its own
# rim, scaled to 84% and set on a field of its own ground colour: the whole
# frame stays visible. Usage: python3 highlights.py <src-dir> <out-dir> [scale]
import os, sys
import numpy as np
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
scale = float(sys.argv[3]) if len(sys.argv) > 3 else 0.84
os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.lower().endswith(('.png', '.webp', '.jpg')):
        continue
    sq = Image.open(os.path.join(src, f)).convert('RGB').resize((1080, 1080), Image.LANCZOS)
    a = np.asarray(sq).astype(np.float32)
    yy, xx = np.mgrid[0:1080, 0:1080]
    r = np.hypot(xx - 540, yy - 540) / 1080
    ground = tuple(int(v) for v in np.median(a[(r > 0.36) & (r < 0.42)], axis=0) * 0.82)
    mask = Image.new('L', (1080, 1080), 0)
    ImageDraw.Draw(mask).ellipse((14, 14, 1066, 1066), fill=255)
    size = int(1080 * scale)
    med = sq.resize((size, size), Image.LANCZOS)
    m = mask.resize((size, size), Image.LANCZOS)
    canvas = Image.new('RGB', (1080, 1920), ground)
    canvas.paste(med, ((1080 - size) // 2, 420 + (1080 - size) // 2), m)
    canvas.save(os.path.join(out, os.path.splitext(f)[0] + '.jpg'), quality=92)
