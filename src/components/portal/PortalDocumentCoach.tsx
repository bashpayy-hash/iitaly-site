import { WarmIcon } from "@/components/icons/WarmIcon";
import styles from "./portal-document-coach.module.css";

/** File preparation advice. The only portal mascot lives in the chat. */
export function PortalDocumentCoach(props: { illustrated?: boolean }) {
  void props; // Compatibility with existing callers; illustrations now belong to chat.
  return <aside className={styles.coach} data-portal-document-coach aria-label="Перед проверкой файла">
    <div>
      <p className={styles.label}>Перед проверкой</p>
      <h3>Подготовим файл к разбору</h3>
      <ul>
        <li><WarmIcon name="check" size={18} />Текст читается, края страниц видны.</li>
        <li><WarmIcon name="check" size={18} />Выбран нужный документ и контекст заявки.</li>
      </ul>
      <p className={styles.note}>После загрузки появится результат и следующий шаг.</p>
    </div>

  </aside>;
}
