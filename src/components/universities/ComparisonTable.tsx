"use client";

import { Check } from "lucide-react";
import { UniversityDecision, type UniversitySelection } from "./UniversityDecision";
import { useId, useState } from "react";
import { CITIES, type University } from "@/data/italy";
import { COMPARISON_GROUPS } from "./comparison-model";
import { CityGlyph } from "./CityGlyph";
import styles from "./comparison.module.css";

/** Same source-backed comparison on the page and in the existing modal. */
export function ComparisonTable({ universities, selection }: { universities: University[]; selection?: UniversitySelection }) {
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [months, setMonths] = useState(12);
  const id = useId();
  const groups = COMPARISON_GROUPS.map(group => ({ ...group, rows: group.rows.filter(row =>
    !differencesOnly || new Set(universities.map(u => row.value(u, months))).size > 1,
  ) })).filter(group => group.rows.length > 0);
  const rowCount = groups.reduce((sum, group) => sum + group.rows.length, 0);

  if (universities.length < 2) return null;

  return (
    <div className={styles.comparison} data-university-comparison>
      <div className={styles.toolbar}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={differencesOnly} onChange={event => setDifferencesOnly(event.target.checked)} />
          Только различия
        </label>
        <label className={styles.period}>
          Бюджет жизни за
          <select value={months} onChange={event => setMonths(Number(event.target.value))}>
            <option value={10}>10 месяцев</option>
            <option value={12}>12 месяцев</option>
          </select>
        </label>
        <span className={styles.count} role="status">Показано {rowCount} из 12 параметров</span>
      </div>
      <p className={styles.scrollHint} id={`${id}-scroll`}>На узком экране таблицу можно прокручивать вбок.</p>
      <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Подробное сравнение университетов" aria-describedby={`${id}-scroll`}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Сравнение выбранных университетов: обучение, поступление и бюджет</caption>
          <thead>
            <tr>
              <th scope="col">Что сравниваем</th>
              {universities.map(u => <th scope="col" key={u.id} data-primary={selection?.primaryId === u.id || undefined}>
                <span className={styles.uniName}>{u.name}</span>
                {selection?.primaryId === u.id && <span className={styles.selectedBadge}><Check size={14} aria-hidden="true" />Выбран основной вуз</span>}
                <span className={styles.city}><CityGlyph city={u.city} className={styles.cityGlyph} />{CITIES[u.city].name}</span>
              </th>)}
            </tr>
          </thead>
          {groups.map(group => <tbody key={group.title}>
            <tr className={styles.groupRow}><th scope="rowgroup" colSpan={universities.length + 1}>{group.title}</th></tr>
            {group.rows.map(row => {
              const values = universities.map(u => row.value(u, months));
              const different = new Set(values).size > 1;
              return <tr key={row.id} data-comparison-row={row.id} data-different={different}>
                <th scope="row">{row.label}{row.id === "period" && <small>{months} месяцев · расчёт</small>}</th>
                {values.map((value, index) => <td key={universities[index].id} data-primary={selection?.primaryId === universities[index].id || undefined}>{value}</td>)}
              </tr>;
            })}
          </tbody>)}
          {selection && <tfoot><tr><th scope="row">Твой выбор</th>{universities.map(university => <td key={university.id} data-primary={selection.primaryId === university.id || undefined}>
            <button type="button" className={styles.chooseButton} aria-label={`Выбрать этот университет: ${university.name}`} aria-pressed={selection.primaryId === university.id} onClick={() => selection.onSelect(university.id)}>
              {selection.primaryId === university.id && <Check size={16} aria-hidden="true" />}{selection.primaryId === university.id ? "Выбран основной вуз" : "Выбрать этот университет"}
            </button>
          </td>)}</tr></tfoot>}
        </table>
      </div>
      {rowCount === 0 && <p className={styles.note}>По выбранным параметрам различий в базе нет.</p>}
      {selection && <UniversityDecision universities={universities} selection={selection} />}
      <div className={styles.notes}>
        <p><strong>Ориентир, не смета.</strong> Расходы на жизнь за {months} месяцев рассчитаны умножением месячной оценки из базы. Обучение, перелёт, виза, страховка и разовые расходы сюда не включены; стипендия не вычитается.</p>
        <p><strong>Перед подачей проверь условия.</strong> Здесь показаны сведения из текущей базы сайта, а не подтверждение актуального конкурса. Программы, сроки, стоимость и стипендии уточняй у вуза и стипендиального органа. Отсутствие отметки в базе не означает отсутствие программы; поступление и стипендия не гарантируются.</p>
      </div>
    </div>
  );
}
