"use client";

import { useId, useState } from "react";
import { CITIES, type University } from "@/data/italy";
import { COMPARISON_GROUPS } from "./comparison-model";
import styles from "./comparison.module.css";

/** Same source-backed comparison on the page and in the existing modal. */
export function ComparisonTable({ universities }: { universities: University[] }) {
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
              {universities.map(u => <th scope="col" key={u.id}>
                <span className={styles.uniName}>{u.name}</span>
                <span className={styles.city}>{CITIES[u.city].name}</span>
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
                {values.map((value, index) => <td key={universities[index].id}>{value}</td>)}
              </tr>;
            })}
          </tbody>)}
        </table>
      </div>
      {rowCount === 0 && <p className={styles.note}>По выбранным параметрам различий в базе нет.</p>}
      <div className={styles.notes}>
        <p><strong>Ориентир, не смета.</strong> Расходы на жизнь за {months} месяцев рассчитаны умножением месячной оценки из базы. Обучение, перелёт, виза, страховка и разовые расходы сюда не включены; стипендия не вычитается.</p>
        <p><strong>Перед подачей проверь условия.</strong> Здесь показаны сведения из текущей базы сайта, а не подтверждение актуального конкурса. Программы, сроки, стоимость и стипендии уточняй у вуза и стипендиального органа. Отсутствие отметки в базе не означает отсутствие программы; поступление и стипендия не гарантируются.</p>
      </div>
    </div>
  );
}
