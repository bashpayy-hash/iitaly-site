/* eslint-disable @next/next/no-img-element -- Responsive local WebP assets for static export. */
import styles from "./portal-artwork.module.css";

type ArtworkPlacement = "overview" | "plan" | "documents";

/** Decorative Higgsfield artwork: it carries no step, status or interaction. */
export function PortalArtwork({ placement }: { placement: ArtworkPlacement }) {
  const scene = placement === "overview" ? "study" : placement === "plan" ? "route" : "documents";
  const landscape = placement === "overview" || placement === "plan";
  const sizes = placement === "overview" ? "(max-width: 540px) 88px, (max-width: 1100px) 128px, 320px"
    : placement === "plan" ? "(max-width: 900px) 64px, 136px"
    : "(max-width: 900px) 64px, 112px";

  return <div className={`${styles.artwork} ${styles[placement]}`} aria-hidden="true" data-portal-art={scene}>
    <img
      src={`/illustrations/editorial/portal-${scene}-256.webp`}
      srcSet={`/illustrations/editorial/portal-${scene}-256.webp 256w, /illustrations/editorial/portal-${scene}-512.webp 512w`}
      sizes={sizes}
      width={512}
      height={landscape ? 384 : 512}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  </div>;
}
