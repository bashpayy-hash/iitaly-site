import type { ReactNode } from "react";

export function Hexagon({ active = false, className = "" }: { active?: boolean; className?: string }) {
  return <svg width="12" height="14" viewBox="0 0 12 14" className={`gallery-hex ${className}`} data-active={active} aria-hidden="true"><path d="M6 1 11 4v6l-5 3-5-3V4Z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1" /></svg>;
}
export function GalleryTitle({ children, as: Tag = "h2", className = "" }: { children: ReactNode; as?: "h1" | "h2"; className?: string }) {
  return <Tag className={`gallery-title ${className}`} data-gallery-reveal><span>{children}</span></Tag>;
}
export function Painting({ scene = "canal", className = "", eager = false }: { scene?: "canal" | "lagoon" | "square"; className?: string; eager?: boolean }) {
  const file = scene === "canal" ? "grand-canal" : scene === "lagoon" ? "lagoon" : "san-marco";
  // Public-domain original, served locally. Attribution is in /art/sources.json.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/art/canaletto-${file}.jpg`} alt="" width="1200" height="800" className={`gallery-painting ${className}`} loading={eager ? "eager" : "lazy"} decoding="async" />;
}
