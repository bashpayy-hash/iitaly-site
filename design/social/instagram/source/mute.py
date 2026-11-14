# Usage: python3 mute.py <src.png> <dst.png> [k=0.74] [red_k=0.96]
# Applied to every generated scene: background saturation x0.74, Vespi reds x0.96.
# Same hues, calmer: lower saturation of everything except Vespi's reds.
import sys, numpy as np
from PIL import Image
def mute(src, dst, k=0.74, red_k=0.96):
    im = Image.open(src).convert('RGB')
    hsv = np.asarray(im.convert('HSV')).astype(np.float32)
    h, s = hsv[..., 0] * 360 / 255, hsv[..., 1]
    red = ((h < 14) | (h > 342)) & (s > 120)
    # soft transition so red edges don't band
    w = np.clip((s - 90) / 60, 0, 1) * (((h < 20) | (h > 336)).astype(np.float32))
    factor = k + (red_k - k) * w
    hsv[..., 1] = np.clip(s * factor, 0, 255)
    Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB').save(dst)
if __name__ == '__main__':
    mute(sys.argv[1], sys.argv[2], *(float(x) for x in sys.argv[3:]))
