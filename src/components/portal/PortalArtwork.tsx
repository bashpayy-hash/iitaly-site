import { StageObject } from "./PortalStageLineup";
import styles from "./portal-artwork.module.css";

type ArtworkPlacement = "overview" | "plan" | "documents";

/** Decorative object from the shared set (objects-2026-11-04.json): it carries
 *  no step, status or interaction. Owner, 4 Nov: one style everywhere. */
export function PortalArtwork({ placement }: { placement: ArtworkPlacement }) {
  if (placement !== "documents") return null;
  return <div className={`${styles.artwork} ${styles.documents}`} aria-hidden="true" data-portal-art="stamp-pad">
    <StageObject art="stamp-pad" sizes="(max-width: 540px) 88px, 140px" />
  </div>;
}
