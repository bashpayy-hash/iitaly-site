"use client";

import { Check, X, Plus } from "lucide-react";
import { CITIES, type University } from "@/data/italy";
import { UniversityDecision, type UniversitySelection } from "./UniversityDecision";
import type { PortalUniversitySelection } from "./UniversitiesExplorer";
import styles from "./comparison-deck.module.css";

const rows = [
  { key: "tu", label: "Стоимость в год" },
  { key: "dsu", label: "Стипендия DSU" },
  { key: "life", label: "Жизнь в городе · месяц" },
  { key: "test", label: "Экзамен / отбор" },
  { key: "dl", label: "Дедлайн подачи · по базе" },
] as const;

// Only complete monthly ranges are comparable. A floor is not a price,
// and an exam or scholarship is never ranked as a guaranteed outcome.
function range(text: string) {
  const match = /^€(\d+)[–—-](\d+)\/мес$/.exec(text.replace(/[\s\u00a0\u202f]/g,""));
  return match ? [Number(match[1]), Number(match[2])] : null;
}
function lowerLiving(university: University, universities: University[]) {
  const values = universities.map(item => range(item.life));
  const candidate = range(university.life);
  return universities.length > 1 && candidate && values.every(Boolean) && values.every(value => candidate[0] <= value![0] && candidate[1] <= value![1]) && values.some(value=> candidate[0] < value![0] || candidate[1] < value![1]);
}

export function ComparisonDeck({ universities, selection, portalSelection, onRemove }: { universities: University[]; selection?: UniversitySelection; portalSelection?: PortalUniversitySelection; onRemove: (id: string) => void }) {
  return <div data-comparison-deck>
    <div className={styles.scroll} role="region" aria-label="Карточки сравнения университетов" tabIndex={0}>
      <div className={styles.deck}>
        {universities.map((university, index) => {
          const primary = selection?.primaryId === university.id;
          const inPlan = portalSelection?.selectedIds.includes(university.id);
          return <article key={university.id} className={styles.card} data-deck-university={university.id} data-primary={primary || undefined} style={{animationDelay:`${index * 65}ms`}}>
            <div className={styles.code}><span>{String(index+1).padStart(2,"0")} / {university.id.toUpperCase()} · {university.city.toUpperCase()}</span><button type="button" onClick={()=>onRemove(university.id)} aria-label={`Убрать из сравнения: ${university.name}`}><X size={16} aria-hidden="true" /></button></div>
            <header className={styles.heading}><p>{CITIES[university.city].name}</p><h3>{university.name}</h3><span className={styles.badge}>{primary ? <><Check size={14} aria-hidden="true" />Основной выбор</> : university.tp}</span></header>
            {rows.map(row=><div key={row.key} className={styles.metric} data-deck-row={row.key}><span>{row.label}</span><p>{university[row.key]}</p>{row.key === "life" && lowerLiving(university,universities) && <small className={styles.marker}>Ниже диапазон расходов</small>}</div>)}
            <div className={styles.action}>
              {selection && <button type="button" data-deck-choose={university.id} aria-label={`Выбрать этот университет: ${university.name}`} aria-pressed={primary} onClick={()=>selection.onSelect(university.id)}>{primary ? "Основной выбор" : "Выбрать этот университет"}<Check size={18} aria-hidden="true" /></button>}
              {portalSelection && <button type="button" aria-pressed={inPlan} onClick={()=>portalSelection.onToggle(university.id)}>{inPlan ? "Университет выбран" : "Выбрать этот университет"}<Check size={18} aria-hidden="true" /></button>}
            </div>
          </article>;
        })}
        {Array.from({length:3-universities.length},(_,index)=><div key={`empty-${index}`} className={styles.empty}>
          <span className={styles.emptyIndex}>{String(universities.length+index+1).padStart(2,"0")}</span><Plus size={22} strokeWidth={1.3} aria-hidden="true" /><p>Добавь университет</p><span>На карте, в быстрых кнопках или в списке выше.</span><button type="button" disabled>Выбрать этот университет</button>
        </div>)}
      </div>
    </div>
    <p className={styles.note}>Данные для сравнения, не подтверждение условий конкурса. Стоимость, отбор и сроки проверь у выбранной программы. Стипендия не вычитается из расходов.</p>
    {selection && <UniversityDecision universities={universities} selection={selection} showChoices={false} />}
  </div>;
}
