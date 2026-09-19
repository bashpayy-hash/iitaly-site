import Link from "next/link";

/**
 * Apple footer: плоский, тёмный, типографический — без бумаги, без купола,
 * без карточек. Рендерится на каждой странице, включая /universities (см.
 * Header.tsx — то же решение и то же обоснование).
 */
export function Footer() {
  return (
    <footer className="mt-auto bg-carbon px-5 pt-10 pb-6 text-ash">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-start justify-between gap-6 border-b border-smoke pb-8">
        <div>
          <b className="font-apple-text text-[14px] font-semibold text-frost">IITALY</b>
          <p className="mt-1 max-w-xs text-[12px] leading-relaxed text-ash">
            ИИ-сервис поступления в университеты Италии · Казахстан
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-[12px] sm:grid-cols-4">
          <Link href="/plan" className="text-ash hover:text-frost">Мой план</Link>
          <Link href="/prices" className="text-ash hover:text-frost">Цены</Link>
          <Link href="/guides" className="text-ash hover:text-frost">Гайды и виза</Link>
          <Link href="/universities" className="text-ash hover:text-frost">Университеты</Link>
        </nav>
      </div>
      <div className="mx-auto mt-6 flex max-w-[1440px] flex-wrap items-center justify-between gap-3 text-[12px] text-cloud-meta">
        <p className="max-w-xl">
          База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ
          могут содержать ошибки — критичное проверяет эксперт.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="underline underline-offset-4 hover:text-frost">
            Условия сервиса
          </Link>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-frost">
            Политика конфиденциальности
          </Link>
        </div>
      </div>
    </footer>
  );
}
