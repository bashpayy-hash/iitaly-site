import Link from "next/link";

export function Footer() {
  return (
    // Парный к верхнему куполу переход (см. page.tsx): подвал — вторая и
    // последняя настоящая смена поверхности на странице, и вход в него
    // такой же дугой. Обводки здесь нет и не нужно: чернила на кремовом
    // сами дают кромку, а линия цвета ink по краю ink-заливки невидима.
    // Верхний отступ увеличен под глубину дуги — иначе она срезала бы
    // первую строку подвала по краям.
    <footer className="relative mt-auto overflow-hidden bg-ink px-5 pt-20 pb-10 text-cream/70 [border-radius:50%_50%_0_0/2.5rem_2.5rem_0_0] sm:pt-28 sm:[border-radius:50%_50%_0_0/5.5rem_5.5rem_0_0]">
      {/* Та же бумага, что и на светлых секциях, но в screen: на чернилах
         умножение не читается. Без неё футер — единственная поверхность
         сайта, оставшаяся «цифровой». */}
      <div aria-hidden className="paper-layer paper-layer-dark pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 text-caption">
        <div>
          <b className="text-cream uppercase">IItaly</b>
          <span className="ml-2">ИИ-сервис поступления · Казахстан</span>
        </div>
        <p className="max-w-xl text-cream/50">
          База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ
          могут содержать ошибки — критичное проверяет эксперт.
        </p>
        <Link
          href="/privacy"
          className="inline-block py-2.5 underline underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-cream"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  );
}
