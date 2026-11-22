"""The footer's «iItaly»: the word in the site's own type, stone on paper (22 Nov 2026).

History, all the owner's words on the same night:
- after the reel's fade-out footer logo, a texture seen through the letters
  read as bricks: «А че надпись кирпичная, сделай мозаичной в общем стиле тогда»;
- the word laid in rows of umber, ochre and terracotta stones was too large:
  «Так, оно уже слишком большое… Сделай поменьше» (600px at most since);
- and then the mosaic itself: «слишком колхозно выглядит, нужно быть более
  stylish, more like in a modern attitude like of the website».

So the word is now plain type, as the header sets it: Inter Tight 700 at
-0.055em, the outlines taken from the font itself, filled with one warm stone
tone a few steps darker than the paper. The one colour is the dot of the
first «i», in the site's red (#E63946) — the accent the site uses once per
screen. The CSS fades the lower part into the paper.

Run from the repository root after `npm run build` (the face is read from
the build). Needs fontTools with brotli:
  python3 design/illustrations/source/wordmark/footer-wordmark.py
Writes public/illustrations/footer-mark.svg: two paths. Deterministic.
"""
import glob

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

WORD, TRACK, WIDTH, PAD = "iItaly", -0.055, 1216, 4
STONE, RED = "#E3DACB", "#E63946"


def face():
    for path in sorted(glob.glob("out/_next/static/media/*.woff2")):
        font = TTFont(path)
        cmap = font.getBestCmap() or {}
        if "Inter Tight" in font["name"].getDebugName(1) and all(ord(c) in cmap for c in WORD):
            return instancer.instantiateVariableFont(font, {"wght": 700})
    raise SystemExit("Inter Tight with the word's letters not found: run npm run build first")


font = face()
glyphs, cmap, hmtx, upm = font.getGlyphSet(), font.getBestCmap(), font["hmtx"], font["head"].unitsPerEm

# Set the word in font units, then fit its ink into a 1216-wide box.
placed, x = [], 0
for char in WORD:
    name = cmap[ord(char)]
    placed.append((name, x))
    x += hmtx[name][0] + TRACK * upm
bounds = BoundsPen(glyphs)
for name, x0 in placed:
    glyphs[name].draw(TransformPen(bounds, (1, 0, 0, 1, x0, 0)))
xmin, ymin, xmax, ymax = bounds.bounds
scale = (WIDTH - 2 * PAD) / (xmax - xmin)
height = round((ymax - ymin) * scale + 2 * PAD)


def contours(name):
    pen = DecomposingRecordingPen(glyphs)
    glyphs[name].draw(pen)
    out, current = [], []
    for op, args in pen.value:
        current.append((op, args))
        if op in ("closePath", "endPath"):
            out.append(current)
            current = []
    return out


def path(ops, x0):
    pen = SVGPathPen(glyphs, ntos=lambda v: f"{round(v, 1):g}")
    flip = TransformPen(pen, (scale, 0, 0, -scale, (x0 - xmin) * scale + PAD, ymax * scale + PAD))
    for op, args in ops:
        getattr(flip, op)(*args)
    return pen.getCommands()


def top(ops):
    return max(point[1] for _, args in ops for point in args if isinstance(point, tuple))


# The first «i»: its stem goes with the letters, its dot (the highest contour) is red.
first = sorted(contours(placed[0][0]), key=top)
letters = "".join(path(c, 0) for c in first[:-1]) + "".join(path(c, x0) for name, x0 in placed[1:] for c in contours(name))
dot = path(first[-1], 0)

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {height}" width="{WIDTH}" height="{height}">'
       f'<path fill="{STONE}" d="{letters}"/><path fill="{RED}" d="{dot}"/></svg>\n')
open("public/illustrations/footer-mark.svg", "w").write(svg)
print("footer-mark.svg", WIDTH, height, len(svg), "bytes")
