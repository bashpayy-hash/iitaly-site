"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { UNIS, type University } from "@/data/italy";
import styles from "./comparison.module.css";

export type UniversitySelection = { primaryId: string | null; onSelect: (id: string) => void };

export function UniversityDecision({ universities, selection }: { universities: University[]; selection: UniversitySelection }) {
  const primary = UNIS.find(university => university.id === selection.primaryId);
  return <div className={styles.decision} data-university-decision data-fab-yield>
    <div className={styles.decisionCopy} role="status" aria-live="polite">
      <p className={styles.decisionTitle}>{primary ? <><Check size={18} aria-hidden="true" />Основной вуз: {primary.name}</> : "Сравни условия и выбери основной вуз"}</p>
      <p>{primary ? "Выбор сохранён на этом устройстве. Его можно изменить в сравнении." : universities.length ? "Нажми «Выбрать этот университет» у подходящего вуза. Затем перейди к плану." : "Добавь университеты в списках выше. После сравнения выбери, для какого вуза составлять план."}</p>
    </div>
    {primary && <Link className={styles.planLink} href="/plan#questionnaire">Перейти к плану поступления в {primary.name}<span aria-hidden="true">→</span></Link>}
    {universities.length > 0 ? <div className={styles.finalChoices} aria-label="Выбор основного университета">
      {universities.map(university => <button type="button" key={university.id} className={styles.chooseButton} aria-pressed={selection.primaryId === university.id} onClick={() => selection.onSelect(university.id)}>
        {selection.primaryId === university.id ? <Check size={16} aria-hidden="true" /> : null}
        <span>{university.name}<small>{selection.primaryId === university.id ? "Выбран основной вуз" : "Выбрать этот университет"}</small></span>
      </button>)}
    </div> : !primary && <button className={styles.chooseButton} type="button" disabled>Выбрать этот университет</button>}
  </div>;
}
