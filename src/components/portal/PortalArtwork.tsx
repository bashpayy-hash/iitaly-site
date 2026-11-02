import { RisoArtImage } from "./RisoArtImage";
import styles from "./portal-artwork.module.css";

type ArtworkPlacement = "overview" | "plan" | "documents";

/** Decorative zhol risograph object: it carries no step, status or interaction. */
export function PortalArtwork({ placement }: { placement: ArtworkPlacement }) {
  if (placement !== "documents") return null;
  return <div className={`${styles.artwork} ${styles.documents}`} aria-hidden="true" data-portal-art="stamp-pad">
    <RisoArtImage art="stamp-pad" sizes="(max-width: 540px) 88px, 140px" />
  </div>;
}
