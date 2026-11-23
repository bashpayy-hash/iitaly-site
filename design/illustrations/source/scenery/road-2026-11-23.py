"""The cabinet road of 23 Nov 2026: the first scene (vespi-atlas) and the stage medallions.

Run from the repository root with the generated PNGs in one folder:
    python3 -I design/illustrations/source/scenery/road-2026-11-23.py <folder>
<folder> holds vespi-atlas.png and start.png, education12.png, docs.png, apply.png,
dsu.png, visa.png, arrival.png (design/illustrations/road-2026-11-23.json names the jobs).

Scene: cropped to alpha > 4% plus 10 px; master WebP q92 in design/illustrations/source/scenery;
site WebP q82 with alpha at 560 and 1120 px wide, and a grey copy for the closed road with the
recipe of 7 Nov (HSL lightness, 22% #B8A890, ImageMagick brightness-contrast 10x-14, alpha x 0.62).
Medallions: cropped to alpha > 4%, centred on a transparent square plus 2 px; master WebP q92 in
design/illustrations/source/stages-mosaic; site WebP q82 at 128 and 256 px, named <stage>-mosaic.
"""
import math
import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
SCENERY, STAGES = Path("public/illustrations/scenery"), Path("public/illustrations/stages")
SLOPE = math.tan(math.pi * (1 - 0.14) / 4)
INTERCEPT = 0.10 + (90 / 200) * (1 - SLOPE)
TINT = (0xB8, 0xA8, 0x90)


def crop(im, pad):
    box = im.getchannel("A").point(lambda a: 255 if a > 10 else 0).getbbox()
    im = im.crop(box)
    out = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
    out.paste(im, (pad, pad))
    return out


def grey(im):
    lut = [max(0, min(255, round((SLOPE * (v / 255) + INTERCEPT) * 255))) for v in range(256)]
    r, g, b, a = im.split()
    lightness = Image.eval(Image.merge("RGB", (r, g, b)).convert("RGB"), lambda v: v)
    px = lightness.load()
    w, h = im.size
    out = Image.new("RGB", (w, h))
    po = out.load()
    for y in range(h):
        for x in range(w):
            pr, pg, pb = px[x, y]
            light = (max(pr, pg, pb) + min(pr, pg, pb)) / 2
            po[x, y] = tuple(lut[round(light * 0.78 + c * 0.22)] for c in TINT)
    return Image.merge("RGBA", (*out.split(), a.point(lambda v: round(v * 0.62))))


scene = crop(Image.open(src / "vespi-atlas.png").convert("RGBA"), 10)
scene.save("design/illustrations/source/scenery/vespi-atlas.webp", quality=92, method=6)
for width in (560, 1120):
    size = (width, round(scene.height * width / scene.width))
    colour = scene.resize(size, Image.LANCZOS)
    colour.save(SCENERY / f"vespi-atlas-{width}.webp", quality=82, method=6)
    grey(colour).save(SCENERY / f"vespi-atlas-grey-{width}.webp", quality=82, method=6)
print("vespi-atlas", scene.size)

for stage in ("start", "education12", "docs", "apply", "dsu", "visa", "arrival"):
    im = crop(Image.open(src / f"{stage}.png").convert("RGBA"), 0)
    side = max(im.size) + 4
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    square.save(f"design/illustrations/source/stages-mosaic/{stage}.webp", quality=92, method=6)
    for px in (128, 256):
        square.resize((px, px), Image.LANCZOS).save(STAGES / f"{stage}-mosaic-{px}.webp", quality=82, method=6)
    print(stage, square.size)
