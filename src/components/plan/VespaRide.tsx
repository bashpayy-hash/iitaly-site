import styles from "./vespa-ride.module.css";

/**
 * Полоса ожидания: пока файл читается и пока идёт сверка — веспа едет.
 *
 * Почему переделано. Веспу почти не было видно, и она дёргалась:
 *   1. Кузов уезжал вверх на половину роста. Tailwind v4 пишет
 *      `-translate-y-1/2` в свойство `translate`, а анимация покачивания —
 *      в `transform: translateY(-50%)`; браузер применяет оба, и в полосе
 *      высотой 36px оставались одни колёса.
 *   2. Картинка была <img> с SVG, внутри которого крутятся свои анимации
 *      (лента, фара, покачивание). Анимированный SVG в <img> браузер
 *      перерисовывает каждый кадр, а пока сжимается фото, главный поток
 *      занят — отсюда рывки на слабых телефонах.
 *   3. Дорога и пыль были белыми под старый тёмный фон с облаками — на
 *      светлой карточке их не видно.
 *
 * Теперь рисунок тот же (поза documents из public/mascot/source), но
 * встроен статично: без тени, которая теперь отдельный слой, и без
 * внутренних анимаций. Всё движение — transform на HTML-слоях, его ведёт
 * компоновщик, а не главный поток:
 *   .scenery — кипарисы и холмы, медленно (параллакс);
 *   .dashes  — разметка дороги, быстро;
 *   .rider   — веспа почти на месте, чуть подаётся вперёд-назад;
 *   .body    — покачивание кузова на 1,5px;
 *   .puff    — три облачка выхлопа позади заднего колеса.
 * Бесшовность: полоса пейзажа и разметки шире полосы ровно на один тайл и
 * сдвигается ровно на один тайл, поэтому повтор кадра незаметен.
 *
 * Полоса живёт только на шагах reading и checking и размонтируется вместе
 * с анимацией, когда приходит результат. При prefers-reduced-motion сцена
 * остаётся, но стоит.
 */
export function VespaRide({ text }: { text: string }) {
  return (
    <div className={styles.card}>
      <p className="text-apple-body-sm text-cloud-body">{text}</p>

      {/* aria-hidden: строка выше уже сказала всё, что нужно знать. */}
      <div aria-hidden className={styles.lane}>
        <div className={styles.scenery} />
        <div className={styles.road}>
          <div className={styles.dashes} />
        </div>
        <div className={styles.rider}>
          <span className={styles.shadow} />
          <span className={styles.puff} />
          <span className={styles.puff} />
          <span className={styles.puff} />
          <svg className={styles.body} viewBox="34 8 166 150" focusable="false">
            <circle cx="64" cy="132" r="23" fill="#211a14" />
            <circle cx="64" cy="132" r="7.5" fill="#fffdf8" />
            <circle cx="176" cy="134" r="19" fill="#211a14" />
            <circle cx="176" cy="134" r="6.5" fill="#fffdf8" />
            <path
              d="M40,120 C34,104 42,88 58,80 C70,74 86,72 100,76 C110,79 114,86 112,96 L112,112 C112,120 108,126 98,130 C82,136 58,136 46,130 C42,128 41,124 40,120 Z"
              fill="#b4262b" stroke="#211a14" strokeWidth="4" strokeLinejoin="round"
            />
            <path
              d="M108,110 L160,108 L160,120 C160,124 156,127 150,127 L114,128 C110,128 108,124 108,120 Z"
              fill="#8f1d21" stroke="#211a14" strokeWidth="4" strokeLinejoin="round"
            />
            <path
              d="M156,108 C150,90 150,70 158,54 C163,44 175,40 184,46 C193,52 196,68 194,84 C192,100 186,112 176,116 C168,119 160,116 156,108 Z"
              fill="#b4262b" stroke="#211a14" strokeWidth="4" strokeLinejoin="round"
            />
            <path d="M178,44 C177,36 174,29 168,24" stroke="#211a14" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M168,24 C161,19 152,18 145,21" stroke="#211a14" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <circle cx="145" cy="21" r="5.5" fill="#fffdf8" stroke="#211a14" strokeWidth="3" />
            <path d="M139,28 C126,26 112,25 98,22 C86,20 76,18 62,15" stroke="#211a14" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            <path d="M139,28 C126,26 112,25 98,22 C86,20 76,18 62,15" stroke="#fffdf8" strokeWidth="3.6" fill="none" strokeLinecap="round" />
            <circle cx="60" cy="14" r="3.4" fill="#b25000" stroke="#211a14" strokeWidth="1.6" />
            <circle cx="174" cy="68" r="13" fill="#fffdf8" stroke="#211a14" strokeWidth="3.5" />
            <path d="M166,68 Q174,64 182,68" stroke="#211a14" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
