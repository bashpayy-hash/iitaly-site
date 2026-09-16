import { AppleButtonLink } from "@/components/apple/Button";
import { AppleEyebrow } from "@/components/apple/Typography";

/**
 * Ночная полоса — вторая и последняя иллюстрация главной.
 *
 * Тот же Дуомо, что и в светлой полосе выше, но с другого расстояния и в
 * другое время суток: там мы смотрим на город днём, здесь — на золотую
 * Мадоннину над спящим Миланом. Один мотив в двух состояниях держит
 * страницу вместе; два разных мотива развалили бы её на коллаж.
 *
 * Золото здесь — не третий цвет действия, а источник света: оно светится
 * в одной точке кадра и нигде больше не встречается в этой секции.
 * Кнопка остаётся белой (максимальный контраст на тёмном), rosso в
 * обсидиановой полосе не появляется вовсе — на таком фоне он глухой.
 *
 * Эта же полоса закрывает тему «после визы»: кабинет ведёт первые недели
 * в Италии. Отдельной тёмной полосы под кабинет нет намеренно — две
 * тёмные секции подряд превратили бы низ страницы в провал.
 */
export function BandNight() {
  return (
    <section className="relative isolate overflow-hidden bg-obsidian">
      <svg
        aria-hidden
        viewBox="0 0 1440 520"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 -z-10 h-full w-full"
      >
        <defs>
          <radialGradient id="night-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#e2b441" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#e2b441" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#e2b441" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="night-air" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b1a1f" />
            <stop offset="70%" stopColor="#121214" />
            <stop offset="100%" stopColor="#0f1011" />
          </linearGradient>
        </defs>

        <rect width="1440" height="520" fill="url(#night-air)" />
        {/* Свечение вокруг статуи — единственный источник света в кадре. */}
        <ellipse cx="1090" cy="150" rx="330" ry="240" fill="url(#night-glow)" />

        {/* Дальние крыши: почти неотличимы от неба, дают только линию
           города, чтобы статуя не висела в пустоте. */}
        <g fill="#191a1d">
          <path d="M0 470 L120 470 L120 430 L250 430 L250 470 L430 470 L430 446 L620 446 L620 520 L0 520 Z" />
          <path d="M1240 520 L1240 452 L1340 452 L1340 424 L1440 424 L1440 520 Z" />
        </g>

        {/* Шпили собора — тёмный силуэт, снизу вверх к статуе. */}
        <g fill="#141518">
          <path d="M760 520 L760 330 L1000 250 L1240 330 L1240 520 Z" />
          {Array.from({ length: 11 }, (_, i) => {
            const x = 790 + i * 42;
            const h = 96 - Math.abs(i - 5) * 11;
            return (
              <path
                key={x}
                d={`M${x - 8} 340 L${x - 8} ${340 - h * 0.45} L${x} ${340 - h} L${x + 8} ${340 - h * 0.45} L${x + 8} 340 Z`}
              />
            );
          })}
          <path d="M1074 262 L1074 190 L1090 120 L1106 190 L1106 262 Z" />
        </g>

        {/* Мадоннина. Фигура условная — силуэт в рост с воздетыми руками,
           не портрет: на 40px высоты любая деталь превращается в шум. */}
        <g fill="#e2b441">
          <circle cx="1090" cy="62" r="9" />
          <path d="M1090 72 C1080 72 1074 80 1074 92 L1074 118 L1106 118 L1106 92 C1106 80 1100 72 1090 72 Z" />
          <path d="M1076 86 L1058 62" stroke="#e2b441" strokeWidth="5" strokeLinecap="round" />
          <path d="M1104 86 L1122 62" stroke="#e2b441" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>

      <div className="mx-auto max-w-[1180px] px-5 py-20 sm:py-28">
        <div className="max-w-[32rem]">
          <AppleEyebrow as="p" className="text-ash-dark">
            Виза и первые недели
          </AppleEyebrow>
          <h2 className="mt-4 font-apple-display font-light text-[34px] leading-[1] text-white sm:text-[52px]">
            Виза — не финал
          </h2>
          <p className="mt-5 max-w-[26rem] font-apple-text text-apple-body text-ash-dark">
            Досье на визу D собираем заранее, а после прилёта кабинет ведёт
            дальше: codice fiscale, kit giallo, приём в Questura — что, когда
            и к какому сроку.
          </p>
          <AppleButtonLink
            href="/guides"
            variant="inverted"
            className="mt-8 px-8"
          >
            Гайды и виза
          </AppleButtonLink>
        </div>
      </div>
    </section>
  );
}
