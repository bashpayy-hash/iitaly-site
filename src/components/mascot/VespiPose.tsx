/* eslint-disable @next/next/no-img-element -- Local, pre-sized WebP for Next static export. */

/* Ситуационные позы Веспи (Higgsfield, gpt_image_2_5, эталон handmade-v1).
   Каждая поза закреплена за одним местом на сайте: owner. Одна и та же
   картинка не появляется в двух местах, design-vespi-unique-review это
   проверяет. Происхождение и хеши файлов: design/mascot/vespi/handmade-v2.json. */

export const VESPI_POSES = {
  "stage-start": { width: 560, height: 445, owner: "portal-focus:start" },
  "stage-education": { width: 560, height: 462, owner: "portal-focus:education12" },
  "stage-docs": { width: 560, height: 442, owner: "portal-focus:docs" },
  "stage-apply": { width: 560, height: 452, owner: "portal-focus:apply" },
  "stage-dsu": { width: 560, height: 438, owner: "portal-focus:dsu" },
  "stage-visa": { width: 560, height: 445, owner: "portal-focus:visa" },
  "stage-arrival": { width: 560, height: 470, owner: "portal-focus:arrival" },
  stamp: { width: 560, height: 429, owner: "portal-reward:step" },
  celebrate: { width: 560, height: 454, owner: "portal-reward:stage" },
  oops: { width: 560, height: 442, owner: "portal-error" },
  thinking: { width: 560, height: 432, owner: "portal-onboarding" },
  "first-plan": { width: 560, height: 443, owner: "portal-focus:empty" },
  encourage: { width: 560, height: 448, owner: "portal-focus:all-done" },
  reading: { width: 560, height: 449, owner: "guides-invite" },
} as const;

export type VespiPoseName = keyof typeof VESPI_POSES;

/** Decorative only: a pose never states a verdict, a deadline or progress. */
export function VespiPose({ pose, className = "", sizes = "(max-width: 600px) 120px, 220px", priority = false }: {
  pose: VespiPoseName;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const { width, height } = VESPI_POSES[pose];
  return <img
    className={className}
    src={`/mascot/handmade-v2/${pose}-280.webp`}
    srcSet={`/mascot/handmade-v2/${pose}-280.webp 280w, /mascot/handmade-v2/${pose}-560.webp 560w`}
    sizes={sizes}
    width={width}
    height={height}
    alt=""
    aria-hidden="true"
    data-vespi-pose={pose}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
    draggable={false}
  />;
}
