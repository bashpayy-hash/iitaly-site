# Highlight covers 1080x1920 from square medallions: the medallion sits in the
# middle, where Instagram cuts the circle, on a plain field sampled from the
# square's own corners. Usage: python3 highlights.py <src-dir> <out-dir>
# (src files: NN-key.png or .webp, e.g. 01-o-nas.png).
import os, sys
from PIL import Image, ImageStat
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.lower().endswith(('.png', '.webp', '.jpg')):
        continue
    sq = Image.open(os.path.join(src, f)).convert('RGB').resize((1080, 1080), Image.LANCZOS)
    corners = [sq.crop(b) for b in ((0, 0, 60, 60), (1020, 0, 1080, 60), (0, 1020, 60, 1080), (1020, 1020, 1080, 1080))]
    rgb = tuple(int(sum(ImageStat.Stat(c).mean[i] for c in corners) / 4) for i in range(3))
    canvas = Image.new('RGB', (1080, 1920), rgb)
    canvas.paste(sq, (0, 420))
    canvas.save(os.path.join(out, os.path.splitext(f)[0] + '.jpg'), quality=92)
