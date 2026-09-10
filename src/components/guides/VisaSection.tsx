"use client";

import { useState } from "react";
import {
  VG_PER_YEAR,
  VG_RATE,
  VISA_DOCS,
  VISA_KEY_FACTS,
  VISA_REJECT_REASONS,
  VISA_TIMELINE,
} from "@/data/guides";
import { Accordion } from "@/components/Accordion";

export function VisaSection() {
  return (
    <div>
      <p className="text-sm">
        <span className="text-ink-soft">Где подавать: </span>
        <b>BLS в Алматы, Астане, Атырау, Оскемене, Шымкенте</b>
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Три вещи решают всё остальное. Если запомнить только их, уже не
        пропадёшь — детали ниже раскрываются по нажатию.
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {VISA_KEY_FACTS.map((f) => (
          <div key={f.label} className="rounded-md bg-cream px-3 py-3 text-center">
            <b className="block font-display text-lg font-bold">{f.value}</b>
            <span className="text-xs text-ink-soft">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <Accordion defaultOpen summary={<b className="text-sm font-bold">Таймлайн подачи: когда что делать</b>}>
          <div className="space-y-3">
            {VISA_TIMELINE.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xs font-bold text-cream">
                  {i + 1}
                </div>
                <div>
                  <b className="text-sm">{s.t}</b>
                  <p className="mt-1 text-sm text-ink-soft">{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        <Accordion summary={<b className="text-sm font-bold">Калькулятор финансовой гарантии</b>}>
          <GuaranteeCalculator />
        </Accordion>

        <Accordion summary={<b className="text-sm font-bold">Чек-лист документов</b>}>
          <VisaChecklist />
        </Accordion>

        <Accordion summary={<b className="text-sm font-bold">Частые причины отказа</b>}>
          <div className="space-y-2">
            {VISA_REJECT_REASONS.map((r, i) => (
              <div key={i} className="rounded-md border-2 border-warn bg-warn/10 px-3 py-2.5 text-sm">
                {r}
              </div>
            ))}
          </div>
        </Accordion>
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
        <span className="text-sm font-bold">Срок обучения:</span>
        <div className="flex gap-2" role="group" aria-label="Срок обучения">
          {([1, 2, 3] as const).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYears(y)}
              aria-pressed={years === y}
              className={`rounded-pill border-2 border-ink px-3.5 py-1.5 text-xs font-extrabold uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                years === y ? "bg-ink text-cream" : "bg-cream text-ink"
              }`}
            >
              {y} {y === 1 ? "год" : "года"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-cream px-3 py-4 text-center">
          <p className="font-display text-2xl font-bold">€ {Math.round(eur).toLocaleString("ru-RU")}</p>
          <p className="mt-1 text-xs text-ink-soft">минимум на счёте</p>
        </div>
        <div className="rounded-md bg-cream px-3 py-4 text-center">
          <p className="font-display text-2xl font-bold">≈ {kzt} млн ₸</p>
          <p className="mt-1 text-xs text-ink-soft">по курсу ~534 ₸/€</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        €6 947,33 за каждый год. Выписки за 3 месяца с QR-кодом; одного Kaspi
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
      <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
        <span>
          {done.size} из {VISA_DOCS.length} собрано
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-line">
        <div
          className="h-full origin-left rounded-pill bg-green transition-transform duration-300 ease-out motion-reduce:transition-none"
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
              className={`flex w-full items-start gap-3 rounded-md border-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red ${
                isDone ? "border-green bg-green/5" : "border-line bg-cream"
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 text-xs font-bold ${
                  isDone ? "border-green bg-green text-cream" : "border-ink-soft bg-paper"
                }`}
              >
                {isDone ? "✓" : ""}
              </span>
              <span>
                <b className="block text-sm">{d.title}</b>
                <span className="text-xs text-ink-soft">{d.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
