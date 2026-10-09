"use client";

import { useState } from "react";
import { VISA_GUARANTEE_LABEL } from "@/data/changes2026";
import { SourceRefs } from "@/components/SourceRefs";
import { ADMISSION_SOURCES } from "@/data/admissions";
import {
  VG_PER_YEAR,
  VISA_DOCS,
  VISA_KEY_FACTS,
  VISA_REJECT_REASONS,
  VISA_TIMELINE,
} from "@/data/guides";

function VisaAccordion({
  summary,
  defaultOpen = false,
  children,
}: {
  summary: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border border-white/15">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
        {summary}
        <svg
          aria-hidden
          viewBox="0 0 16 10"
          className="h-2.5 w-4 shrink-0 text-cloud-meta transition-transform duration-200 group-open:-rotate-180"
        >
          <path d="M1 1.5 8 8.5 15 1.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-white/10 px-4 pt-4 pb-4">{children}</div>
    </details>
  );
}

export function VisaSection() {
  return (
    <div>
      <p className="text-apple-body-sm text-cloud-white">
        <span className="text-cloud-meta">Где подавать: </span>
        <a href={ADMISSION_SOURCES.visaWhere.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Официальный VFS для Италии в Казахстане</a>
      </p>
      <p className="mt-2 text-apple-body-sm text-cloud-body">
        Университет, консульство и стипендиальный орган проверяют разные
        условия. Начни с своего учебного года и официального чек-листа.
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {VISA_KEY_FACTS.map((f) => (
          <div key={f.label} className="border border-white/15 px-3 py-3 text-center">
            <b className="block font-apple-display text-apple-subheading font-semibold text-cloud-white">{f.value}</b>
            <span className="text-apple-caption text-cloud-meta">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        <VisaAccordion defaultOpen summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Таймлайн подачи: когда что делать</b>}>
          <div className="space-y-3">
            {VISA_TIMELINE.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-carbon font-apple-text text-apple-caption font-semibold text-white">
                  {i + 1}
                </div>
                <div>
                  <b className="text-apple-body-sm text-cloud-white">{s.t}</b>
                  <p className="mt-1 text-apple-body-sm text-cloud-body">{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </VisaAccordion>

        <VisaAccordion summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Годовой минимум и пересчёт в тенге</b>}>
          <GuaranteeCalculator />
        </VisaAccordion>

        <VisaAccordion summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Чек-лист документов</b>}>
          <VisaChecklist />
        </VisaAccordion>

        <VisaAccordion summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Что проверить перед подачей</b>}>
          <div className="space-y-2">
            {VISA_REJECT_REASONS.map((r, i) => (
              <div key={i} className="border border-warn bg-warn/10 px-3 py-2.5 text-apple-body-sm text-cloud-white">
                {r}
              </div>
            ))}
          </div>
        </VisaAccordion>
      </div>
      <div className="text-cloud-meta"><SourceRefs ids={["visa", "procedure", "visaWhere", "visaFees", "visaTiming"]} /></div>
    </div>
  );
}

function GuaranteeCalculator() {
  const [rate, setRate] = useState("");
  const numericRate = Number(rate.replace(",", "."));
  const validRate = Number.isFinite(numericRate) && numericRate > 0;
  const tenge = validRate ? Math.ceil(VG_PER_YEAR * numericRate).toLocaleString("ru-RU") + " ₸" : "Укажи курс";
  return (
    <div>
      <p className="font-apple-display text-apple-heading-sm font-semibold text-cloud-white">{VISA_GUARANTEE_LABEL}</p>
      <p className="mt-2 text-apple-body-sm text-cloud-body">Годовой минимум для 2026/27–2027/28. Он не умножается автоматически на все годы программы при первой подаче. Консульство также оценивает устойчивость финансирования.</p>
      <label className="mt-4 block text-apple-body-sm text-cloud-white">
        Твой курс банка: тенге за €1
        <input inputMode="decimal" type="text" value={rate} onChange={(event) => setRate(event.target.value)} placeholder="Введи актуальный курс" className="mt-2 block min-h-11 w-full rounded-apple-card border border-white/20 bg-frost px-3 text-cloud-white" />
      </label>
      <p aria-live="polite" className="mt-3 text-apple-subheading font-semibold text-cloud-white">{tenge}</p>
      <p className="mt-3 text-apple-caption text-cloud-meta">Пересчёт по введённому курсу, не банковская котировка. Обучение, жильё, депозит, поездка и оформление требуют отдельного бюджета. Выписки — с движением за шесть месяцев по чек-листу Астаны.</p>
    </div>
  );
}

function VisaChecklist() {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between text-apple-caption font-semibold text-cloud-meta">
        <span>
          {done.size} из {VISA_DOCS.length} собрано
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-apple-pill bg-white/10">
        <div
          className="h-full origin-left rounded-apple-pill bg-green transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${done.size / VISA_DOCS.length})` }}
        />
      </div>
      <p className="mt-3 text-apple-caption text-cloud-meta">Отметки помогают собрать пакет и не являются решением о готовности к визе. Последний пункт применяется только к несовершеннолетним.</p>
      <div className="mt-3 space-y-2">
        {VISA_DOCS.map((d, i) => {
          const isDone = done.has(i);
          return (
            <button
              key={d.title}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={`flex w-full items-start gap-3 border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                isDone ? "border-green bg-green/5" : "border-white/15 "
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-xs font-bold ${
                  isDone ? "border-green bg-green text-white" : "border-white/30"
                }`}
              >
                {isDone ? "✓" : ""}
              </span>
              <span>
                <b className="block text-apple-body-sm text-cloud-white">{d.title}</b>
                <span className="text-apple-caption text-cloud-meta">{d.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
