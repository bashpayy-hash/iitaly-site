import styles from "./portal-navigation.module.css";
import { Vespi } from "@/components/mascot/Vespi";

export function PortalProgress({ stageTitle, done, total }: { stageTitle?: string; done: number; total: number }) {
  return <div className={styles.stageProgress} data-current-stage>
    <span>{stageTitle ? `${stageTitle}, ${done} из ${total}` : "Все шаги маршрута отмечены"}</span>
    <span data-progress-mascot aria-hidden="true">
      <Vespi variant="avatar" className="h-8 w-8" sizes="32px" />
    </span>
  </div>;
}
