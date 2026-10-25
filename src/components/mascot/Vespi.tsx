/* eslint-disable @next/next/no-img-element -- Local, pre-sized WebP for Next static export. */

export const VESPI_NAME = "Веспи Баурысаков";

export type VespiVariant = "route" | "inspector" | "celebrate" | "copilot";
export type VespiPresentation = "portrait" | "figure";

type VespiAsset = { src: string; srcSet: string; width: number; height: number };
const PORTRAIT: VespiAsset = {
  src: "/mascot/handmade-v1/avatar-96.webp",
  srcSet: "/mascot/handmade-v1/avatar-96.webp 96w, /mascot/handmade-v1/avatar-192.webp 192w",
  width: 192, height: 192,
};
const FIGURE: VespiAsset = {
  src: "/mascot/handmade-v1/welcome-320.webp",
  srcSet: "/mascot/handmade-v1/welcome-320.webp 320w, /mascot/handmade-v1/welcome-640.webp 640w",
  width: 640, height: 512,
};
const COPILOT_PORTRAIT: VespiAsset = {
  src: "/mascot/handmade-v1/avatar-96.webp",
  srcSet: "/mascot/handmade-v1/avatar-96.webp 96w, /mascot/handmade-v1/avatar-192.webp 192w",
  width: 192, height: 192,
};
const INSPECTOR_PORTRAIT: VespiAsset = {
  src: "/mascot/handmade-v1/avatar-96.webp",
  srcSet: "/mascot/handmade-v1/avatar-96.webp 96w, /mascot/handmade-v1/avatar-192.webp 192w",
  width: 192, height: 192,
};
const INSPECTOR_FIGURE: VespiAsset = {
  src: "/mascot/handmade-v1/checking-320.webp",
  srcSet: "/mascot/handmade-v1/checking-320.webp 320w, /mascot/handmade-v1/checking-640.webp 640w",
  width: 640, height: 512,
};

/** Role-specific artwork is registered only after likeness/alpha review.
 * No missing URLs or invented expert poses: every role has an approved fallback. */
export const VESPI_ROLE_ASSETS: Record<VespiVariant, Partial<Record<VespiPresentation, VespiAsset>>> = {
  route: { portrait: PORTRAIT, figure: FIGURE },
  inspector: { portrait: INSPECTOR_PORTRAIT, figure: INSPECTOR_FIGURE },
  copilot: { portrait: COPILOT_PORTRAIT },
  celebrate: {},
};

/** The handmade identity: subtle cloth, sparse loose threads, small button eyes.
 * Versioned assets avoid stale cached images after the visual refinement. */
export function Vespi({ variant = "ride", presentation, className = "", alt = "", priority = false, sizes }: {
  variant?: "ride" | "avatar" | VespiVariant;
  presentation?: VespiPresentation;
  className?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const legacy = variant === "avatar" || variant === "ride";
  const kind = presentation || (variant === "ride" ? "figure" : "portrait");
  const avatar = kind === "portrait";
  const role = legacy ? undefined : variant;
  const roleAsset = role ? VESPI_ROLE_ASSETS[role][kind] : undefined;
  const asset = roleAsset || (avatar ? PORTRAIT : FIGURE);
  return <img
    data-vespi={avatar ? "avatar" : "ride"}
    data-vespi-role={role}
    data-vespi-fallback={role && !roleAsset ? "approved-original" : undefined}
    src={asset.src}
    srcSet={asset.srcSet}
    sizes={sizes || (avatar ? "48px" : "(max-width: 600px) 120px, 240px")}
    width={asset.width}
    height={asset.height}
    alt={alt}
    aria-hidden={alt === "" ? true : undefined}
    className={className}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
    draggable={false}
  />;
}

/** Compact identity inside an assistant control or chat header. */
export function VespiAvatar({ size = 24 }: { size?: 24 | 40 }) {
  return <img
    src="/mascot/handmade-v1/avatar-96.webp"
    srcSet="/mascot/handmade-v1/avatar-96.webp 96w, /mascot/handmade-v1/avatar-192.webp 192w"
    sizes={`${size}px`}
    width={size}
    height={size}
    alt=""
    aria-hidden="true"
    data-vespi-assistant-avatar
    className="block shrink-0 rounded-full object-cover"
    style={{ width: size, height: size }}
    decoding="async"
    draggable={false}
  />;
}
