/* eslint-disable @next/next/no-img-element -- A local pre-sized WebP is served directly by the static export. */
import { Check } from "lucide-react";
import styles from "./portal-document-coach.module.css";

/** One contextual illustration beside a real file-preparation action. */
export function PortalDocumentCoach() {
  return <aside className={styles.coach} data-portal-document-coach aria-label="Перед проверкой файла">
    <div>
      <p className={styles.label}>Веспи · перед проверкой</p>
      <h3>Подготовим файл к разбору</h3>
      <ul>
        <li><Check size={16} aria-hidden="true" />Текст читается, края страниц видны.</li>
        <li><Check size={16} aria-hidden="true" />Выбран нужный документ и контекст заявки.</li>
      </ul>
      <p className={styles.note}>После загрузки появится результат и следующий шаг.</p>
    </div>
    <img src="/mascot/vespi-document-coach.webp" alt="" width={180} height={239} loading="lazy" decoding="async" data-vespi="document-coach" />
  </aside>;
}
