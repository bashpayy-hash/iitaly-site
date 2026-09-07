// Альдо — маскот IItaly: фарфалле ("бабочки", парная бабочка-паста), не
// ракушка и не самолётик — форма по прямому запросу заказчика. Силуэт с
// пинчем по центру сверху/снизу и крыльями, расширяющимися влево-вправо;
// левое/правое крыло — отдельные path с общим швом по x=100 (как раньше
// у ракушки), чтобы можно было анимировать одно крыло отдельно —
// взмах крыла у приветствия буквально "бабочка машет крылом".
// Появляется точечно: приветствие в чате, состояния загрузки, «план
// готов» / «документ проверен». Не используется в навигации, на кнопках
// или карточках вузов.

export type AldoPose = "flying" | "greeting" | "celebrating";

const WING_LEFT = "M100,86 Q73,45 36,55 Q18,100 36,145 Q73,155 100,114 L100,86 Z";
const WING_RIGHT = "M100,86 Q127,45 164,55 Q182,100 164,145 Q127,155 100,114 L100,86 Z";

// Глаз — часть своего крыла (а не общего лица), чтобы при взмахе/повороте
// крыла глаз двигался вместе с ним и не "всплывал" над фоном.
function WingLeft() {
  return (
    <>
      <path d={WING_LEFT} fill="var(--color-warn-deep)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="68" cy="91" r="10" fill="var(--color-ink)" />
    </>
  );
}

function WingRight() {
  return (
    <>
      <path d={WING_RIGHT} fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="132" cy="91" r="10" fill="var(--color-ink)" />
    </>
  );
}

function PleatMarks() {
  return (
    <g opacity="0.35" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
      <path d="M92,92 L80,82" />
      <path d="M108,92 L120,82" />
      <path d="M92,108 L80,118" />
      <path d="M108,108 L120,118" />
    </g>
  );
}

function Mouth() {
  return <path d="M77,116 Q100,130 123,116" fill="none" stroke="var(--color-ink)" strokeWidth="3.5" strokeLinecap="round" />;
}

export function Aldo({
  pose,
  className = "",
  animate = true,
}: {
  pose: AldoPose;
  className?: string;
  animate?: boolean;
}) {
  const label =
    pose === "flying" ? "Альдо в пути" : pose === "greeting" ? "Альдо здоровается" : "Альдо празднует";

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label} className={className}>
      {pose === "flying" && (
        <g className={animate ? "aldo-bob" : ""} style={{ transformOrigin: "100px 100px" }}>
          <g opacity="0.3" stroke="var(--color-ink-soft)" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="150" x2="42" y2="146" />
            <line x1="12" y1="132" x2="34" y2="129" />
          </g>
          <WingLeft />
          <WingRight />
          <PleatMarks />
          <Mouth />
        </g>
      )}

      {pose === "greeting" && (
        <g>
          <ellipse cx="100" cy="172" rx="58" ry="8" fill="var(--color-ink)" opacity="0.14" />
          <WingLeft />
          <g className={animate ? "aldo-wave" : ""} style={{ transformOrigin: "100px 100px" }}>
            <WingRight />
          </g>
          <PleatMarks />
          <Mouth />
        </g>
      )}

      {pose === "celebrating" && (
        <g>
          <g className={animate ? "aldo-sparkle" : ""} style={{ animationDelay: "0s" }}>
            <circle cx="36" cy="52" r="6" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </g>
          <g className={animate ? "aldo-sparkle" : ""} style={{ animationDelay: "0.3s" }}>
            <circle cx="164" cy="66" r="5.5" fill="var(--color-green)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </g>
          <g className={animate ? "aldo-sparkle" : ""} style={{ animationDelay: "0.6s" }}>
            <circle cx="156" cy="134" r="5" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </g>
          <g transform="rotate(-10 100 100)">
            <WingLeft />
          </g>
          <g transform="rotate(10 100 100)">
            <WingRight />
          </g>
          <PleatMarks />
          <Mouth />
        </g>
      )}
    </svg>
  );
}
