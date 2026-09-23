"use client";

import type { PortalData } from "@/lib/portalApi";
import { DOC_TASKS, V_LABEL } from "@/lib/portalMeta";
import styles from "./portal.module.css";

export function DocsSection({
  data,
  onUploadDoc,
  busyTask,
}: {
  data: PortalData;
  onUploadDoc: (taskId: string) => void;
  busyTask: string | null;
}) {
  const rows: { id: string; title: string; stage: string; doc?: PortalData["docs"][string] }[] = [];
  for (const st of data.roadmap) {
    for (const t of st.tasks) {
      if (!DOC_TASKS[t.id]) continue;
      rows.push({ id: t.id, title: DOC_TASKS[t.id], stage: st.title, doc: data.docs?.[t.id] });
    }
  }

  const ready = rows.filter((r) => r.doc?.verdict === "ok").length;
  const issues = rows.filter((r) => r.doc && r.doc.verdict !== "ok").length;
  const missing = rows.filter((r) => !r.doc).length;
  const firstIssue = rows.find((r) => r.doc && r.doc.verdict !== "ok");
  const firstMissing = rows.find((r) => !r.doc);
  const focus = firstIssue || firstMissing;

  return (
    <div>
      <section className={styles.docsHero}>
        <div className={styles.docsHeroContent}>
          <p className={styles.kicker}>Документы</p>
          <h2 className={styles.heroTitle}>Сначала закрой обязательные документы</h2>
          <p className={styles.actionBody}>
            Не нужно помнить весь пакет. Система показывает, что уже готово, что требует исправления и что загрузить следующим.
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.heroCount}>{ready} из {rows.length} готовы</span>
            <span className={styles.heroPct}>{missing} ещё не загружено</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: (rows.length ? Math.round((ready / rows.length) * 100) : 0) + "%" }} />
          </div>
          {focus && (
            <div className={styles.focusLine}>
              <span className={styles.focusDot} aria-hidden />
              <span>Сейчас важнее всего — {focus.doc ? "исправить «" + focus.title + "»" : "загрузить «" + focus.title + "»"}.</span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.overviewGrid}>
          <div className={styles.card}>
            <div className={styles.sectionHeading}>
              <div>
                <h3>Список документов</h3>
                <p>Статус и следующее действие по каждому файлу.</p>
              </div>
            </div>
            <div className={styles.docList}>
              {rows.map((row) => {
                const verdict = row.doc?.verdict;
                const state = verdict === "ok" ? "ok" : verdict ? verdict : "missing";
                return (
                  <div key={row.id} className={styles.docRow}>
                    <div>
                      <div className={styles.docTitle}>{row.title}</div>
                      <div className={styles.docMeta}>{row.stage}</div>
                      {row.doc?.summary && <p className={styles.taskNote}>{row.doc.summary}</p>}
                      {row.doc?.critical ? <p className={styles.taskWarn}>Критических ошибок: {row.doc.critical}</p> : null}
                    </div>
                    <span className={styles.statusChip} data-state={state}>
                      {row.doc ? (V_LABEL[row.doc.verdict] || "Проверен") : "Нет файла"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUploadDoc(row.id)}
                      disabled={busyTask === row.id}
                      className={verdict === "ok" ? styles.secondaryButton : styles.primaryButton}
                    >
                      {busyTask === row.id ? "Проверяю…" : row.doc ? "Проверить снова" : "Загрузить"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.summaryStack}>
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>Сводка</h3>
                  <p>Только три числа, которые реально помогают понять состояние пакета.</p>
                </div>
              </div>
              <div className={styles.summaryMetric}><span>Проверены</span><strong>{ready}</strong></div>
              <div className={styles.summaryMetric}><span>Есть замечания</span><strong>{issues}</strong></div>
              <div className={styles.summaryMetric}><span>Не загружены</span><strong>{missing}</strong></div>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>Как работает проверка</h3>
                  <p>Загрузил → получил вердикт → исправил → проверил снова.</p>
                </div>
              </div>
              <p className={styles.actionBody}>
                ИИ сверяет файл с требованиями шага. Если есть критичная ошибка, она остаётся видимой до следующей проверки.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
