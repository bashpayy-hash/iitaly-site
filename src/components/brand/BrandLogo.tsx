import { useId } from "react";
import styles from "./brand-logo.module.css";

/** Visual wordmark only. Its containing link or labelled element owns the
 * accessible name and navigation, including the portal's in-place home action. */
export function BrandLogo({ className = "", compact = false }: {
  className?: string;
  compact?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <span
      className={`${styles.brand} ${compact ? styles.compact : ""} ${className}`}
      data-brand-logo
      aria-hidden="true"
    >
      <svg className={styles.emblem} data-brand-mark width="36" height="36" viewBox="0 0 36 36" fill="none" focusable="false">
        <defs>
          <linearGradient id={`${id}-shell`} x1="5" y1="1" x2="31" y2="36" gradientUnits="userSpaceOnUse"><stop stopColor="#E63946"/><stop offset="1" stopColor="#C81D25"/></linearGradient>
          <linearGradient id={`${id}-citrus`} x1="18" y1="6" x2="24" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#FFD166"/><stop offset="1" stopColor="#F4A261"/></linearGradient>
        </defs>
        <rect x=".5" y=".5" width="35" height="35" rx="10.5" fill={`url(#${id}-shell)`}/>
        <rect x="1" y="1" width="34" height="34" rx="10" stroke="white" strokeOpacity=".25"/>
        <path d="M19.1 15.1c1.8-.4 3.2.5 2.7 2.4l-1.8 6.7c-.3 1.2 0 1.8.9 1.8.8 0 1.5-.4 2.3-1l.8 1.7c-1.7 1.5-3.5 2.3-5.6 2.3-2.8 0-4.2-1.7-3.5-4.5l1.5-5.6c.3-1.1-.1-1.5-1.7-1.4l.4-1.6 4-.8Z" fill="#FFFDF9"/>
        <path d="M18 11.9c-.7-3.7 2.3-6.3 6.7-5.9.5 4-1.8 7.7-6.7 5.9Z" fill={`url(#${id}-citrus)`}/>
        <path d="m18.6 11 4-3" stroke="#FFFDF9" strokeOpacity=".6" strokeWidth=".7" strokeLinecap="round"/>
      </svg>
      <span className={styles.word} data-brand-word><span className={styles.initial} data-brand-initial>i</span>Italy</span>
    </span>
  );
}
