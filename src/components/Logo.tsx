// Логотип IItaly — тот же Альдо (бумажный самолётик), упрощённый до знака:
// без тонких линий сгиба и рта, которые пропадают в фавиконе на 16px.
// Две точки-глаза достаточно, чтобы знак читался как персонаж, а не просто
// треугольник — и совпадал с маскотом, который уже есть на сайте.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className}>
      <rect x="4" y="4" width="36" height="36" rx="9" fill="#211a14" />
      <rect x="1" y="1" width="36" height="36" rx="9" fill="#fffdf8" stroke="#211a14" strokeWidth="2.5" />
      <path d="M22,9 L35,33 L22,27 Z" fill="#b4262b" />
      <path d="M22,9 L22,27 L9,33 Z" fill="#8f1e22" />
      <circle cx="18" cy="23" r="2.1" fill="#fffdf8" />
      <circle cx="26" cy="23" r="2.1" fill="#fffdf8" />
    </svg>
  );
}
