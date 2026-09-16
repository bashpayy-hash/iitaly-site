"use client";

import { useState } from "react";
import { VISA_GUARANTEE_LABEL } from "@/data/changes2026";
import {
  VG_PER_YEAR,
  VG_RATE,
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
        <b>BLS в Алматы, Астане, Атырау, Оскемене, Шымкенте</b>
      </p>
      <p className="mt-2 text-apple-body-sm text-cloud-body">
        Три вещи решают всё остальное. Если запомнить только их, уже не
        пропадёшь — детали ниже раскрываются по нажатию.
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

        <VisaAccordion summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Калькулятор финансовой гарантии</b>}>
          <GuaranteeCalculator />
        </VisaAccordion>

        <VisaAccordion summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Чек-лист документов</b>}>
          <VisaChecklist />
        </VisaAccordion>

        <VisaAccordion summary={<b className="text-apple-body-sm font-semibold text-cloud-white">Частые причины отказа</b>}>
          <div className="space-y-2">
            {VISA_REJECT_REASONS.map((r, i) => (
              <div key={i} className="border border-warn bg-warn/10 px-3 py-2.5 text-apple-body-sm text-cloud-white">
                {r}
              </div>
            ))}
          </div>
        </VisaAccordion>
      </div>
    </div>
  );
}

function GuaranteeCalculator() {
  const [years, setYears] = useState<1 | 2 | 3>(3);
  const eur = VG_PER_YEAR * years;
  const kzt = ((eur * VG_RATE) / 1e6).toFixed(1).replace(".", ",");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-apple-body-sm font-semibold text-cloud-white">Срок обучения:</span>
        <div className="flex gap-2" role="group" aria-label="Срок обучения">
          {([1, 2, 3] as const).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYears(y)}
              aria-pressed={years === y}
              className={`rounded-apple-pill border px-3.5 py-1.5 text-apple-caption font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson ${
                years === y ? "border-crimson bg-crimson text-white" : "border-white/20  text-cloud-white"
              }`}
            >
              {y} {y === 1 ? "год" : "года"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-white/15 px-3 py-4 text-center">
          <p className="font-apple-display text-apple-heading-sm font-semibold text-cloud-white">€ {Math.round(eur).toLocaleString("ru-RU")}</p>
          <p className="mt-1 text-apple-caption text-cloud-meta">минимум на счёте</p>
        </div>
        <div className="border border-white/15 px-3 py-4 text-center">
          <p className="font-apple-display text-apple-heading-sm font-semibold text-cloud-white">≈ {kzt} млн ₸</p>
          <p className="mt-1 text-apple-caption text-cloud-meta">по курсу ~534 ₸/€</p>
        </div>
      </div>
      <p className="mt-3 text-apple-caption text-cloud-meta">
        {VISA_GUARANTEE_LABEL} за каждый год. Выписки за 3 месяца с QR-кодом; одного Kaspi
        недостаточно — консульство хочет видеть банковские выписки
        установленного вида. Подойдёт счёт родителей со спонсорским письмом.
      </p>
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
