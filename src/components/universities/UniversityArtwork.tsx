/* eslint-disable @next/next/no-img-element -- Local responsive WebP in a static export. */
import ui from "./university-ui.module.css";

/* В шапке раньше стояла ветка лимона с открыткой — та же картинка, что и в
   блоке «Сравни не только название» ниже на этой странице. Теперь в шапке
   балкон с ставнями: свой рисунок проекта (balcony-accent), обрезанный по
   контуру, который больше нигде на сайте не повторяется. */
const ART = {
  balcony: { file: "balcony-window", small: 150, large: 300, height: 605, sizes: "(max-width: 767px) 58px, 150px" },
  paperwork: { file: "travel-paperwork", small: 320, large: 640, height: 240, sizes: "176px" },
} as const;

/** Reuse the user's approved cutouts, not the rejected large scenic artwork. */
export function UniversityArtwork({ variant }: { variant: keyof typeof ART }) {
  const art = ART[variant];
  const hero = variant === "balcony";
  return (
    <div aria-hidden="true" data-university-art={variant} className={hero ? ui.heroArt : ui.emptyArt}>
      <img
        src={`/illustrations/editorial/${art.file}-${art.small}.webp`}
        srcSet={`/illustrations/editorial/${art.file}-${art.small}.webp ${art.small}w, /illustrations/editorial/${art.file}-${art.large}.webp ${art.large}w`}
        sizes={art.sizes}
        width={art.large}
        height={hero ? art.height : 480}
        alt="" loading={hero ? "eager" : "lazy"} decoding="async" draggable={false}
      />
    </div>
  );
}
