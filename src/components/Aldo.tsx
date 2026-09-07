// Альдо — маскот IItaly: паста-ракушка (кончильеле), а не самолётик —
// форма взята из референсов персонажа, которые прислал заказчик, но
// нарисована в фирменном плоском стиле сайта (заливки + жёсткий чёрный
// контур, без градиентов/мягких теней). Появляется точечно: приветствие
// в чате, состояния загрузки, «план готов» / «документ проверен».
// Не используется в навигации, на кнопках или карточках вузов.

export type AldoPose = "flying" | "greeting" | "celebrating";

// Общий контур ракушки: "шарнир" сверху, веерообразное тело с четырьмя
// волнами по нижнему краю — так же, как рисуют раковину гребешка.
const SHELL_LEFT =
  "M100,35 C60,42 38,80 36,125 Q42,150 55,138 Q68,158 82,140 Q100,160 100,148 L100,35 Z";
const SHELL_RIGHT =
  "M100,35 C140,42 162,80 164,125 Q158,150 145,138 Q132,158 118,140 Q100,160 100,148 L100,35 Z";

function ShellBody({ tilt = 0 }: { tilt?: number }) {
  return (
    <g transform={tilt ? `rotate(${tilt} 100 100)` : undefined}>
      <path d={SHELL_LEFT} fill="var(--color-warn-deep)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d={SHELL_RIGHT} fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <g opacity="0.5" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M100,35 Q80,90 55,138" />
        <path d="M100,35 Q120,90 145,138" />
      </g>
    </g>
  );
}

function ShellFace() {
  return (
    <>
      <circle cx="82" cy="96" r="6" fill="var(--color-ink)" />
      <circle cx="118" cy="96" r="6" fill="var(--color-ink)" />
      <path d="M84,112 Q100,122 116,112" fill="none" stroke="var(--color-ink)" strokeWidth="3.5" strokeLinecap="round" />
    </>
  );
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
          <ShellBody tilt={-6} />
          <g transform="rotate(-6 100 100)">
            <ShellFace />
          </g>
        </g>
      )}

      {pose === "greeting" && (
        <g>
          <ellipse cx="100" cy="172" rx="58" ry="8" fill="var(--color-ink)" opacity="0.14" />
          <ShellBody />
          <ShellFace />
          <g className={animate ? "aldo-wave" : ""} style={{ transformOrigin: "150px 78px" }}>
            <ellipse
              cx="152"
              cy="70"
              rx="16"
              ry="11"
              fill="var(--color-warn-light)"
              stroke="var(--color-ink)"
              strokeWidth="3.5"
            />
          </g>
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
          <ellipse
            cx="48"
            cy="68"
            rx="15"
            ry="10"
            fill="var(--color-warn-light)"
            stroke="var(--color-ink)"
            strokeWidth="3.5"
            transform="rotate(-40 48 68)"
          />
          <ellipse
            cx="152"
            cy="68"
            rx="15"
            ry="10"
            fill="var(--color-warn-light)"
            stroke="var(--color-ink)"
            strokeWidth="3.5"
            transform="rotate(40 152 68)"
          />
          <ShellBody />
          <path d="M78,90 Q86,80 94,90" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
          <path d="M106,90 Q114,80 122,90" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
          <path d="M82,110 Q100,124 118,110" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
