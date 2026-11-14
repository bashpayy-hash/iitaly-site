# Highlight covers 1080x1920 from the square scenes (already muted):
# the scene sits in the middle, where Instagram cuts the circle; above and
# below is its own blurred extension. Usage: python3 highlights.py <out-dir>
import os, sys
from PIL import Image, ImageFilter
here = os.path.dirname(os.path.abspath(__file__))
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
# Order follows the research note in the README: who we are and the price
# first, then the product, then the questions. Only the first cover has Vespi.
names = {'h1': '01-o-nas', 's7': '02-cena', 's3': '03-dokumenty', 's4': '04-dsu',
         's2': '05-vuzy', 's5': '06-viza', 's6': '07-gaidy', 's8': '08-voprosy'}
for key, name in names.items():
    sq = Image.open(os.path.join(here, 'scenes', key + '.webp')).convert('RGB').resize((1080, 1080), Image.LANCZOS)
    canvas = sq.resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
    canvas.paste(sq, (0, 420))
    canvas.save(os.path.join(out, name + '.jpg'), quality=92)
