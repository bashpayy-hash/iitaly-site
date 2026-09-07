// Логотип IItaly — Альдо в форме фарфалле, с лёгкой детализацией (брови,
// защипы по краю крыльев) поверх "радикально простого" силуэта — по
// запросу заказчика чуть богаче на вид. На 16px эти штрихи сливаются с
// контуром, так что мелкий фавикон не страдает от них.
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
      <g stroke="#211a14" strokeWidth="1" opacity="0.5" strokeLinecap="round">
        <line x1="6.5" y1="17" x2="8.5" y2="19" />
        <line x1="6.5" y1="25" x2="8.5" y2="27" />
        <line x1="35.5" y1="17" x2="33.5" y2="19" />
        <line x1="35.5" y1="25" x2="33.5" y2="27" />
      </g>
      <path d="M12,16.5 Q15,14 18,16.5" fill="none" stroke="#211a14" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M26,16.5 Q29,14 32,16.5" fill="none" stroke="#211a14" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="15" cy="20" r="2.3" fill="#211a14" />
      <circle cx="29" cy="20" r="2.3" fill="#211a14" />
      <circle cx="14.2" cy="19.1" r="0.65" fill="#fffdf8" />
      <circle cx="28.2" cy="19.1" r="0.65" fill="#fffdf8" />
      <path d="M17,25.5 Q22,28.5 27,25.5" stroke="#211a14" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </svg>
  );
}
