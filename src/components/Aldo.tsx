// Альдо — маскот IItaly: фарфалле ("бабочки", парная бабочка-паста), не
// ракушка и не самолётик — форма по прямому запросу заказчика. Силуэт с
// пинчем по центру сверху/снизу и крыльями, расширяющимися влево-вправо;
// левое/правое крыло — отдельные path с общим швом по x=100 (как раньше
// у ракушки), чтобы можно было анимировать одно крыло отдельно —
// взмах крыла у приветствия буквально "бабочка машет крылом".
// Детали (брови, румянец, блик, защипы по краю, шов по центру) добавлены
// по запросу заказчика поверх исходной "радикально простой" версии —
// каждая деталь крыла живёт внутри WingLeft/WingRight, чтобы двигаться
// вместе с крылом при взмахе/повороте, а не всплывать над ним.
// Появляется точечно: приветствие в чате, состояния загрузки, «план
// готов» / «документ проверен». Не используется в навигации, на кнопках
// или карточках вузов.

export type AldoPose = "flying" | "greeting" | "celebrating";

const WING_LEFT = "M100,86 Q73,45 36,55 Q18,100 36,145 Q73,155 100,114 L100,86 Z";
const WING_RIGHT = "M100,86 Q127,45 164,55 Q182,100 164,145 Q127,155 100,114 L100,86 Z";

function WingLeft() {
  return (
    <>
      <path d={WING_LEFT} fill="var(--color-warn-deep)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="55" cy="68" rx="9" ry="5" fill="var(--color-paper)" opacity="0.35" transform="rotate(-25 55 68)" />
      <g stroke="var(--color-ink)" strokeWidth="1.6" opacity="0.55" strokeLinecap="round">
        <line x1="26.25" y1="74.5" x2="32.25" y2="80.5" />
        <line x1="24" y1="97" x2="30" y2="103" />
        <line x1="26.25" y1="119.5" x2="32.25" y2="125.5" />
      </g>
      <path d="M56,76 Q68,68 80,76" fill="none" stroke="var(--color-ink)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="68" cy="91" r="10" fill="var(--color-ink)" />
      <circle cx="65" cy="88" r="2" fill="var(--color-paper)" />
      <ellipse cx="60" cy="112" rx="7" ry="4.5" fill="var(--color-red)" opacity="0.28" transform="rotate(-15 60 112)" />
    </>
  );
}

function WingRight() {
  return (
    <>
      <path d={WING_RIGHT} fill="var(--color-warn)" stroke="var(--color-ink)" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="145" cy="68" rx="9" ry="5" fill="var(--color-paper)" opacity="0.35" transform="rotate(25 145 68)" />
      <g stroke="var(--color-ink)" strokeWidth="1.6" opacity="0.55" strokeLinecap="round">
        <line x1="173.75" y1="74.5" x2="167.75" y2="80.5" />
        <line x1="176" y1="97" x2="170" y2="103" />
        <line x1="173.75" y1="119.5" x2="167.75" y2="125.5" />
      </g>
      <path d="M120,76 Q132,68 144,76" fill="none" stroke="var(--color-ink)" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="132" cy="91" r="10" fill="var(--color-ink)" />
      <circle cx="129" cy="88" r="2" fill="var(--color-paper)" />
      <ellipse cx="140" cy="112" rx="7" ry="4.5" fill="var(--color-red)" opacity="0.28" transform="rotate(15 140 112)" />
    </>
  );
}

function PleatMarks() {
  return (
    <>
      <g opacity="0.35" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round">
        <path d="M92,92 L80,82" />
        <path d="M108,92 L120,82" />
        <path d="M92,108 L80,118" />
        <path d="M108,108 L120,118" />
      </g>
      <line x1="100" y1="88" x2="100" y2="112" stroke="var(--color-ink)" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
    </>
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
