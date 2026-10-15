"use client";

import type { University } from "@/data/italy";
import ui from "./university-ui.module.css";

export function UniCard({
  uni,
  onOpen,
  inCompare,
  onToggleCompare,
  compareDisabled,
  selection,
}: {
  uni: University;
  onOpen: () => void;
  inCompare: boolean;
  onToggleCompare: () => void;
  compareDisabled: boolean;
  selection?: { selected: boolean; onToggle: () => void };
}) {
  return (
    <div className={ui.uniCard} data-uni-card={uni.id}>
      <button
        type="button"
        onClick={onOpen}
        className={ui.uniOpen}
      >
        <p className={ui.uniName}>{uni.name}</p>
        <p className={ui.uniType}>{uni.tp}</p>
      </button>
      <dl className={ui.uniDetails}>
        <div>
          <dt className={ui.detailLabel}>Стоимость</dt>
          <dd className={ui.detailValue}>{uni.tu}</dd>
        </div>
        <div>
          <dt className={ui.detailLabel}>Экзамен</dt>
          <dd className={ui.detailValue}>{uni.test}</dd>
        </div>
        <div>
          <dt className={ui.detailLabel}>Стипендия</dt>
          <dd className={ui.scholarship}>{uni.dsu}</dd>
        </div>
      </dl>
      <div className={ui.cardActions}>
        {selection && <label className={ui.shortlistToggle}>
          <input
            type="checkbox"
            checked={selection.selected}
            onChange={selection.onToggle}
            aria-label={`В мой список: ${uni.name}`}
            data-university-select={uni.id}
            className={ui.checkbox}
          />
          В мой список
        </label>}
        <div className={ui.tags}>
          {uni.eng && (
            <span className={ui.tag}>
              EN
            </span>
          )}
          {uni.med && (
            <span className={ui.tag}>
              Медицина
            </span>
          )}
        </div>
        <label className={ui.compareToggle}>
          <input
            type="checkbox"
            checked={inCompare}
            disabled={!inCompare && compareDisabled}
            onChange={onToggleCompare}
            className={ui.checkbox}
          />
          Сравнить
        </label>
      </div>
    </div>
  );
}
