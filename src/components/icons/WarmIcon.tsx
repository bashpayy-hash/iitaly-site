/* Тёплые иконки (owner, 6 Nov: «иконки выглядят топорно… найди золотую
   середину, один дизайн-код, с упором на реализм, но не до конца»).
   Маленькие версии вещей сайта (design/illustrations/objects-2026-11-04.json):
   тот же свет сверху слева, бумага, крафт, латунь, терракота, бутылочно-
   зелёный и мягкая тень под предметом — но плоскими слоями, чтобы читаться
   с 16px. Без градиентов с id: на странице иконок много, и одинаковые id
   были бы ошибкой разметки. Иконки всегда декоративные (aria-hidden): смысл
   несёт текст рядом.
   Значки управления (поиск, закрыть, пауза, настройки, плюс) остаются
   тонкими линиями — это кнопки, а не предметы. */

export type WarmIconName = "calendar" | "clock" | "info" | "pin" | "check" | "lock" | "folder" | "doc";

const PAPER = "#FBF6EC";
const PAPER_EDGE = "#D8C9B1";
const BRASS = "#C9A35B";
const BRASS_DARK = "#9C7A3C";
const TERRACOTTA = "#C2402F";
const TERRACOTTA_DARK = "#9E3122";
const OXBLOOD = "#7A2A24";
const INK = "#2A2420";
const GREEN = "#2F7A55";
const GREEN_DARK = "#235C40";
const KRAFT = "#D2A877";
const KRAFT_DARK = "#B48653";

