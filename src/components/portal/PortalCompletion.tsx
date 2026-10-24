import type { CompletionFeedback } from "./usePortalFeedback";
import styles from "./portal-focus.module.css";

export function PortalCompletion({ feedback }: { feedback: CompletionFeedback | null }) {
  return <div className={styles.confirmation} role="status" aria-live="polite" aria-atomic="true" data-portal-completion={feedback?.taskId || ""} data-visible={Boolean(feedback)}>
    {feedback && <div key={feedback.id} className={styles.confirmationBody}>
      <svg viewBox="0 0 56 56" width="48" height="48" fill="none" aria-hidden="true" className={styles.successIcon}>
        <circle cx="28" cy="28" r="23" pathLength="100" />
        <path d="m17 28 7 7 15-15" pathLength="100" />
      </svg>
      <div><strong>Шаг сохранён</strong><span>{feedback.title}</span></div>
    </div>}
  </div>;
}

export function PortalSoundSetting({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return <label className={styles.soundSetting}><input type="checkbox" checked={enabled} onChange={onToggle} />Звук при выполнении шага</label>;
}
