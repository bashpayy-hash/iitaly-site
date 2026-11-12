"use client";

import { useState, useSyncExternalStore } from "react";
import { CITIES, UNIS, type University } from "@/data/italy";
import type { UniversitySelection } from "./UniversityDecision";
import { ComparisonTable } from "./ComparisonTable";
import { ComparisonDeck } from "./ComparisonDeck";
import styles from "./comparison.module.css";

// Server-exported native selects stay disabled until their React handlers exist.
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

const options = [...UNIS].sort((a, b) => CITIES[a.city].name.localeCompare(CITIES[b.city].name, "ru") || a.name.localeCompare(b.name));

export function ComparisonSection({ compareIds, onChange, onOpen, embedded = false, portalSelection, selection }: {
  selection?: UniversitySelection;
  compareIds: string[];
  onChange: (ids: string[]) => void;
  onOpen: () => void;
  embedded?: boolean;
  portalSelection?: { selectedIds: string[]; onToggle: (id: string) => void };
}) {
  const [mode, setMode] = useState<"grid" | "table">("grid");
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const universities = compareIds.map(id => UNIS.find(u => u.id === id)).filter((u): u is University => Boolean(u));
  function add(ids: string[]) {
    onChange([...new Set([...compareIds, ...ids])].slice(0, 3));
  }
  // Таблица нужна, когда есть что сопоставить: с одним вузом показываем карточку.
  const showTable = mode === "table" && universities.length >= 2;
  function select(index: number, value: string) {
    const next = [...compareIds];
    if (!value) next.splice(index, 1);
    else next[index] = value;
    onChange([...new Set(next.filter(Boolean))].slice(0, 3));
  }
  return (
    <section className={styles.section + (embedded ? " " + styles.embedded : "")} id="compare-universities" data-comparison-ready={ready} aria-labelledby={embedded ? undefined : "comparison-heading"} aria-label={embedded ? "Сравнение университетов" : undefined}>
      <div className={styles.inner}>
        {!embedded && <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>Выбирай по тому, что важно тебе</p>
            <h2 id="comparison-heading">Сравни не только название.</h2>
            <p className={styles.description}>Добавь до трёх вузов с карты. Сопоставь условия и выбери, с какого университета начнёшь свой план.</p>
          </div>
        </div>}
        {embedded && <h3 className={styles.embeddedHeading}>Сравнение университетов</h3>}
        <div className={styles.selectors}>
          {[0, 1, 2].map(index => <div key={index} className={styles.selector}>
            <label>
              <span>Университет {index + 1}{index === 2 ? " · необязательно" : ""}</span>
              <select disabled={!ready} aria-label={`Университет ${index + 1}`} value={compareIds[index] || ""} onChange={event => select(index, event.target.value)}>
                <option value="">Выбрать университет</option>
                {options.map(u => <option key={u.id} value={u.id} disabled={compareIds.includes(u.id) && compareIds[index] !== u.id}>{CITIES[u.city].name} — {u.name}</option>)}
              </select>
            </label>
            {portalSelection && compareIds[index] && <label className={styles.shortlistChoice}>
              <input type="checkbox" checked={portalSelection.selectedIds.includes(compareIds[index])} onChange={() => portalSelection.onToggle(compareIds[index])} aria-label={`Выбрать университет: ${UNIS.find(uni => uni.id === compareIds[index])?.name || compareIds[index]}`} />
              {portalSelection.selectedIds.includes(compareIds[index]) ? "Университет выбран" : "Выбрать университет"}
            </label>}
          </div>)}
        </div>
        {/* Строка управления: счёт и действия слева, вид — справа. Пока не
           выбрано ничего, её нет: «Выбрано 0 из 3» и переключатель вида без
           данных только шумели (owner, 12 Nov: «не прям юзер френдли»). */}
        {universities.length > 0 && <div className={styles.deckBar}>
          <div className={styles.selectionActions}>
            <p role="status">{embedded ? "В сравнении" : "Выбрано"} {universities.length} из 3</p>
            {universities.length > 0 && <button type="button" onClick={() => onChange([])}>Очистить выбор</button>}
            {universities.length >= 2 && <button type="button" onClick={onOpen}>Открыть в отдельном окне</button>}
          </div>
          {universities.length >= 2 && <div className={styles.viewModes} aria-label="Вид сравнения">
            <button type="button" aria-pressed={!showTable} onClick={() => setMode("grid")}>Карточки</button>
            <span aria-hidden="true">/</span>
            <button type="button" aria-pressed={showTable} onClick={() => setMode("table")}>Таблица</button>
          </div>}
        </div>}
        {showTable ? <ComparisonTable universities={universities} selection={selection} /> : <ComparisonDeck universities={universities} selection={selection} portalSelection={portalSelection} onRemove={id => onChange(compareIds.filter(value => value !== id))} onAdd={add} />}
      </div>
    </section>
  );
}
