import { Inter, Spectral } from "next/font/google";
import styles from "./portal-paper.module.css";

// Google Fonts are emitted into the document head and served with the site.
// Spectral supplies real Cyrillic glyphs rather than mixing serif fallbacks.
const editorial = Spectral({ variable: "--font-portal-editorial", subsets: ["latin", "cyrillic"], weight: ["600", "700"], display: "swap" });
const inter = Inter({ variable: "--font-portal-interface", subsets: ["latin", "cyrillic"], display: "swap" });

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${editorial.variable} ${inter.variable} ${styles.paper}`} data-portal-editorial>
    {children}
    <svg className={styles.grain} data-portal-grain aria-hidden="true" focusable="false" width="100%" height="100%">
      <filter id="portal-paper-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#portal-paper-grain)" />
    </svg>
  </div>;
}
