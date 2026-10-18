/* eslint-disable @next/next/no-img-element -- Local responsive alpha WebP; no image service is needed for static export. */
import type { ReactNode } from "react";
import styles from "./botanical-canvas.module.css";

/** Decorative layers only. Keep real headings and controls in the sibling copy zone. */
export function BotanicalCanvas({ left, right, connectToCards = false }: { left?: ReactNode; right?: ReactNode; connectToCards?: boolean }) {
  return <div className={styles.canvas} data-botanical-canvas aria-hidden="true">
    <img className={styles.ambient} data-botanical-layer="ambient" src="/illustrations/editorial/pergola-wash-640.webp"
      width="640" height="213" alt="" decoding="async" loading="eager" fetchPriority="low" draggable={false} />
    <picture>
    <source media="(max-width:767px)" srcSet="/illustrations/editorial/botanical-canopy-640.webp" />
    <img className={styles.canopy} data-botanical-layer="canopy" src="/illustrations/editorial/botanical-canopy-640.webp"
      srcSet="/illustrations/editorial/botanical-canopy-640.webp 640w, /illustrations/editorial/botanical-canopy-1280.webp 1280w"
      sizes="100vw" width="1280" height="430" alt="" decoding="async" loading="eager" fetchPriority="low" draggable={false} />
    </picture>
    {left && <div className={styles.left} data-botanical-layer="left">{left}</div>}
    {right && <div className={styles.right} data-botanical-layer="right">{right}</div>}
    {connectToCards && <>
    <span className={`${styles.sprig} ${styles.sprigLeft}`}>
      <picture>
      <source media="(max-width:767px)" srcSet="/illustrations/editorial/botanical-canopy-640.webp" />
      <img src="/illustrations/editorial/botanical-canopy-640.webp"
        srcSet="/illustrations/editorial/botanical-canopy-640.webp 640w, /illustrations/editorial/botanical-canopy-1280.webp 1280w"
        sizes="100vw" width="640" height="215" alt="" decoding="async" draggable={false} />
      </picture>
    </span>
    <span className={`${styles.sprig} ${styles.sprigRight}`}>
      <img src="/illustrations/editorial/pergola-wash-640.webp" width="640" height="213" alt="" decoding="async" draggable={false} />
    </span>
    <svg className={styles.bridge} data-price-bridge viewBox="0 0 900 110" fill="none" preserveAspectRatio="none">
      <path d="M12 108C26 82 48 61 111 56C223 47 308 72 438 70C571 69 645 43 761 54C839 61 872 81 888 108" />
      <circle cx="12" cy="108" r="2" /><circle cx="888" cy="108" r="2" />
    </svg>
    </>}
  </div>;
}
