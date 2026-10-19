/* eslint-disable @next/next/no-img-element -- Local museum images keep static export independent of an image server. */
import styles from "./framed-artwork.module.css";

const works = {
  canal: { file: "canaletto-grand-canal.jpg", width: 1200, height: 733 },
  lagoon: { file: "canaletto-lagoon.jpg", width: 1200, height: 867 },
  piazza: { file: "canaletto-san-marco.jpg", width: 1200, height: 740 },
} as const;

export type ArtworkScene = keyof typeof works;

/** Canaletto's public-domain vedute, framed as artwork rather than campus photography. */
export function FramedArtwork({
  scene = "canal",
  variant = "landscape",
  priority = false,
  className = "",
  alt = "",
}: {
  scene?: ArtworkScene;
  variant?: "landscape" | "portrait" | "vignette" | "miniature";
  priority?: boolean;
  className?: string;
  alt?: string;
}) {
  const work = works[scene];
  return (
    <span
      className={`${styles.frame} ${styles[variant]} ${styles[scene]} ${className}`}
      data-framed-art={scene}
      aria-hidden={alt ? undefined : true}
    >
      <span className={styles.window}>
        <img
          src={`/art/${work.file}`}
          width={work.width}
          height={work.height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          draggable={false}
        />
      </span>
    </span>
  );
}
