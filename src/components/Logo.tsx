// Логотип IItaly — Альдо теперь в форме фарфалле ("бабочки"): один
// силуэт-бабочка, пинч по центру сверху и снизу, крылья расширяются
// влево-вправо — читается как бабочка/бантик даже в 16px, силуэт без
// цвета всё ещё узнаваем.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className}>
      <path
        d="M8,12 Q16,10 22,19 Q28,10 36,12 Q40,22 36,32 Q28,34 22,25 Q16,34 8,32 Q4,22 8,12 Z"
        fill="#e3a940"
        stroke="#211a14"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="20" r="2.3" fill="#211a14" />
      <circle cx="29" cy="20" r="2.3" fill="#211a14" />
      <circle cx="14.2" cy="19.1" r="0.65" fill="#fffdf8" />
      <circle cx="28.2" cy="19.1" r="0.65" fill="#fffdf8" />
      <path d="M17,25.5 Q22,28.5 27,25.5" stroke="#211a14" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </svg>
  );
}
