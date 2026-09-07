// Альдо — маскот IItaly: фузилли (спиральная паста), стоящий персонаж
// с руками и ногами — по образцу живых маскотов вроде Duo (Duolingo)
// или Wumpus (Discord), а не плоская форма-иконка с лицом. Тело —
// один плоский цвет с диагональными полосами-витками (штопор фузилли)
// и светлым "животом"-пятном, крупные выразительные глаза как у
// референсов. Появляется точечно: приветствие в чате, состояния
// загрузки, «план готов» / «документ проверен». Не используется в
// навигации, на кнопках или карточках вузов.

export type AldoPose = "flying" | "greeting" | "celebrating";

function Body() {
  return (
    <>
      <ellipse cx="100" cy="102" rx="52" ry="58" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="4.5" />
      <g stroke="var(--color-ink)" strokeWidth="2" opacity="0.4" fill="none" strokeLinecap="round">
        <path d="M55,130 Q100,110 145,88" />
        <path d="M50,105 Q100,85 150,63" />
        <path d="M55,78 Q100,60 145,42" />
        <path d="M58,155 Q100,138 142,118" />
      </g>
      <ellipse cx="100" cy="134" rx="26" ry="21" fill="var(--color-warn-light)" stroke="var(--color-ink)" strokeWidth="2.5" />
    </>
  );
}

function Face() {
  return (
    <>
      <ellipse cx="78" cy="90" rx="14" ry="17" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="3" />
      <ellipse cx="122" cy="90" rx="14" ry="17" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="3" />
      <circle cx="81" cy="94" r="7" fill="var(--color-ink)" />
      <circle cx="125" cy="94" r="7" fill="var(--color-ink)" />
      <circle cx="78.5" cy="90.5" r="1.8" fill="var(--color-paper)" />
      <circle cx="122.5" cy="90.5" r="1.8" fill="var(--color-paper)" />
      <path d="M90,116 Q100,121 110,116" stroke="var(--color-ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  );
}

function Legs() {
  return (
    <>
      <rect x="72" y="148" width="16" height="24" rx="8" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="3.5" />
      <rect x="112" y="148" width="16" height="24" rx="8" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="3.5" />
    </>
  );
}

function ArmLeft({ up = false }: { up?: boolean }) {
  const cx = up ? 48 : 42;
  const cy = up ? 78 : 118;
  const rotate = up ? -65 : -20;
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx="13"
      ry="20"
      fill="var(--color-warn)"
      stroke="var(--color-ink)"
      strokeWidth="3.5"
      transform={`rotate(${rotate} ${cx} ${cy})`}
    />
  );
}

function ArmRight({ up = false }: { up?: boolean }) {
  const cx = up ? 152 : 158;
  const cy = up ? 78 : 118;
  const rotate = up ? 65 : 20;
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx="13"
      ry="20"
      fill="var(--color-warn)"
      stroke="var(--color-ink)"
      strokeWidth="3.5"
      transform={`rotate(${rotate} ${cx} ${cy})`}
    />
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
          <Legs />
          <ArmLeft />
          <ArmRight />
          <Body />
          <Face />
        </g>
      )}

      {pose === "greeting" && (
        <g>
          <ellipse cx="100" cy="180" rx="55" ry="8" fill="var(--color-ink)" opacity="0.14" />
          <Legs />
          <ArmLeft />
          <g className={animate ? "aldo-wave" : ""} style={{ transformOrigin: "150px 105px" }}>
            <ArmRight />
          </g>
          <Body />
          <Face />
        </g>
      )}

      {pose === "celebrating" && (
        <g>
          <g className={animate ? "aldo-sparkle" : ""} style={{ animationDelay: "0s" }}>
            <circle cx="30" cy="45" r="6" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </g>
          <g className={animate ? "aldo-sparkle" : ""} style={{ animationDelay: "0.3s" }}>
            <circle cx="170" cy="55" r="5.5" fill="var(--color-green)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </g>
          <g className={animate ? "aldo-sparkle" : ""} style={{ animationDelay: "0.6s" }}>
            <circle cx="160" cy="140" r="5" fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </g>
          <ellipse cx="100" cy="180" rx="55" ry="8" fill="var(--color-ink)" opacity="0.14" />
          <Legs />
          <ArmLeft up />
          <ArmRight up />
          <Body />
          <Face />
        </g>
      )}
    </svg>
  );
}
