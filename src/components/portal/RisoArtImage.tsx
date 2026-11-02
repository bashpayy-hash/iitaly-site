/* eslint-disable @next/next/no-img-element -- Local, pre-sized WebP for Next static export. */
import { RISO_SIZE, type RisoArt } from "./portalStageArt";

/** One risograph object on a transparent background, zhol style. Decorative. */
export function RisoArtImage({ art, className = "", sizes = "160px", locked = false }: {
  art: RisoArt | "stamp-pad";
  className?: string;
  sizes?: string;
  locked?: boolean;
}) {
  const { width, height } = RISO_SIZE[art];
  return <img
    className={className}
    src={`/illustrations/riso/${art}-240.webp`}
    srcSet={`/illustrations/riso/${art}-240.webp 240w, /illustrations/riso/${art}-480.webp 480w`}
    sizes={sizes}
    width={width}
    height={height}
    alt=""
    aria-hidden="true"
    data-riso-art={art}
    data-riso-locked={locked || undefined}
    loading="lazy"
    decoding="async"
    draggable={false}
  />;
}
