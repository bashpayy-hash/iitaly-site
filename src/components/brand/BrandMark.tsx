import mark from "./mark.json";

/** Shared geometry for the wordmark and social preview. App icons are exported
 * from mark.json by scripts/export-brand-assets.mjs. No raster or SVG filters. */
export function BrandMark({ className, size = 36, monochrome = false }: {
  className?: string;
  size?: number;
  monochrome?: boolean;
}) {
  return (
    <svg className={className} data-brand-mark width={size} height={size} viewBox={mark.viewBox} fill="none" aria-hidden="true" focusable="false">
      <path data-brand-fold d={mark.fold} fill={monochrome ? "currentColor" : mark.green} />
      <path data-brand-arc d={mark.arc} fill={monochrome ? "currentColor" : mark.red} />
    </svg>
  );
}
