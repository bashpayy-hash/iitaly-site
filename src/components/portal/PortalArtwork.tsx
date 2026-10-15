/* eslint-disable @next/next/no-img-element -- Responsive local WebP assets for static export. */
import styles from "./portal-artwork.module.css";

type ArtworkPlacement = "sidebar" | "greeting" | "documents";

/** Decorative Higgsfield artwork: it carries no step, status or interaction. */
export function PortalArtwork({ placement }: { placement: ArtworkPlacement }) {
  const scene = placement === "documents" ? "documents" : "campus";
  const sizes = placement === "sidebar" ? "176px" : placement === "greeting" ? "64px" : "(max-width: 900px) 64px, 96px";

  return <div className={`${styles.artwork} ${styles[placement]}`} aria-hidden="true" data-portal-art={scene}>
    <img
      src={`/illustrations/editorial/portal-${scene}-256.webp`}
      srcSet={`/illustrations/editorial/portal-${scene}-256.webp 256w, /illustrations/editorial/portal-${scene}-512.webp 512w`}
      sizes={sizes}
      width={512}
      height={512}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  </div>;
}
