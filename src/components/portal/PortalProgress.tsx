import { CheckCircle2 } from "lucide-react";
import styles from "./portal-navigation.module.css";

export function PortalProgress({ stageTitle, done, total }: { stageTitle?: string; done: number; total: number }) {
  return <div className={styles.stageProgress} data-current-stage>
    <span>{stageTitle ? `${stageTitle}, ${done} из ${total}` : "Все шаги маршрута отмечены"}</span>
    {total > 0 && done === total && <CheckCircle2 size={20} aria-hidden="true" />}
  </div>;
}
