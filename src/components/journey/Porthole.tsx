import type { CSSProperties, ReactNode } from "react";
import styles from "./flight-cabin.module.css";

/* Иллюминатор по референсу mikes.cv, нарисованный кодом: кремовая рама,
   небо над морем облаков и шторка. Шторка поднимается вместе с реальным
   прогрессом маршрута (0–1): чем больше сделано, тем больше видно неба.
   Облака медленно плывут; при reduced motion всё неподвижно. */
export function Porthole({ open = 0, className = "", children }: { open?: number; className?: string; children?: ReactNode }) {
  const lift = Math.max(0, Math.min(1, open));
  return <div className={`${styles.porthole} ${className}`} style={{ "--porthole-open": lift } as CSSProperties} data-porthole>
    <svg className={styles.portholeArt} viewBox="0 0 240 300" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="porthole-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FBF8F2" /><stop offset="1" stopColor="#E7E0D3" />
        </linearGradient>
        <linearGradient id="porthole-bezel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCD4C6" /><stop offset="1" stopColor="#F3EEE5" />
        </linearGradient>
        <linearGradient id="porthole-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A8C9F7" />
          <stop offset=".58" stopColor="#E3E8EA" /><stop offset="1" stopColor="#F7F4EC" />
        </linearGradient>
        <radialGradient id="porthole-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFFDF5" stopOpacity=".9" /><stop offset="1" stopColor="#FFFDF5" stopOpacity="0" />
        </radialGradient>
        <clipPath id="porthole-glass"><rect x="36" y="36" width="168" height="228" rx="84" /></clipPath>
      </defs>
      <rect width="240" height="300" rx="120" fill="url(#porthole-frame)" />
      <rect x="13" y="13" width="214" height="274" rx="107" fill="none" stroke="#E2DACC" strokeWidth="1.2" />
      <rect x="26" y="26" width="188" height="248" rx="94" fill="url(#porthole-bezel)" />
      <g clipPath="url(#porthole-glass)">
        <rect x="36" y="36" width="168" height="228" fill="url(#porthole-sky)" />
        <circle cx="150" cy="104" r="62" fill="url(#porthole-sun)" />
        <g className={styles.cloudsFar} fill="#FFFFFF" opacity=".55">
          <ellipse cx="70" cy="168" rx="46" ry="7" /><ellipse cx="168" cy="160" rx="38" ry="5" /><ellipse cx="120" cy="178" rx="64" ry="8" />
        </g>
        <g className={styles.cloudsNear} fill="#FFFFFF">
          <ellipse cx="44" cy="214" rx="40" ry="20" /><ellipse cx="86" cy="204" rx="34" ry="22" /><ellipse cx="128" cy="210" rx="38" ry="20" />
          <ellipse cx="172" cy="202" rx="36" ry="22" /><ellipse cx="214" cy="212" rx="34" ry="18" /><ellipse cx="20" cy="232" rx="40" ry="20" />
          <rect x="0" y="216" width="260" height="60" />
          <ellipse cx="104" cy="226" rx="54" ry="12" fill="#E3E8EA" /><ellipse cx="186" cy="232" rx="44" ry="10" fill="#E3E8EA" />
        </g>
        <path d="M60 60 L112 40 L58 250 L44 236 Z" fill="#FFFFFF" opacity=".12" />
        <g className={styles.shade}>
          <rect x="30" y="-90" width="180" height="214" fill="#F2EDE4" />
          <rect x="30" y="118" width="180" height="8" rx="4" fill="#DDD5C7" />
          <rect x="108" y="122" width="24" height="5" rx="2.5" fill="#C9C0B0" />
        </g>
      </g>
      <rect x="36" y="36" width="168" height="228" rx="84" fill="none" stroke="#C9C0B1" strokeOpacity=".7" strokeWidth="2" />
    </svg>
    {children}
  </div>;
}
