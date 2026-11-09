"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { VISA_GUARANTEE_LABEL } from "@/data/changes2026";
import { ADMISSION_SOURCES } from "@/data/admissions";
import { VG_PER_YEAR, VISA_DOCS, VISA_KEY_FACTS, VISA_REJECT_REASONS, VISA_TIMELINE } from "@/data/guides";
import type { VisaPart } from "./guideCatalogue";
import ui from "./guide-pages.module.css";
import { GuidePointSwitcher } from "./GuidePointSwitcher";
import { GuideWall } from "./GuideWall";
import { GUIDE_WALL_NOTE, visaPointOpen, type VisaPointsPart } from "./guideAccess";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { MediaSwitcher, useStoryLocation } from "@/components/story/MediaSwitcher";

/* Виза (owner, 9 Nov): ключевые факты, ссылка на VFS и калькулятор средств
   открыты; в сроках, документах и проверке перед подачей открыты отдельные
   пункты (guideAccess.ts), у остальных — название и стена. Карточки частей
   рисует GuidePage. */
export function VisaSection({ part }: { part?: VisaPart }) {
  if (part === "funds") return <GuaranteeCalculator />;
  if (part === "documents") return <VisaChecklist />;
  if (part === "timeline") return <VisaPoints part="timeline" rows={VISA_TIMELINE.map(step => ({ label:step.t, value:step.p }))} subject="calendar" />;
  if (part === "before-application") return <VisaPoints part="before-application" rows={VISA_REJECT_REASONS.map((reason, index) => ({ label:`Перед подачей · ${index + 1}`, value:reason }))} subject="envelope" />;
  return <>
    <a className={ui.textLink} href={ADMISSION_SOURCES.visaWhere.href} target="_blank" rel="noopener noreferrer">Официальный VFS для Италии в Казахстане</a>
    <dl className={ui.visaFacts}>{VISA_KEY_FACTS.map(fact=><div key={fact.label}><dt>{fact.value}</dt><dd>{fact.label}</dd></div>)}</dl>
  </>;
}

function VisaPoints({ part, rows, subject }: { part: VisaPointsPart; rows: { label: string; value: string }[]; subject: "calendar" | "envelope" }) {
  const paid = usePaidDevice();
  return <GuidePointSwitcher subject={subject} rows={rows.map((row, index): { label: string; value: string; content?: ReactNode } =>
    paid || visaPointOpen(part, index + 1) ? row : { label: row.label, value: GUIDE_WALL_NOTE, content: <GuideWall place="visa" note={null} /> })} />;
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
  const paid = usePaidDevice();
  const [done, setDone] = useState<Set<number>>(new Set());
  const { index, href, select } = useStoryLocation("point", VISA_DOCS.length);

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
      <MediaSwitcher items={VISA_DOCS.map((document, position) => {
        const open = paid || visaPointOpen("documents", position + 1);
        const check = <button type="button" aria-pressed={done.has(position)} className={ui.checkItem} onClick={() => toggle(position)}><Check size={18} aria-hidden="true" />{done.has(position) ? "Собрано — снять отметку" : "Отметить собранным"}</button>;
        return { id:String(position), title:document.title, text:open ? document.desc : GUIDE_WALL_NOTE, subject:"folder", label:String(position + 1).padStart(2, "0"), content:open ? check : <>{check}<GuideWall place="visa" note={null} /></> };
      })} index={index} onSelect={select} href={href} label="Документы визового пакета" progressLabel="Документ" lastAction={<Link href="/guides/visa">К вопросам о визе</Link>} />

    </div>
  );
}
