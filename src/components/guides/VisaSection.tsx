"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { VISA_GUARANTEE_LABEL } from "@/data/changes2026";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { VG_PER_YEAR, VISA_DOCS, VISA_KEY_FACTS, VISA_REJECT_REASONS, VISA_TIMELINE } from "@/data/guides";
import { VISA_PARTS, type VisaPart } from "./guideCatalogue";
import ui from "./guide-pages.module.css";

export function VisaSection({ part }: { part?: VisaPart }) {
  if (part === "funds") return <GuaranteeCalculator />;
  if (part === "documents") return <VisaChecklist />;
  if (part === "timeline") return <ol className={ui.visaTimeline}>{VISA_TIMELINE.map(step => <li key={step.t}><div><h2>{step.t}</h2><p>{step.p}</p></div></li>)}</ol>;
  if (part === "before-application") return <ul className={ui.checkBefore}>{VISA_REJECT_REASONS.map(reason => <li key={reason}>{reason}</li>)}</ul>;
  return <>
    <a className={ui.textLink} href={ADMISSION_SOURCES.visaWhere.href} target="_blank" rel="noopener noreferrer">Официальный VFS для Италии в Казахстане</a>
    <dl className={ui.visaFacts}>{VISA_KEY_FACTS.map(fact=><div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>)}</dl>
    <nav aria-label="Вопросы о визе D"><ul className={ui.topicList}>{VISA_PARTS.map(item=><li key={item.id}><Link href={`/guides/visa/${item.id}`} data-visa-part={item.id}><span><strong>{item.title}</strong><span>{item.description}</span></span><ArrowRight size={20} aria-hidden="true" /></Link></li>)}</ul></nav>
  </>;
}

function GuaranteeCalculator() {
  const [rate, setRate] = useState("");
  const numericRate = Number(rate.replace(",", "."));
  const validRate = Number.isFinite(numericRate) && numericRate > 0;
  const tenge = validRate ? Math.ceil(VG_PER_YEAR * numericRate).toLocaleString("ru-RU") + " ₸" : "Укажи курс";
  return (
    <div>
      <p className="font-apple-display text-[24px] leading-8 font-semibold tracking-tight text-stone-950">{VISA_GUARANTEE_LABEL}</p>
      <p className="mt-2 text-[14px] leading-6 text-stone-600">Годовой минимум для 2026/27–2027/28. Он не умножается автоматически на все годы программы при первой подаче. Консульство также оценивает устойчивость финансирования.</p>
      <label className="mt-4 block text-[14px] leading-6 text-stone-900">
        Твой курс банка: тенге за €1
        <input inputMode="decimal" type="text" value={rate} onChange={(event) => setRate(event.target.value)} placeholder="Введи актуальный курс" className="mt-2 block min-h-12 w-full rounded-full border border-stone-300 bg-white px-4 text-[16px] text-stone-950 placeholder:text-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413]" />
      </label>
      <p aria-live="polite" className="mt-3 text-[20px] leading-7 font-semibold text-stone-950">{tenge}</p>
      <p className="mt-3 text-[13px] leading-5 text-stone-600">Пересчёт по введённому курсу, не банковская котировка. Обучение, жильё, депозит, поездка и оформление требуют отдельного бюджета. Выписки — с движением за шесть месяцев по чек-листу Астаны.</p>
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
      <div className="flex items-center justify-between text-[13px] leading-5 font-semibold text-stone-600">
        <span>
          {done.size} из {VISA_DOCS.length} собрано
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full origin-left rounded-full bg-[#141413] transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${done.size / VISA_DOCS.length})` }}
        />
      </div>
      <p className="mt-3 text-[13px] leading-5 text-stone-600">Отметки помогают собрать пакет и не являются решением о готовности к визе. Последний пункт применяется только к несовершеннолетним.</p>
      <div className="mt-3 space-y-2">
        {VISA_DOCS.map((d, i) => {
          const isDone = done.has(i);
          return (
            <button
              key={d.title}
              type="button"
              onClick={() => toggle(i)}
              aria-pressed={isDone}
              className={`flex min-h-11 w-full items-start gap-3 rounded-xl border px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413] ${
                isDone ? "border-red-200 bg-red-50/80" : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold ${
                  isDone ? "border-[#141413] bg-[#141413] text-white" : "border-stone-300"
                }`}
              >
                {isDone ? <Check size={13} aria-hidden="true" /> : null}
              </span>
              <span>
                <b className="block text-[14px] leading-6 text-stone-950">{d.title}</b>
                <span className="text-[13px] leading-5 text-stone-600">{d.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
