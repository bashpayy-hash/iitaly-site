/* eslint-disable @next/next/no-img-element -- Responsive local WebP for static export. */
import styles from "./prices-landscape.module.css";

/** The exact coastal terrace approved by the user; no new generation or crop. */
export function PricesLandscape() {
  return (
    <span aria-hidden="true" data-prices-landscape className={styles.landscape}>
      <img
        src="/illustrations/editorial/coastal-terrace-360.webp"
        srcSet="/illustrations/editorial/coastal-terrace-360.webp 360w, /illustrations/editorial/coastal-terrace-720.webp 720w"
        sizes="(min-width: 1552px) 330px, (min-width: 1280px) calc(45vw - 368px), 208px"
        width={360}
        height={270}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </span>
  );
}
