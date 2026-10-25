/* eslint-disable @next/next/no-img-element -- Responsive local WebP assets for static export. */
import styles from "./portal-artwork.module.css";

type ArtworkPlacement = "overview" | "plan" | "documents";

/** Decorative Higgsfield artwork: it carries no step, status or interaction. */
export function PortalArtwork({ placement }: { placement: ArtworkPlacement }) {
  if (placement !== "overview") return null;
  return <div className={`${styles.artwork} ${styles.overview}`} aria-hidden="true" data-portal-art="study">
    <img
      src="/illustrations/editorial/portal-study-256.webp"
      srcSet="/illustrations/editorial/portal-study-256.webp 256w, /illustrations/editorial/portal-study-512.webp 512w"
      sizes="(max-width: 540px) 88px, (max-width: 1100px) 128px, 160px"
      width={512}
      height={384}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  </div>;
}
