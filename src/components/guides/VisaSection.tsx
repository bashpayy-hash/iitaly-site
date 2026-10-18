"use client";

import { useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { VISA_GUARANTEE_LABEL } from "@/data/changes2026";
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
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;

  return (
    <section className="rounded-[9px] border border-subtle/80 bg-bone/70 p-1.5">
      <button
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-full px-4 py-3 text-left text-[14px] leading-6 text-primary hover:bg-subtle/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]"
      >
        {summary}
        <ChevronDown
          aria-hidden="true"
          size={20}
          className={`shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!open}
        className="mx-2 border-t border-subtle/80 px-2 pt-4 pb-4"
      >
        {children}
      </div>
    </section>
  );
}

export function VisaSection() {
  return (
    <div>
      <p className="text-[14px] leading-6 text-secondary">
        <span className="text-secondary">Где подавать: </span>
        <a href={ADMISSION_SOURCES.visaWhere.href} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 max-w-full items-center rounded-full bg-subtle px-4 py-2 text-[14px] font-medium leading-5 text-secondary hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]">Официальный VFS для Италии в Казахстане</a>
      </p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {VISA_KEY_FACTS.map((f) => (
          <div key={f.label} className="rounded-[9px] border border-subtle/80 bg-base/80 px-3 py-4 text-center">
            <b className="block font-apple-display text-[20px] leading-7 font-medium tracking-tight text-primary">{f.value}</b>
            <span className="text-[13px] leading-5 text-secondary">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        <VisaAccordion defaultOpen summary={<b className="font-medium">Таймлайн подачи: когда что делать</b>}>
          <div className="space-y-3">
            {VISA_TIMELINE.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-medium text-primary">
                  {i + 1}
                </div>
                <div>
                  <b className="text-[14px] leading-6 text-primary">{s.t}</b>
                  <p className="mt-1 text-[14px] leading-6 text-secondary">{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </VisaAccordion>

        <VisaAccordion summary={<b className="font-medium">Годовой минимум и пересчёт в тенге</b>}>
          <GuaranteeCalculator />
        </VisaAccordion>

        <VisaAccordion summary={<b className="font-medium">Чек-лист документов</b>}>
          <VisaChecklist />
        </VisaAccordion>

        <VisaAccordion summary={<b className="font-medium">Что проверить перед подачей</b>}>
          <div className="space-y-2">
            {VISA_REJECT_REASONS.map((r, i) => (
              <div key={i} className="rounded-[9px] border border-subtle/80 bg-glow-lemon/70 px-4 py-3 text-[14px] leading-6 text-secondary">
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
  const [rate, setRate] = useState("");
  const numericRate = Number(rate.replace(",", "."));
  const validRate = Number.isFinite(numericRate) && numericRate > 0;
  const tenge = validRate ? Math.ceil(VG_PER_YEAR * numericRate).toLocaleString("ru-RU") + " ₸" : "Укажи курс";
  return (
    <div>
      <p className="font-apple-display text-[24px] leading-8 font-medium tracking-tight text-primary">{VISA_GUARANTEE_LABEL}</p>
      <p className="mt-2 text-[14px] leading-6 text-secondary">Годовой минимум для 2026/27–2027/28. Он не умножается автоматически на все годы программы при первой подаче. Консульство также оценивает устойчивость финансирования.</p>
      <label className="mt-4 block text-[14px] leading-6 text-primary">
        Твой курс банка: тенге за €1
        <input inputMode="decimal" type="text" value={rate} onChange={(event) => setRate(event.target.value)} placeholder="Введи актуальный курс" className="mt-2 block min-h-12 w-full rounded-full border border-muted/35 bg-bone px-4 text-[16px] text-primary placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000]" />
      </label>
      <p aria-live="polite" className="mt-3 text-[20px] leading-7 font-medium text-primary">{tenge}</p>
      <p className="mt-3 text-[13px] leading-5 text-secondary">Пересчёт по введённому курсу, не банковская котировка. Обучение, жильё, депозит, поездка и оформление требуют отдельного бюджета. Выписки — с движением за шесть месяцев по чек-листу Астаны.</p>
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
      <div className="flex items-center justify-between text-[13px] leading-5 font-medium text-secondary">
        <span>
          {done.size} из {VISA_DOCS.length} собрано
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
        <div
          className="h-full origin-left rounded-full bg-[#000000] transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${done.size / VISA_DOCS.length})` }}
        />
      </div>
      <p className="mt-3 text-[13px] leading-5 text-secondary">Отметки помогают собрать пакет и не являются решением о готовности к визе. Последний пункт применяется только к несовершеннолетним.</p>
      <div className="mt-3 space-y-2">
        {VISA_DOCS.map((d, i) => {
          const isDone = done.has(i);
          return (
            <button
              key={d.title}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={`flex min-h-11 w-full items-start gap-3 rounded-full border px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000000] ${
                isDone ? "border-accent/20 bg-accent-soft/80" : "border-subtle bg-bone hover:bg-base"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium ${
                  isDone ? "border-[#000000] bg-[#000000] text-paper" : "border-muted/35"
                }`}
              >
                {isDone ? <Check size={13} aria-hidden="true" /> : null}
              </span>
              <span>
                <b className="block text-[14px] leading-6 text-primary">{d.title}</b>
                <span className="text-[13px] leading-5 text-secondary">{d.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
