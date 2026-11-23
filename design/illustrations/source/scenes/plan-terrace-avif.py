"""AVIF copies of the /plan hero (23 Nov 2026).

Owner: «в целом оптимизируй сайт, чтобы все быстрее прогружалось». On a phone
the first picture of /plan is what the page waits for longest: the 1170px
WebP weighs 128 KB. AVIF holds the same picture in about two thirds of that
at the same measured likeness to the master (SSIM 0.981 for WebP q82 and for
AVIF q60), so a phone gets it sooner; WebP stays for browsers without AVIF.

The frames are the ones the WebP files were cut to (found by matching them
against the master): the tile's 1.84:1, 1461 rows from the top; phones, the
1461px square that starts 330px from the left.

Run from the repository root (needs Pillow with AVIF):
  python3 design/illustrations/source/scenes/plan-terrace-avif.py
Writes public/illustrations/scenes/plan-terrace-{960,1200,1920,2560}.avif and
plan-terrace-phone-{780,1170}.avif. Deterministic.
"""
from PIL import Image

MASTER = "design/illustrations/source/scenes/plan-terrace.webp"
OUT = "public/illustrations/scenes/plan-terrace"
QUALITY, SPEED = 60, 2

master = Image.open(MASTER).convert("RGB")
wide = master.crop((0, 0, 2688, 1461))
phone = master.crop((330, 0, 1791, 1461))
for width, height in ((960, 522), (1200, 652), (1920, 1043), (2560, 1391)):   # the WebP files' own sizes
    frame = wide.resize((width, height), Image.LANCZOS)
    frame.save(f"{OUT}-{width}.avif", quality=QUALITY, speed=SPEED)
    print(f"{OUT}-{width}.avif", frame.size)
for side in (780, 1170):
    frame = phone.resize((side, side), Image.LANCZOS)
    frame.save(f"{OUT}-phone-{side}.avif", quality=QUALITY, speed=SPEED)
    print(f"{OUT}-phone-{side}.avif", frame.size)
