import { Check } from "lucide-react";
import styles from "./portal-document-coach.module.css";
import { VespiScene } from "@/components/mascot/VespiScene";

/** One contextual illustration beside a real file-preparation action. */
export function PortalDocumentCoach({ illustrated = true }: { illustrated?: boolean }) {
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
    {illustrated && <VespiScene pose="documents" className={styles.scene} sizes="(max-width: 600px) 88px, 200px" />}
  </aside>;
}
