"use client";

import type { CSSProperties } from "react";
import { Check, X, Plus } from "lucide-react";
import { CITIES, type University } from "@/data/italy";
import { cityLatin } from "@/components/journey/flightCoordinates";
import { CityGlyph } from "./CityGlyph";
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
  const match = /^€(\d+)[–—-](\d+)\/мес$/.exec(text.replace(/[\s  ]/g,""));
  return match ? [Number(match[1]), Number(match[2])] : null;
}
function lowerLiving(university: University, universities: University[]) {
  const values = universities.map(item => range(item.life));
  const candidate = range(university.life);
  return universities.length > 1 && candidate && values.every(Boolean) && values.every(value => candidate[0] <= value![0] && candidate[1] <= value![1]) && values.some(value=> candidate[0] < value![0] || candidate[1] < value![1]);
}

/* Ряд из трёх высоких карточек по референсу exp.fiddle.digital: над каждой —
   моноширинный индекс и код вуза, внутри — одинаковые строки на одной высоте
   (subgrid), внизу — выбор основного вуза. */
export function ComparisonDeck({ universities, selection, portalSelection, onRemove }: { universities: University[]; selection?: UniversitySelection; portalSelection?: PortalUniversitySelection; onRemove: (id: string) => void }) {
  return <div className={styles.root} data-comparison-deck>
    <div className={styles.scroll} role="region" aria-label="Карточки сравнения университетов" tabIndex={0}>
      <div className={styles.deck}>
        {universities.map((university, index) => {
          const primary = selection?.primaryId === university.id;
          const inPlan = portalSelection?.selectedIds.includes(university.id);
          return <div key={university.id} className={styles.slot} data-deck-slot style={{ "--deck-index": index } as CSSProperties}>
            <p className={styles.code}>
              <span>{String(index+1).padStart(2,"0")} / {university.id.toUpperCase()} • {cityLatin(university.city)}</span>
              <button type="button" onClick={()=>onRemove(university.id)} aria-label={`Убрать из сравнения: ${university.name}`}><X size={15} aria-hidden="true" /></button>
            </p>
            <article className={styles.card} data-deck-university={university.id} data-primary={primary || undefined} data-tone={index}>
              <header className={styles.poster}>
                <CityGlyph city={university.city} className={styles.glyph} />
                <p>{CITIES[university.city].name}</p>
                <h3>{university.name}</h3>
                <span className={styles.badge} data-deck-badge>{primary ? <><Check size={14} aria-hidden="true" />Основной выбор</> : university.tp}</span>
              </header>
              {rows.map(row=><div key={row.key} className={styles.metric} data-deck-row={row.key}>
                <span>{row.label}</span>
                <p>{university[row.key]}</p>
                {row.key === "life" && lowerLiving(university,universities) && <small className={styles.marker}>Ниже диапазон расходов</small>}
              </div>)}
              <div className={styles.action}>
                {selection && <button type="button" data-deck-choose={university.id} aria-label={`Выбрать этот университет: ${university.name}`} aria-pressed={primary} onClick={()=>selection.onSelect(university.id)}>{primary ? "Основной выбор" : "Выбрать этот университет"}<Check size={18} aria-hidden="true" /></button>}
                {portalSelection && <button type="button" aria-pressed={inPlan} onClick={()=>portalSelection.onToggle(university.id)}>{inPlan ? "Университет выбран" : "Выбрать этот университет"}<Check size={18} aria-hidden="true" /></button>}
              </div>
            </article>
          </div>;
        })}
        {Array.from({length:3-universities.length},(_,index)=><div key={`empty-${index}`} className={styles.emptySlot}>
          <p className={styles.code}><span>{String(universities.length+index+1).padStart(2,"0")} / ———</span></p>
          <div className={styles.empty}>
            <Plus size={24} strokeWidth={1.3} aria-hidden="true" />
            <p>Добавь университет</p>
            <span>На карте, в быстрых кнопках или в списке выше.</span>
            <button type="button" disabled>Выбрать этот университет</button>
          </div>
        </div>)}
      </div>
    </div>
    <p className={styles.note}>Данные для сравнения, не подтверждение условий конкурса. Стоимость, отбор и сроки проверь у выбранной программы. Стипендия не вычитается из расходов.</p>
    {selection && <UniversityDecision universities={universities} selection={selection} showChoices={false} floating />}
  </div>;
}
