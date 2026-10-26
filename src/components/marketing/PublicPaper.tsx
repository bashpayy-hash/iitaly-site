import styles from "./public-paper.module.css";

/** Opt-in material only. Never wraps text, controls, or the portal. */
export function PaperTexture() {
  return <span className={styles.texture} aria-hidden="true" data-public-paper />;
}

export function RisoSpot({ subject, placement }: { subject: "folder" | "map"; placement: "guide" | "faq" }) {
  return <picture className={`${styles.spot} ${styles[placement]}`} data-public-riso={subject}>
    <source media={placement === "faq" ? "(min-width: 1280px)" : "(min-width: 1100px)"} srcSet={`/illustrations/public-paper/${subject}-320.webp`} />
    <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width={320} height={320} loading="lazy" decoding="async" draggable={false} />
  </picture>;
}
