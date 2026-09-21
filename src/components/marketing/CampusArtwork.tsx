import styles from "./marketing.module.css";

/** An imagined campus, never presented as a specific university or student result. */
export function CampusArtwork() {
  return (
    <picture className={styles.campusArtwork}>
      <img
        src="/illustrations/editorial/campus-arrival-960.webp"
        srcSet="/illustrations/editorial/campus-arrival-480.webp 480w, /illustrations/editorial/campus-arrival-960.webp 960w, /illustrations/editorial/campus-arrival-1168.webp 1168w"
        sizes="(max-width: 767px) 100vw, (max-width: 1199px) 44vw, 560px"
        width={1168}
        height={880}
        alt=""
        fetchPriority="high"
        loading="eager"
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}
