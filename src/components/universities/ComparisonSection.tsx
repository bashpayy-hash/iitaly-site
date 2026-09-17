"use client";

import { CITIES, UNIS, type University } from "@/data/italy";
import { LemonPostcard } from "@/components/marketing/EditorialArtwork";
import { ComparisonTable } from "./ComparisonTable";
import styles from "./comparison.module.css";

const options = [...UNIS].sort((a, b) => CITIES[a.city].name.localeCompare(CITIES[b.city].name, "ru") || a.name.localeCompare(b.name));

export function ComparisonSection({ compareIds, onChange, onOpen }: {
  compareIds: string[];
  onChange: (ids: string[]) => void;
  onOpen: () => void;
}) {
  const universities = compareIds.map(id => UNIS.find(u => u.id === id)).filter((u): u is University => Boolean(u));
  function select(index: number, value: string) {
    const next = [...compareIds];
    if (!value) next.splice(index, 1);
    else next[index] = value;
    onChange([...new Set(next.filter(Boolean))].slice(0, 3));
  }
  return (
    <section className={styles.section} id="compare-universities" aria-labelledby="comparison-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Выбирай по тому, что важно тебе</p>
            <h2 id="comparison-heading">Сравни не только название.</h2>
            <p className={styles.description}>Город, программы, экзамены, сроки, стоимость и поддержка — рядом, в одной таблице. Добавь два или три вуза здесь или через карточки на карте.</p>
          </div>
          <LemonPostcard />
        </div>
        <div className={styles.selectors}>
          {[0, 1, 2].map(index => <label key={index} className={styles.selector}>
            <span>Университет {index + 1}{index === 2 ? " · необязательно" : ""}</span>
            <select aria-label={`Университет ${index + 1}`} value={compareIds[index] || ""} onChange={event => select(index, event.target.value)}>
              <option value="">Выбрать университет</option>
              {options.map(u => <option key={u.id} value={u.id} disabled={compareIds.includes(u.id) && compareIds[index] !== u.id}>{CITIES[u.city].name} — {u.name}</option>)}
            </select>
          </label>)}
        </div>
        <div className={styles.selectionActions}>
          <p role="status">Выбрано {universities.length} из 3</p>
          {universities.length > 0 && <button type="button" onClick={() => onChange([])}>Очистить выбор</button>}
          {universities.length >= 2 && <button type="button" onClick={onOpen}>Открыть в отдельном окне ↗</button>}
        </div>
        {universities.length >= 2 ? <ComparisonTable universities={universities} /> : <div className={styles.empty}>
          <span aria-hidden="true">01 / 02 / 03</span>
          <p>{universities.length === 1 ? "Добавь ещё один вуз для сравнения." : "Два вуза — уже начало выбора."}</p>
          <small>12 параметров · только различия · бюджет на 10 или 12 месяцев</small>
        </div>}
      </div>
    </section>
  );
}
