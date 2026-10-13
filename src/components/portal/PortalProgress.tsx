import type { PortalData } from "@/lib/portalApi";
import styles from "./portal.module.css";

export function PortalProgress({
  progress,
  stageTitle,
  onOpenPlan,
}: {
  progress: PortalData["progress"];
  stageTitle?: string;
  onOpenPlan?: () => void;
}) {
  const { done, total, pct } = progress;
  const complete = total > 0 && done >= total;
  const count = `Выполнено ${done} из ${total} шагов`;

  return (
    <section className={styles.routeProgress} aria-label="Прогресс по плану">
      <div className={styles.routeProgressHeading}>
        <div>
          <h2>Твой прогресс</h2>
          <p className={styles.routeProgressCount} aria-live="polite" aria-atomic="true">
            {total > 0 ? count : "В плане пока нет шагов"}
          </p>
        </div>
        {total > 0 && <span className={styles.routeProgressPercent} aria-hidden="true">{pct}<span>%</span></span>}
      </div>

      {total > 0 && (
        <>
          <div
            className={styles.routeProgressTrack}
            role="progressbar"
            aria-label="Выполнение плана"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
            aria-valuetext={count}
          >
            <span className={styles.routeProgressFill} style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.routeProgressFooter}>
            <p>
              {complete
                ? "Все шаги маршрута отмечены"
                : stageTitle
                  ? <>Этап: <strong>{stageTitle}</strong></>
                  : "Остальные шаги будут доступны позже"}
            </p>
            {onOpenPlan && (
              <button type="button" className={styles.routeProgressLink} onClick={onOpenPlan}>
                Открыть план <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
