"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { EditorialBackground } from "@/components/EditorialBackground";
import { RouteRibbon } from "@/components/RouteRibbon";

const ROUTE_STOPS = ["Казахстан", "Выбор программы", "Документы", "Италия"];

/**
 * Полноценный экран входа: слева (сверху на мобильном, компактно) —
 * атмосферная панель с обезличенным маршрутом, справа — форма на
 * непрозрачной paper-поверхности. Раньше это был короткий одноколоночный
 * блок без всякого фона — выглядел незавершённым, будто страницу не
 * успели доделать.
 */
export function PortalLogin({
  onSubmit,
  error,
}: {
  onSubmit: (surname: string, code: string) => void | Promise<void>;
  error: string | null;
}) {
  const router = useRouter();
  const [surname, setSurname] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (surname.trim().length < 2) {
      setLocalError("Введи фамилию, как при оформлении.");
      return;
    }
    if (code.trim().length < 4) {
      setLocalError("Введи код брони из WhatsApp.");
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit(surname.trim(), code.trim().toUpperCase());
    } finally {
      setSubmitting(false);
    }
  }

  const shownError = localError || error;

  return (
    <section className="relative grid min-h-[70vh] grid-cols-1 lg:min-h-[78vh] lg:grid-cols-2">
      {/* Атмосферная панель: обезличенный маршрут КЗ → программа → документы → Италия. */}
      <div className="relative flex h-56 flex-col justify-between overflow-hidden border-b-2 border-ink bg-ink px-6 py-8 sm:h-64 sm:px-10 lg:h-auto lg:border-r-2 lg:border-b-0 lg:px-12 lg:py-14">
        <EditorialBackground
          variant="portal"
          watermark="4"
          watermarkPosition="top-right"
          watermarkTone="cream"
          intensity={1.4}
        />
        <RouteRibbon className="opacity-20" />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.16em] text-cream/60 uppercase">Личный кабинет</p>
          <p className="mt-2 max-w-xs font-display text-heading font-bold text-cream text-balance">
            Маршрут поступления — по шагам
          </p>
        </div>

        <ol className="relative flex items-start justify-between gap-2">
          {ROUTE_STOPS.map((stop, i) => (
            <li key={stop} className="flex flex-1 flex-col items-center text-center last:flex-none">
              <div className="flex w-full items-center">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-cream/70 font-mono text-[10px] font-bold text-cream"
                >
                  {i + 1}
                </span>
                {i < ROUTE_STOPS.length - 1 && <span aria-hidden className="h-px flex-1 bg-cream/25" />}
              </div>
              <span className="mt-2 max-w-[9ch] text-[11px] leading-tight text-cream/70">{stop}</span>
            </li>
          ))}
        </ol>

        <p className="relative hidden max-w-sm text-sm text-cream/60 lg:block">
          В кабинете — маршрут по шагам, дедлайны с напоминаниями и проверка
          документов до подачи.
        </p>
      </div>

      {/* Форма — на непрозрачной paper-поверхности, не glassmorphism. */}
      <div className="flex items-center justify-center bg-cream px-5 py-12 sm:py-16">
        <div className="w-full max-w-[420px]">
          <h1 className="font-display text-title font-bold text-ink uppercase text-balance">Вход</h1>
          <p className="mt-3 text-sm text-ink-soft">
            Проверка брони: фамилия и код, который пришёл в WhatsApp после
            оплаты.
          </p>

          <div className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-ink uppercase">
                Фамилия
              </span>
              <input
                value={surname}
                onChange={(e) => {
                  setSurname(e.target.value);
                  setLocalError(null);
                }}
                placeholder="Как в форме оплаты"
                autoComplete="family-name"
                aria-invalid={!!shownError || undefined}
                className="w-full rounded-md border-2 border-ink bg-paper px-4 py-3 text-sm font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-ink uppercase">
                Код брони
              </span>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setLocalError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Например, ABCD-1234"
                autoComplete="off"
                aria-invalid={!!shownError || undefined}
                className="w-full rounded-md border-2 border-ink bg-paper px-4 py-3 text-sm font-semibold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              />
              <span className="mt-1.5 block text-xs text-ink-soft">Приходит в WhatsApp сразу после оплаты.</span>
            </label>

            {shownError && (
              <div role="alert" className="rounded-md border-2 border-red bg-red/5 px-4 py-3 text-sm font-semibold text-red">
                {shownError}
              </div>
            )}

            <Button type="button" variant="primary" onClick={submit} loading={submitting} className="w-full">
              {submitting ? "Проверяю…" : "Войти"}
            </Button>
          </div>

          <p className="mt-5 text-sm text-ink-soft">
            Ещё нет кода?{" "}
            <button type="button" onClick={() => router.push("/prices")} className="font-semibold text-red underline underline-offset-4">
              Посмотреть тарифы
            </button>{" "}
            — кабинет открывается сразу после оплаты.
          </p>
        </div>
      </div>
    </section>
  );
}
