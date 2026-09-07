// Логотип IItaly — портрет Альдо (паста-ракушка в колпаке), сведён к
// минимуму по принципам хороших маскотов (Duo, Snoo, Wumpus): один
// плоский силуэт, 2–3 цвета, одна отличительная деталь (колпак) вместо
// слоёв декора. Прежняя версия с внутренней "полостью" ракушки и рёбрами
// была визуально шумной и плохо читалась мелко — здесь всё держится на
// форме + двух глазах, силуэт узнаваем даже монохромным.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className}>
      <path
        d="M22,10 C14,12 9,18 9,24 C9,31 14,38 22,40 C30,38 35,31 35,24 C35,18 30,12 22,10 Z"
        fill="#e3a940"
        stroke="#211a14"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <ellipse cx="22" cy="7" rx="8" ry="5" fill="#fffdf8" stroke="#211a14" strokeWidth="2" />
      <path d="M14,10.5 Q22,13.5 30,10.5" fill="none" stroke="#211a14" strokeWidth="2" strokeLinecap="round" />
      <circle cx="17.5" cy="23" r="2.6" fill="#211a14" />
      <circle cx="26.5" cy="23" r="2.6" fill="#211a14" />
      <circle cx="16.6" cy="22" r="0.75" fill="#fffdf8" />
      <circle cx="25.6" cy="22" r="0.75" fill="#fffdf8" />
      <path d="M18,29 Q22,32 26,29" stroke="#211a14" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