function Shadow({ cx = 12, cy = 21.4, rx = 7 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={1.15} fill={INK} opacity={0.13} />;
}

const DRAW: Record<WarmIconName, React.ReactNode> = {
  // Отрывной календарик: бумага, терракотовая шапка, два латунных кольца, отмеченный день.
  calendar: <>
    <Shadow />
    <rect x="3.6" y="5" width="16.8" height="15.4" rx="3" fill={PAPER} stroke={PAPER_EDGE} strokeWidth=".8" />
    <path d="M3.6 8a3 3 0 0 1 3-3h10.8a3 3 0 0 1 3 3v2H3.6Z" fill={TERRACOTTA} />
    <path d="M3.6 9.3h16.8V10H3.6Z" fill={TERRACOTTA_DARK} opacity=".55" />
    <path d="M5.2 6.2h7" stroke="#fff" strokeOpacity=".35" strokeWidth=".9" strokeLinecap="round" />
    <rect x="7.4" y="2.8" width="1.9" height="4.4" rx=".95" fill={BRASS} />
    <rect x="14.7" y="2.8" width="1.9" height="4.4" rx=".95" fill={BRASS} />
    <path d="M7.9 3.4v2.6M15.2 3.4v2.6" stroke="#fff" strokeOpacity=".5" strokeWidth=".55" strokeLinecap="round" />
    {[7.6, 12, 16.4].map(x => <circle key={`a${x}`} cx={x} cy="13.4" r=".95" fill={PAPER_EDGE} />)}
    <circle cx="7.6" cy="17" r=".95" fill={PAPER_EDGE} />
    <circle cx="12" cy="17" r="1.55" fill={TERRACOTTA} />
    <circle cx="16.4" cy="17" r=".95" fill={PAPER_EDGE} />
  </>,
  // Будильник, как у вещи «alarm»: кремовый циферблат, латунный обод и колокольчики.
  clock: <>
    <Shadow rx={6} />
    <path d="M6.3 20.6 7.6 18.6M17.7 20.6l-1.3-2" stroke={BRASS_DARK} strokeWidth="1.2" strokeLinecap="round" />
    <path d="M4 7.6a3.3 3.3 0 0 1 4.6-4.1Z" fill={BRASS} />
    <path d="M20 7.6a3.3 3.3 0 0 0-4.6-4.1Z" fill={BRASS} />
    <circle cx="12" cy="12.6" r="7.6" fill={BRASS} />
    <circle cx="12" cy="12.6" r="6.3" fill={PAPER} />
    <path d="M7.4 10.2a5.2 5.2 0 0 1 3.4-2.7" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".9" />
    <path d="M12 12.6V8.9" stroke={INK} strokeWidth="1.35" strokeLinecap="round" />
    <path d="M12 12.6l2.9 1.6" stroke={TERRACOTTA} strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="12" cy="12.6" r=".95" fill={INK} />
  </>,
  // Бумажный жетон с латунным ободом и буквой «i» цвета сургуча.
  info: <>
    <circle cx="12" cy="12" r="9.2" fill={BRASS} />
    <circle cx="12" cy="12" r="7.9" fill="#F4EADB" />
    <path d="M6.6 9.4a6 6 0 0 1 4.2-3.3" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity=".85" />
    <circle cx="12" cy="8.4" r="1.35" fill={OXBLOOD} />
    <rect x="10.9" y="10.6" width="2.2" height="6.6" rx="1.1" fill={OXBLOOD} />
  </>,
  // Терракотовая булавка карты с бумажной серединкой.
  pin: <>
    <Shadow rx={3.6} cy={21.6} />
    <path d="M12 21.2c-.4 0-6.8-6.4-6.8-11.2a6.8 6.8 0 0 1 13.6 0c0 4.8-6.4 11.2-6.8 11.2Z" fill={TERRACOTTA} />
    <path d="M12 21.2c3-3.2 6.8-7.4 6.8-11.2A6.8 6.8 0 0 0 14 3.6c2.6 1.6 3.4 4 3.4 6.4 0 3.8-3.4 8-5.4 11.2Z" fill={TERRACOTTA_DARK} opacity=".55" />
    <circle cx="12" cy="9.9" r="2.6" fill={PAPER} />
    <path d="M7.6 7.6a5 5 0 0 1 2.8-3" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55" />
  </>,
  // Зелёная печать «готово»: как сургуч, со светлой галочкой.
  check: <>
    <circle cx="12" cy="12" r="9.2" fill={GREEN_DARK} />
    <circle cx="12" cy="11.6" r="8.4" fill={GREEN} />
    <path d="M6.9 9.2a5.6 5.6 0 0 1 3.6-3.1" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" opacity=".4" />
    <path d="m8 12.1 2.7 2.7L16.2 9" stroke={PAPER} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>,
  // Латунный навесной замок.
  lock: <>
    <Shadow rx={6} />
    <path d="M8 10.4V8a4 4 0 0 1 8 0v2.4" stroke={BRASS_DARK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <rect x="5" y="10" width="14" height="10.6" rx="2.6" fill={BRASS} />
    <path d="M5 17.6h14v.4a2.6 2.6 0 0 1-2.6 2.6H7.6A2.6 2.6 0 0 1 5 18Z" fill={BRASS_DARK} opacity=".45" />
    <path d="M6.8 12h4" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55" />
    <circle cx="12" cy="14.6" r="1.5" fill="#5E4520" />
    <path d="M11.4 15.2h1.2l.3 2.4h-1.8Z" fill="#5E4520" />
  </>,
  // Крафтовая папка с красной резинкой, как у вещи «folder».
  folder: <>
    <Shadow rx={8} />
    <path d="M3 7.2A2.2 2.2 0 0 1 5.2 5h4l1.8 1.8h7.8A2.2 2.2 0 0 1 21 9v9.2a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 18.2Z" fill={KRAFT_DARK} />
    <path d="M3 10.2A2.2 2.2 0 0 1 5.2 8h13.6A2.2 2.2 0 0 1 21 10.2v8a2.2 2.2 0 0 1-2.2 2.2H5.2A2.2 2.2 0 0 1 3 18.2Z" fill={KRAFT} />
    <path d="M4.8 9.6h7" stroke="#fff" strokeWidth=".9" strokeLinecap="round" opacity=".4" />
    <path d="M16.6 8v12.4" stroke={TERRACOTTA} strokeWidth="1.5" />
  </>,
  // Лист бумаги с загнутым углом и строками.
  doc: <>
    <Shadow rx={6} />
    <path d="M6 4.6A1.8 1.8 0 0 1 7.8 2.8h6.6l4.2 4.2v12a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 19Z" fill={PAPER} stroke={PAPER_EDGE} strokeWidth=".8" />
    <path d="M14.4 2.8V5.4A1.6 1.6 0 0 0 16 7h2.6Z" fill={PAPER_EDGE} />
    <path d="M8.8 10.4h6.4M8.8 13.2h6.4M8.8 16h4" stroke={PAPER_EDGE} strokeWidth="1.1" strokeLinecap="round" />
    <path d="M8.8 10.4h3" stroke={TERRACOTTA} strokeWidth="1.1" strokeLinecap="round" />
  </>,
};

export function WarmIcon({ name, size = 18, className }: { name: WarmIconName; size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" data-warm-icon={name}>{DRAW[name]}</svg>;
}
