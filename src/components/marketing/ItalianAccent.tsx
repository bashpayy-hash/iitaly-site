import Image from "next/image";
import assets from "./italian-accents.json";
import styles from "./italian-accents.module.css";

type AccentKind = keyof typeof assets;

/** Optional artwork only. No content, controls, motion or global styling. */
export function ItalianAccent({ kind }: { kind: AccentKind }) {
  const asset = assets[kind];

  return (
    <span aria-hidden="true" data-italian-accent={kind} className={`${styles.accent} ${styles[kind]}`}>
      <Image
        src={asset.src}
        alt=""
        width={asset.width}
        height={asset.height}
        unoptimized
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        draggable={false}
        className={styles.image}
      />
    </span>
  );
}
