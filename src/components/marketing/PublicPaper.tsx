import styles from "./public-paper.module.css";

/** Opt-in material only. Never wraps text, controls, or the portal. */
export function PaperTexture({ dark = false }: { dark?: boolean }) {
  return <><span className={`${styles.texture} ${dark ? styles.darkTexture : ""}`} aria-hidden="true" data-public-paper /><span className={styles.noise} aria-hidden="true" data-paper-grain /></>;
}

export type RisoSubject = "folder" | "map" | "calendar" | "envelope" | "key";
export function RisoSpot({ subject, placement }: { subject: RisoSubject; placement: "guide" | "faq" | "article" }) {
  return <picture className={`${styles.spot} ${styles[placement]}`} data-public-riso={subject}>
    <source media={placement === "guide" ? "(min-width: 1100px)" : "(min-width: 1280px)"} srcSet={`/illustrations/public-paper/${subject}-320.webp`} />
    <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width={320} height={320} loading="lazy" decoding="async" draggable={false} />
  </picture>;
}
