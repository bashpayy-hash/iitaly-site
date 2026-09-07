// Логотип IItaly — портрет Альдо (паста-ракушка в поварском колпаке),
// срисован с референсного character sheet, минимально упрощён под
// значок: убраны руки/ноги/постамент, оставлены форма ракушки с
// рёбрами, колпак, глаза-пуговки и румянец — то, что держит узнаваемость
// даже на 16px.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className}>
      <path
        d="M22,10 C14,12 9,18 9,24 C9,31 14,38 22,40 C30,38 35,31 35,24 C35,18 30,12 22,10 Z"
        fill="#e3a940"
        stroke="#211a14"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse cx="22" cy="24" rx="6.6" ry="13.6" fill="#f6e2b8" />
      <path d="M18.3,16.5 Q20,24 18.3,32.5" stroke="#dfc48a" strokeWidth="1" fill="none" opacity="0.9" />
      <path d="M25.7,16.5 Q24,24 25.7,32.5" stroke="#dfc48a" strokeWidth="1" fill="none" opacity="0.9" />
      <ellipse cx="22" cy="6" rx="8.5" ry="5.5" fill="#fffdf8" stroke="#211a14" strokeWidth="1.6" />
      <rect x="16" y="9" width="12" height="4" rx="1.6" fill="#211a14" />
      <ellipse cx="14" cy="27.5" rx="2" ry="1.3" fill="#f2a08c" opacity="0.85" />
      <ellipse cx="30" cy="27.5" rx="2" ry="1.3" fill="#f2a08c" opacity="0.85" />
      <circle cx="17.5" cy="23" r="2.5" fill="#211a14" />
      <circle cx="26.5" cy="23" r="2.5" fill="#211a14" />
      <circle cx="16.7" cy="22.1" r="0.7" fill="#fffdf8" />
      <circle cx="25.7" cy="22.1" r="0.7" fill="#fffdf8" />
      <path d="M18,29 Q22,32.5 26,29" stroke="#211a14" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
