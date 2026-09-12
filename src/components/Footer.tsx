import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink px-5 py-10 text-cream/70">
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
