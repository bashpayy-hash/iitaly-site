import { FramedArtwork } from "@/components/marketing/FramedArtwork";
import ui from "./university-ui.module.css";

/** Historic architecture sets the context without impersonating a specific campus. */
export function UniversityArtwork({ variant }: { variant: "balcony" | "paperwork" }) {
  const hero = variant === "balcony";
  return (
    <div aria-hidden="true" data-university-art={variant} className={hero ? ui.heroArt : ui.emptyArt}>
      <FramedArtwork scene={hero ? "piazza" : "canal"} priority={hero} />
    </div>
  );
}
