# Highlight covers 1080x1920 from the square scenes h1..h6 (already muted):
# the scene sits in the middle, where Instagram cuts the circle; above and
# below is its own blurred extension. Usage: python3 highlights.py <out-dir>
import os, sys
from PIL import Image, ImageFilter
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
names = {'h1': '01-vespi', 'h2': '02-vuzy', 'h3': '03-dokumenty', 'h4': '04-dsu', 'h5': '05-viza', 'h6': '06-gaidy'}
for key, name in names.items():
    sq = Image.open(os.path.join(here, 'scenes', key + '.webp')).convert('RGB').resize((1080, 1080), Image.LANCZOS)
    canvas = sq.resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
    canvas.paste(sq, (0, 420))
    canvas.save(os.path.join(out, name + '.jpg'), quality=92)
