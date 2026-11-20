/* Картинка шапки кабинета — в одном месте для двух потребителей: сам <img>
   в PortalFocus и ранняя загрузка в page.tsx. Кабинет рисуется скриптами,
   поэтому без подсказки браузер узнаёт о картинке только после их запуска
   (Lighthouse, телефон, 12 Nov: 2,7 с ожидания до начала загрузки). Набор
   адресов и размеров у подсказки обязан совпадать с <img> — иначе браузер
   скачает два разных файла. */
export const PORTAL_HERO = {
  src: "/illustrations/landscapes/amalfi-1600.webp",
  srcSet: "/illustrations/landscapes/amalfi-960.webp 960w, /illustrations/landscapes/amalfi-1600.webp 1600w, /illustrations/landscapes/amalfi-2176.webp 2176w",
  sizes: "(max-width: 1360px) 100vw, 1296px",
} as const;
