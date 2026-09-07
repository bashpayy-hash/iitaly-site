// Логотип IItaly — тот же Альдо (паста-ракушка), упрощённый до знака:
// без рёбер веера, которые пропадают в фавиконе на 16px, но с тем же
// двухцветным разломом по центру и точками-глазами, что и у маскота.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className}>
      <rect x="4" y="4" width="36" height="36" rx="9" fill="#211a14" />
      <rect x="1" y="1" width="36" height="36" rx="9" fill="#fffdf8" stroke="#211a14" strokeWidth="2.5" />
      <path d="M22,9 C14,10 9,17 9,25 Q9,29 13,30 Q22,33 22,26 L22,9 Z" fill="#913a00" />
      <path d="M22,9 C30,10 35,17 35,25 Q35,29 31,30 Q22,33 22,26 L22,9 Z" fill="#b25000" />
      <circle cx="18" cy="20" r="1.9" fill="#fffdf8" />
      <circle cx="26" cy="20" r="1.9" fill="#fffdf8" />
    </svg>
  );
}
