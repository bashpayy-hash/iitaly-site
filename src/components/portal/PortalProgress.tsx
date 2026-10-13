import styles from "./portal-navigation.module.css";

export function PortalProgress({ stageTitle, done, total }: { stageTitle?: string; done: number; total: number }) {
  return <div className={styles.stageProgress} data-current-stage>
    <span>{stageTitle ? `${stageTitle}, ${done} из ${total}` : "Все шаги маршрута отмечены"}</span>
    <span data-progress-mascot aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img key={`${stageTitle}-${done}`} data-progress-mascot-art className={styles.mascot} src="/mascot/source/mascot-progress.svg" width={48} height={34} alt="" />
    </span>
  </div>;
}
