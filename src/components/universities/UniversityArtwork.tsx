/* eslint-disable @next/next/no-img-element -- Local responsive WebP in a static export. */
import ui from "./university-ui.module.css";

/** Reuse the user's approved cutouts, not the rejected large scenic artwork. */
export function UniversityArtwork({ variant }: { variant: "postcard" | "paperwork" }) {
  const postcard = variant === "postcard";
  const file = postcard ? "lemon-postcard" : "travel-paperwork";
  return (
    <div aria-hidden="true" data-university-art={variant} className={postcard ? ui.heroArt : ui.emptyArt}>
      <img
        src={`/illustrations/editorial/${file}-320.webp`}
        srcSet={`/illustrations/editorial/${file}-320.webp 320w, /illustrations/editorial/${file}-640.webp 640w`}
        sizes={postcard ? "(max-width: 767px) 96px, 224px" : "176px"}
        width={320}
        height={postcard ? 400 : 240}
        alt="" loading={postcard ? "eager" : "lazy"} decoding="async" draggable={false}
      />
    </div>
  );
}
