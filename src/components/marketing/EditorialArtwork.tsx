/* eslint-disable @next/next/no-img-element -- Pre-sized local WebP sources support static export without an image server. */
import styles from "./editorial-art.module.css";

const ROOT = "/illustrations/editorial";
const scenes = {
  terrace: { width: 1200, height: 900 },
  "balcony-scene": { width: 1000, height: 1000 },
  "study-desk": { width: 900, height: 675 },
} as const;

type Scene = keyof typeof scenes;

/** Approved artwork only: no generated UI, remote CDN or runtime image API. */
export function EditorialArtwork({
  scene,
  priority = false,
  className = "",
}: {
  scene: Scene;
  priority?: boolean;
  className?: string;
}) {
  const { width, height } = scenes[scene];
  return (
    <picture aria-hidden="true" data-editorial-art={scene} className={`${styles.picture} ${className}`}>
      <source
        type="image/webp"
        srcSet={`${ROOT}/${scene}-480.webp 480w, ${ROOT}/${scene}.webp ${width}w`}
        sizes="(max-width: 1023px) 100vw, 50vw"
      />
      <img
        src={`${ROOT}/${scene}.webp`}
        width={width}
        height={height}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}

/** An expendable edge wash, separate from the text so blur never touches copy. */
export function StudyAtmosphere() {
  return (
    <div aria-hidden="true" data-editorial-atmosphere className={styles.atmosphere}>
      <img src={`${ROOT}/travel-paperwork-640.webp`} alt="" width={640} height={480} loading="lazy" decoding="async" draggable={false} />
    </div>
  );
}

export function TomatoAccent() {
  return (
    <span aria-hidden="true" data-editorial-spot="tomatoes" className={styles.tomato}>
      <img src={`${ROOT}/tomato-bowl-320.webp`} alt="" width={320} height={320} loading="lazy" decoding="async" draggable={false} />
    </span>
  );
}

/** Small approved cutout in the comparison heading, never over table content. */
export function LemonPostcard() {
  return (
    <span aria-hidden="true" data-selected-accent="lemon-postcard" className={styles.lemonPostcard}>
      <img src={`${ROOT}/lemon-postcard-320.webp`} alt="" width={320} height={400} loading="lazy" decoding="async" draggable={false} />
    </span>
  );
}
