import styles from "./portal-paper.module.css";
import "./zhol-fonts.css";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.paper} data-portal-editorial>
    {children}
    <svg className={styles.grain} data-portal-grain aria-hidden="true" focusable="false" width="100%" height="100%">
      <filter id="portal-paper-grain"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#portal-paper-grain)" />
    </svg>
  </div>;
}
