import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-ink px-5 py-9 text-cream/70">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <b className="text-cream uppercase">IItaly</b>
          <span className="ml-2">ИИ-сервис поступления · Казахстан</span>
        </div>
        <p className="max-w-xl text-cream/50">
          База: правила приёма 2026/27 (MUR, CIMEA, bando регионов). Ответы ИИ
          могут содержать ошибки — критичное проверяет эксперт.
        </p>
        <Link href="/privacy" className="underline underline-offset-4">
          Политика конфиденциальности
        </Link>
      </div>
    </footer>
  );
}
