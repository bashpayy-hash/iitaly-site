"""Two stage medallions of the cabinet road, redrawn on 23 Nov 2026 (night).

Owner: «на иллюстрациях вместо вот этих двух на паспорте должен быть паспорт
Казахстана, и на монетках там должен быть веспи начеканенный на монете, как на
древних римских монетах». design/illustrations/road-2026-11-23.json names the jobs.

Run from the repository root with the generated PNGs in one folder:
    python3 -I design/illustrations/source/scenery/road-medallions-2026-11-23b.py <folder>
<folder> holds visa-kz.png and dsu-aureus.png. The same processing as the other five
(road-2026-11-23.py): cropped to alpha > 4%, centred on a transparent square plus 2 px;
master WebP q92 in design/illustrations/source/stages-mosaic; site WebP q82 at 128 and
256 px. A redrawn picture gets a new name, so the old files are removed.
"""
import sys
from pathlib import Path
from PIL import Image

src, STAGES = Path(sys.argv[1]), Path("public/illustrations/stages")
for name in ("visa-kz", "dsu-aureus"):
    im = Image.open(src / f"{name}.png").convert("RGBA")
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 10 else 0).getbbox())
    side = max(im.size) + 4
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    square.save(f"design/illustrations/source/stages-mosaic/{name}.webp", quality=92, method=6)
    for px in (128, 256):
        square.resize((px, px), Image.LANCZOS).save(STAGES / f"{name}-mosaic-{px}.webp", quality=82, method=6)
    print(name, square.size)
