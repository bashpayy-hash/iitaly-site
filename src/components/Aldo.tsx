// Альдо — маскот IItaly: бумажный самолётик Алматы → Милан, тот же мотив,
// что уже летит по карте на странице «Университеты». Появляется точечно:
// приветствие в чате, состояния загрузки, «план готов» / «документ проверен».
// Не используется в навигации, на кнопках или карточках вузов.

export type AldoPose = "flying" | "greeting" | "celebrating";

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
    pose === "flying" ? "Альдо летит" : pose === "greeting" ? "Альдо здоровается" : "Альдо празднует";

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label} className={className}>
      {pose === "flying" && (
        <g className={animate ? "aldo-bob" : ""} style={{ transformOrigin: "100px 100px" }}>
          <g opacity="0.3" stroke="var(--color-ink-soft)" strokeWidth="3" strokeLinecap="round">
            <line x1="20" y1="172" x2="46" y2="158" />
            <line x1="12" y1="152" x2="36" y2="140" />
          </g>
          <g transform="rotate(-10 100 100)">
            <path
              d="M100,30 L175,150 L100,118 L25,150 Z"
              fill="var(--color-red)"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M100,30 L100,118 L25,150 Z"
              fill="var(--color-red-deep)"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <line x1="100" y1="30" x2="100" y2="150" stroke="var(--color-ink)" strokeWidth="3" />
            <circle cx="87" cy="93" r="5.5" fill="var(--color-ink)" />
            <circle cx="113" cy="93" r="5.5" fill="var(--color-ink)" />
            <path
              d="M89,107 Q100,116 111,107"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        </g>
      )}

      {pose === "greeting" && (
        <g>
          <ellipse cx="103" cy="172" rx="58" ry="8" fill="var(--color-ink)" opacity="0.14" />
          <path
            d="M104,24 L172,148 L104,120 Z"
            fill="var(--color-red)"
            stroke="var(--color-ink)"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <line x1="104" y1="24" x2="104" y2="120" stroke="var(--color-ink)" strokeWidth="3" />
          <g className={animate ? "aldo-wave" : ""} style={{ transformOrigin: "104px 120px" }}>
            <path
              d="M104,24 L104,120 L38,148 Z"
              fill="var(--color-red-deep)"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinejoin="round"
              transform="rotate(-48 104 120)"
            />
          </g>
          <circle cx="92" cy="88" r="5.5" fill="var(--color-ink)" />
          <circle cx="114" cy="88" r="5.5" fill="var(--color-ink)" />
          <path
            d="M93,102 Q104,111 115,102"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
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
          <g transform="rotate(14 100 100)">
            <path
              d="M100,22 L172,146 L100,116 L28,146 Z"
              fill="var(--color-red)"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <path
              d="M100,22 L100,116 L28,146 Z"
              fill="var(--color-red-deep)"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <line x1="100" y1="22" x2="100" y2="146" stroke="var(--color-ink)" strokeWidth="3" />
            <path
              d="M78,86 Q86,76 94,86"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M106,86 Q114,76 122,86"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M82,100 Q100,116 118,100"
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        </g>
      )}
    </svg>
  );
}
