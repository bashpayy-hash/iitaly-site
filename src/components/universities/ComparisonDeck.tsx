"use client";
/* eslint-disable @next/next/no-img-element -- Local mascot cut-out with explicit dimensions. */

import type { CSSProperties } from "react";
import { Check, X, Plus } from "lucide-react";
import { CITIES, UNIS, type University } from "@/data/italy";
import { cityLatin } from "@/components/journey/flightCoordinates";
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

/* Быстрый старт — те же три вуза, что в быстрых кнопках над картой
   (UniversitiesExplorer): самые частые первые вопросы. */
const POPULAR = ["unibo", "polimi", "unipd"];
const popular = POPULAR.map(id => UNIS.find(u => u.id === id)).filter((u): u is University => Boolean(u));

// Only complete monthly ranges are comparable. A floor is not a price,
// and an exam or scholarship is never ranked as a guaranteed outcome.
function range(text: string) {
  const match = /^€(\d+)[–—-](\d+)\/мес$/.exec(text.replace(/[\s  ]/g,""));
  return match ? [Number(match[1]), Number(match[2])] : null;
}
function lowerLiving(university: University, universities: University[]) {
  const values = universities.map(item => range(item.life));
  const candidate = range(university.life);
  return universities.length > 1 && candidate && values.every(Boolean) && values.every(value => candidate[0] <= value![0] && candidate[1] <= value![1]) && values.some(value=> candidate[0] < value![0] || candidate[1] < value![1]);
}

function QuickAdd({ chosen, onAdd }: { chosen: University[]; onAdd: (ids: string[]) => void }) {
  const left = popular.filter(u => !chosen.some(c => c.id === u.id)).slice(0, 3 - chosen.length);
  if (!left.length) return null;
  return <div className={styles.quick} aria-label="Быстро добавить в сравнение">
    {left.map(u => <button key={u.id} type="button" data-deck-add={u.id} onClick={() => onAdd([u.id])}>
      <Plus size={15} strokeWidth={1.8} aria-hidden="true" />{CITIES[u.city].name} · {u.name}
    </button>)}
  </div>;
}

/* Колода сравнения (owner, 12 Nov 2026: «сравнение выглядит не прям юзер
   френдли, нужно это исправить»). Что мешало и что стало:
   - Карточки стояли дугой в перспективе (референс Fiddle, 27 Oct): боковые
     повёрнуты на 16°, и строки «Стоимость», «Дедлайн» читались под углом —
     сравнивать наклонённый текст трудно. Теперь все стоят ровно.
   - Под колодой огромный код вуза в фокусе и шкала «1 из 3» — украшение на
     150 пикселей, которое путали со счётчиком выбора. Убрано.
   - Пустые места были тремя пунктирными коробками по 440 пикселей с надписью
     без действия. Теперь одно место «добавь ещё» по высоте содержимого, с
     кнопками популярных вузов; пока не выбрано ничего — одна панель с Веспи
     над картой (он переехал сюда из угла карты, owner: «можно его добавить,
     но не прям туда»).
   - На телефоне была видна одна карточка, вторая — свайпом: сравнивать
     приходилось по памяти. Теперь рядом две колонки, третья — свайпом.
   Строки сравнения по-прежнему стоят на одной высоте (subgrid). */
export function ComparisonDeck({ universities, selection, portalSelection, onRemove, onAdd }: { universities: University[]; selection?: UniversitySelection; portalSelection?: PortalUniversitySelection; onRemove: (id: string) => void; onAdd: (ids: string[]) => void }) {
  if (!universities.length) return <div className={styles.root} data-comparison-deck>
    <div className={styles.start} data-deck-empty="start">
      <img className={styles.startArt} src="/illustrations/scenery/vespi-map-280.webp" srcSet="/illustrations/scenery/vespi-map-280.webp 280w, /illustrations/scenery/vespi-map-560.webp 560w" sizes="(max-width: 767px) 140px, 200px" width={280} height={230} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false} />
      <div className={styles.startCopy}>
        <h3>Сравни два-три вуза</h3>
        <p>Нажми на город на карте выше или выбери в списке. Можно начать с популярных:</p>
        <QuickAdd chosen={universities} onAdd={onAdd} />
        <button type="button" className={styles.startAll} data-deck-add-all onClick={() => onAdd(popular.map(u => u.id))}>Сравнить все три сразу</button>
      </div>
    </div>
    {/* Сохранённый основной вуз и ссылка в план не пропадают, даже если сравнение очистили. */}
    {selection?.primaryId && <UniversityDecision universities={universities} selection={selection} showChoices={false} floating />}
  </div>;

  const missing = 3 - universities.length;
  return <div className={styles.root} data-comparison-deck>
    <div className={styles.scroll} role="region" aria-label="Карточки сравнения университетов" tabIndex={0}>
      <div className={styles.deck} data-count={universities.length}>
        {universities.map((university, index) => {
          const primary = selection?.primaryId === university.id;
          const inPlan = portalSelection?.selectedIds.includes(university.id);
          /* Верх карточки (owner, 13 Nov: «расстояние между иконками, особенно
             сверху… сделано коряво»): строка кода висела над карточкой отдельно,
             грубая пиктограмма города и обрезанные вертикальные буквы спорили с
             названием. Теперь в шапке одна строка — код вуза и круглая кнопка
             «убрать», ниже город, название и метка. */
          return <div key={university.id} className={styles.slot} data-deck-slot>
            <article className={styles.card} data-deck-university={university.id} data-primary={primary || undefined} data-tone={index % 3}>
              <header className={styles.poster}>
                <div className={styles.posterTop}>
                  <span className={styles.posterCode} title={`${university.id.toUpperCase()} · ${cityLatin(university.city)}`}>{university.id.toUpperCase()}</span>
                  <button type="button" className={styles.remove} onClick={() => onRemove(university.id)} aria-label={`Убрать из сравнения: ${university.name}`}><X size={16} aria-hidden="true" /></button>
                </div>
                <p>{CITIES[university.city].name}</p>
                <h3>{university.name}</h3>
                <span className={styles.badge} data-deck-badge>{primary ? <><Check size={14} aria-hidden="true" />Основной выбор</> : university.tp}</span>
              </header>
              {rows.map((row, position)=><div key={row.key} className={styles.metric} data-deck-row={row.key} data-edge={position === 0 ? "first" : position === rows.length - 1 ? "last" : undefined}>
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
        {missing > 0 && <div className={styles.addSlot} data-deck-empty style={{ "--span": missing } as CSSProperties}>
          <div className={styles.add}>
            <small className={styles.addLabel}>{universities.length === 1 ? "Второй вуз" : "Третий вуз · по желанию"}</small>
            <p>{universities.length === 1 ? "Добавь второй вуз — и сравнение начнётся" : "Можно добавить ещё один"}</p>
            <span>Нажми на город на карте или выбери в списке выше.</span>
            <QuickAdd chosen={universities} onAdd={onAdd} />
          </div>
        </div>}
      </div>
    </div>
    <p className={styles.note}>Данные для сравнения, не подтверждение условий конкурса. Стоимость, отбор и сроки проверь у выбранной программы. Стипендия не вычитается из расходов.</p>
    {selection && <UniversityDecision universities={universities} selection={selection} showChoices={false} floating />}
  </div>;
}
