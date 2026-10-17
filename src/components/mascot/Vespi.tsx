/* eslint-disable @next/next/no-img-element -- Local, pre-sized WebP for Next static export. */

export const VESPI_NAME = "Веспи Баурысаков";

/** The approved plush identity with its user-requested helmet route detail.
 * Versioned assets avoid stale cached images after the visual refinement. */
export function Vespi({ variant = "ride", className = "", alt = "", priority = false, sizes }: {
  variant?: "ride" | "avatar";
  className?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const avatar = variant === "avatar";
  return <img
    data-vespi={variant}
    src={`/mascot/vespi/vespi-${variant}-route-${avatar ? 96 : 320}.webp`}
    srcSet={avatar
      ? "/mascot/vespi/vespi-avatar-route-96.webp 96w, /mascot/vespi/vespi-avatar-route-192.webp 192w"
      : "/mascot/vespi/vespi-ride-route-160.webp 160w, /mascot/vespi/vespi-ride-route-320.webp 320w, /mascot/vespi/vespi-ride-route-640.webp 640w"}
    sizes={sizes || (avatar ? "48px" : "(max-width: 600px) 120px, 240px")}
    width={avatar ? 192 : 320}
    height={avatar ? 192 : 397}
    alt={alt}
    aria-hidden={alt === "" ? true : undefined}
    className={className}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
    draggable={false}
  />;
}
