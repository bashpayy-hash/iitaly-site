import { FramedArtwork, type ArtworkScene } from "@/components/marketing/FramedArtwork";
import styles from "./portal-artwork.module.css";

type ArtworkPlacement = "overview" | "plan" | "documents";
const scenes: Record<ArtworkPlacement, ArtworkScene> = { overview: "lagoon", plan: "canal", documents: "piazza" };

/** Decorative historical artwork carries no step, status or interaction. */
export function PortalArtwork({ placement }: { placement: ArtworkPlacement }) {
  return <div className={`${styles.artwork} ${styles[placement]}`} aria-hidden="true" data-portal-art={placement}>
    <FramedArtwork scene={scenes[placement]} />
  </div>;
}
