"use client";

import type { DocumentReviewContext } from "@/lib/checkDocument";
import styles from "./portal-document.module.css";

export function PortalDocumentContext({ value, onChange, disabled }: {
  value: DocumentReviewContext;
  onChange: (value: DocumentReviewContext) => void;
  disabled: boolean;
}) {
  return <details className={styles.context}>
    <summary>Параметры следующей проверки</summary>
    <fieldset disabled={disabled}>
      <legend>Для какой заявки?</legend>
      <p>Эти параметры уточняют проверку документов для стипендии. Для визы и поступления проверяем видимое содержание файла; требования учреждения нужно сверить отдельно.</p>
      <div className={styles.contextFields}>
        <label>Стипендиальная программа
          <select value={value.profile} onChange={e => onChange({ ...value, profile: e.target.value as DocumentReviewContext["profile"] })}>
            <option value="general">Не знаю / другая заявка</option>
            <option value="bocconi">Bocconi · ISU / ISEEU</option>
            <option value="piemonte">EDISU Piemonte</option>
            <option value="toscana">DSU Toscana</option>
            <option value="ergo">ER.GO · Emilia-Romagna</option>
          </select>
        </label>
        <label>Учебный год заявки
          <select value={value.academicYear} onChange={e => onChange({ ...value, academicYear: e.target.value as DocumentReviewContext["academicYear"] })}>
            <option value="unspecified">Ещё не определился</option>
            <option value="2026/27">2026/27</option>
            <option value="2027/28">2027/28</option>
          </select>
        </label>
      </div>
      {value.profile !== "general" && <label className={styles.scopeChoice}>
        <input type="checkbox" checked={value.applicantScope === "kz-family-abroad"}
          onChange={e => onChange({ ...value, applicantScope: e.target.checked ? "kz-family-abroad" : "unspecified" })} />
        <span>Я гражданин Казахстана, подаю сведения о семейных доходах и имуществе за пределами Италии и не заявляю финансовую независимость.</span>
      </label>}
      <p className={styles.meta}>Выбери параметры до загрузки файла. Изменение этих полей не меняет уже сохранённый результат. Применённые правила и их актуальность будут указаны в новом разборе.</p>
    </fieldset>
  </details>;
}
