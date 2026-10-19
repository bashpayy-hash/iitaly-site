// Логотип IItaly — колоннада/портик (классическая итальянская
// архитектура), а не персонаж: два столба под перекладиной, силуэт
// эхом читается как "II" из названия сайта. Абстрактный геометричный
// знак — без лица, без истории с маскотом.
//
// Монохромный (currentColor): раньше нёс фирменный бордовый акцент, но в
// Apple-хроме единственный хроматический цвет — синий кнопок, а логотип —
// не действие. Используется только в новом Header (см. его комментарий),
// поэтому смена цвета не задевает /universities.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden className={className} fill="currentColor">
      <rect x="8" y="8" width="28" height="7" rx="1.5" />
      <rect x="8" y="36" width="28" height="4" rx="1" />
      <rect x="12" y="15" width="7" height="21" rx="1.5" fillOpacity="0.55" />
      <rect x="25" y="15" width="7" height="21" rx="1.5" fillOpacity="0.55" />
    </svg>
  );
}
