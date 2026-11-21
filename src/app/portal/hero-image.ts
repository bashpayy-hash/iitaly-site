/* Картинка шапки кабинета — в одном месте для двух потребителей: сам <img>
   в PortalFocus и ранняя загрузка в page.tsx. Кабинет рисуется скриптами,
   поэтому без подсказки браузер узнаёт о картинке только после их запуска
   (Lighthouse, телефон, 12 Nov: 2,7 с ожидания до начала загрузки). Набор
   адресов и размеров у подсказки обязан совпадать с <picture> — иначе
   браузер скачает два разных файла.

   С 21 ноября это одна неподвижная картинка: Веспи едет нам навстречу по
   дороге Амальфи. На телефоне — свой, более близкий кадр той же картинки
   (деревня, дорога и Веспи), на планшете и шире — общий план, который сцена
   приближает сама (portal-focus.module.css: --stage-zoom). */
export const PORTAL_HERO = {
  src: "/illustrations/landscapes/amalfi-ride-1800.webp",
  srcSet: "/illustrations/landscapes/amalfi-ride-1200.webp 1200w, /illustrations/landscapes/amalfi-ride-1800.webp 1800w, /illustrations/landscapes/amalfi-ride-2324.webp 2324w",
  // The stage is 1.4 of the tile's width on a tablet and 1.15 on a desktop;
  // on a tablet most of it is under the panel, so 120vw is asked for.
  sizes: "(max-width: 1100px) 120vw, (max-width: 1360px) 115vw, 1490px",
  media: "(min-width: 641px)",
  width: 2324,
  height: 1743,
  phone: {
    src: "/illustrations/landscapes/amalfi-ride-phone-780.webp",
    srcSet: "/illustrations/landscapes/amalfi-ride-phone-780.webp 780w, /illustrations/landscapes/amalfi-ride-phone-1170.webp 1170w",
    sizes: "100vw",
    media: "(max-width: 640px)",
    width: 1170,
    height: 878,
  },
} as const;
