// Логотип IItaly — портрет Альдо (фузилли, спиральная паста): голова
// маскота крупным планом, руки/ноги обрезаны — на 16-44px они всё равно
// не читаются, а лицо + витки на теле держат узнаваемость.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className}>
      <ellipse cx="22" cy="22" rx="11.5" ry="13" fill="#b25000" stroke="#211a14" strokeWidth="2" />
      <g stroke="#211a14" strokeWidth="0.9" opacity="0.4" fill="none" strokeLinecap="round">
        <path d="M12.5,28.5 Q22,24 31.5,19.5" />
        <path d="M11,23 Q22,18.5 33,14" />
      </g>
      <ellipse cx="22" cy="29.2" rx="5.6" ry="4.5" fill="#c97339" stroke="#211a14" strokeWidth="1.1" />
      <ellipse cx="17.2" cy="19.8" rx="3.1" ry="3.7" fill="#fffdf8" stroke="#211a14" strokeWidth="1.3" />
      <ellipse cx="26.8" cy="19.8" rx="3.1" ry="3.7" fill="#fffdf8" stroke="#211a14" strokeWidth="1.3" />
      <circle cx="17.8" cy="20.7" r="1.5" fill="#211a14" />
      <circle cx="27.5" cy="20.7" r="1.5" fill="#211a14" />
      <circle cx="17.3" cy="19.9" r="0.4" fill="#fffdf8" />
      <circle cx="26.9" cy="19.9" r="0.4" fill="#fffdf8" />
      <path d="M19.8,25.5 Q22,26.6 24.2,25.5" stroke="#211a14" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
