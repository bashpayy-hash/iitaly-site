import { FramedArtwork, type ArtworkScene } from "./FramedArtwork";

const scenes = {
  terrace: "canal",
  "balcony-scene": "piazza",
  "study-desk": "lagoon",
} as const satisfies Record<string, ArtworkScene>;

/** Compatibility wrapper: former watercolor scenes now use crisp framed vedute. */
export function EditorialArtwork({
  scene,
  priority = false,
  className = "",
}: {
  scene: keyof typeof scenes;
  priority?: boolean;
  className?: string;
}) {
  return <FramedArtwork scene={scenes[scene]} priority={priority} className={className} />;
}

/** Working tools stay on a clear surface without decorative background washes. */
export function StudyAtmosphere() { return null; }
export function TomatoAccent() { return null; }

/** A small architectural detail beside the comparison introduction. */
export function LemonPostcard() {
  return <FramedArtwork scene="piazza" variant="miniature" />;
}
