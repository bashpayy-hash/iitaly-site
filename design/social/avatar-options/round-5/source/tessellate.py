# Lay a flat icon out as a Milanese floor mosaic: square tesserae with grout,
# slight per-tile colour jitter, inside an octagonal marble frame.
import sys, random, math
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
random.seed(7)
N = 1080
img = Image.open(src).convert('RGB').resize((N, N))
canvas = Image.new('RGB', (N, N), (214, 204, 186))  # grout
d = ImageDraw.Draw(canvas)
def jitter(c, a=10):
    return tuple(max(0, min(255, v + random.randint(-a, a))) for v in c)
# octagonal frame bands (outer to inner): green, cream, red, cream
cx = cy = N / 2
def octagon(r):
    return [(cx + r * math.cos(math.radians(22.5 + 45 * i)), cy + r * math.sin(math.radians(22.5 + 45 * i))) for i in range(8)]
step = 15
R0 = N * .40  # icon medallion radius
rings = [(R0 + 12, (243, 235, 221), 'c'), (R0 + 26, (196, 64, 58), 'c'), (R0 + 38, (243, 235, 221), 'c'), (R0 + 86, (8, 124, 85), 'o'), (R0 + 98, (243, 235, 221), 'o')]
for gy in range(0, N, step):
    for gx in range(0, N, step):
        x, y = gx + step / 2, gy + step / 2
        r = math.hypot(x - cx, y - cy)
        ang = (math.degrees(math.atan2(y - cy, x - cx)) - 22.5) % 45 - 22.5
        rr = r * math.cos(math.radians(ang)) / math.cos(math.radians(22.5))
        if r < R0:
            k = N / (2 * R0 * 1.02)
            sx = min(N - 1, max(0, int(cx + (x - cx) * k)))
            sy = min(N - 1, max(0, int(cy + (y - cy) * k)))
            c = img.getpixel((sx, sy))
        else:
            # outside the medallion: octagonal bands, then warm marble with a grey diagonal lattice
            c = None
            for br, bc, kind in rings:
                if (r if kind == 'c' else rr) < br:
                    c = bc; break
            if c is None:
                c = (176, 166, 152) if ((gx // step + gy // step) % 8 == 0 or (gx // step - gy // step) % 8 == 0) else (232, 222, 204)
        c = jitter(c, 9)
        g = random.uniform(1.2, 2.4)
        d.rectangle([gx + g, gy + g, gx + step - g, gy + step - g], fill=c)
canvas = canvas.filter(ImageFilter.GaussianBlur(.4))
# polished sheen
sheen = Image.new('L', (N, N), 0); sd = ImageDraw.Draw(sheen)
sd.ellipse([N * .1, -N * .3, N * 1.1, N * .5], fill=38)
sheen = sheen.filter(ImageFilter.GaussianBlur(120))
canvas = Image.composite(Image.new('RGB', (N, N), (255, 255, 255)), canvas, sheen)
canvas.save(out)
