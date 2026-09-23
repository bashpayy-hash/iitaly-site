"use client";

import { useRouter } from "next/navigation";
import type { PortalData } from "@/lib/portalApi";
import { ACT_PAGE, DOC_TASKS, TASK_META, dlState, dlText, fmtDate } from "@/lib/portalMeta";
import styles from "./portal.module.css";

type FlatItem = {
  st: string;
  stId: string;
  order: number;
  t: PortalData["roadmap"][number]["tasks"][number];
  done: boolean;
};

function flatTasks(data: PortalData): FlatItem[] {
  const out: FlatItem[] = [];
  let order = 0;
  for (const st of data.roadmap) {
    for (const t of st.tasks) {
      out.push({ st: st.title, stId: st.id, order: order++, t, done: !!data.done[t.id] });
    }
  }
  return out;
}

function priority(item: FlatItem) {
  if (item.done) return 9999;
  const days = item.t.daysLeft;
  if (days != null && days < 0) return -1000 + days;
  if (days != null && days <= 14) return -500 + days;
  if (days != null && days <= 45) return -200 + days;
  return item.order;
}

function nextActions(data: PortalData) {
  return flatTasks(data)
    .filter((item) => !item.done)
    .sort((a, b) => priority(a) - priority(b) || a.order - b.order)
    .slice(0, 3);
}

function deadlineItems(data: PortalData) {
  return flatTasks(data)
    .filter((item) => !item.done && item.t.deadline)
    .sort((a, b) => String(a.t.deadline).localeCompare(String(b.t.deadline)))
    .slice(0, 4);
}

export function TodaySection({
  data,
  onGoto,
  onMarkDone,
  onOpenDocs,
  onOpenHelp,
}: {
  data: PortalData;
  onGoto: (stageId: string) => void;
  onMarkDone: (taskId: string) => void;
  onOpenDocs: () => void;
  onOpenHelp: () => void;
}) {
  const router = useRouter();
  const actions = nextActions(data);
  const deadlines = deadlineItems(data);
  const flat = flatTasks(data);
  const overdue = flat.filter((item) => !item.done && item.t.daysLeft != null && item.t.daysLeft < 0);
  const urgent = flat.filter((item) => !item.done && item.t.daysLeft != null && item.t.daysLeft >= 0 && item.t.daysLeft <= 14);
  const docRows = flat.filter((item) => Boolean(DOC_TASKS[item.t.id]));
  const docsReady = docRows.filter((item) => data.docs?.[item.t.id]?.verdict === "ok").length;
  const docsIssues = docRows.filter((item) => data.docs?.[item.t.id] && data.docs[item.t.id].verdict !== "ok").length;
  const tgOn = Boolean(data.client.tgLinked) && data.client.notify?.telegram !== false;
  const needsAttention = overdue.length > 0 || urgent.length > 0 || docsIssues > 0;

  function act(item: FlatItem) {
    const page = ACT_PAGE[item.t.id];
    if (page) {
      router.push(page);
      return;
    }
    if (item.t.ai || item.t.expert) {
      window.dispatchEvent(
        new CustomEvent("iitaly:open-chat", { detail: { prefill: `Помоги с шагом: ${item.t.t}` } }),
      );
      return;
    }
    onGoto(item.stId);
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Твой маршрут</p>
          <h2 className={styles.heroTitle}>Твой путь к поступлению</h2>

          <div className={styles.heroMeta}>
            <span className={styles.heroCount}>{data.progress.done} из {data.progress.total} шагов</span>
            <span className={styles.heroPct}>{data.progress.pct}%</span>
          </div>
          <div className={styles.progressTrack} aria-label={`Пройдено ${data.progress.pct}%`}>
            <div className={styles.progressFill} style={{ width: `${data.progress.pct}%` }} />
          </div>

          <div className={styles.statusBadge} data-state={needsAttention ? "attention" : "ok"}>
            <span aria-hidden>{needsAttention ? "!" : "✓"}</span>
            {needsAttention ? "Есть несколько вещей, которые лучше не откладывать" : "Всё под контролем"}
          </div>

          {actions[0] && (
            <div className={styles.focusLine}>
              <span className={styles.focusDot} aria-hidden />
              <span>Сейчас важнее всего — {actions[0].t.t.toLowerCase()}.</span>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Что делать сейчас</h2>
            <p>Система сама поднимает наверх срочные и логически следующие шаги.</p>
          </div>
          <button type="button" className={styles.textLink} onClick={() => onGoto(actions[0]?.stId || data.roadmap[0]?.id || "")}>
            Смотреть весь план →
          </button>
        </div>

        {actions.length === 0 ? (
          <div className={styles.card}>
            <div className={styles.actionTitle}>Маршрут закрыт</div>
            <p className={styles.actionBody}>Все текущие шаги отмечены как выполненные. Если появятся новые задачи, они автоматически поднимутся сюда.</p>
          </div>
        ) : (
          <div className={styles.actionGrid}>
            {actions.map((item, index) => {
              const meta = TASK_META[item.t.id] || {};
              const state = dlState(item.t, item.done);
              const auto = item.t.ai || item.t.expert;
              return (
                <article
                  key={item.t.id}
                  className={`${styles.actionCard} ${index === 0 ? styles.actionCardPrimary : ""}`}
                >
                  <span className={styles.actionNum}>{index + 1}</span>
                  <div className={styles.actionTitle}>{item.t.t}</div>
                  <p className={styles.actionBody}>{meta.why || item.t.note || `Следующий шаг этапа «${item.st}».`}</p>

                  <div className={styles.actionFoot}>
                    <span className={styles.actionDeadline} data-state={state}>
                      {item.t.deadline ? dlText(item.t, false) : item.st}
                    </span>
                    <button
                      type="button"
                      className={index === 0 ? styles.primaryButton : styles.secondaryButton}
                      onClick={() => act(item)}
                    >
                      {meta.act || (auto ? "Разобрать" : "Открыть")}
                    </button>
                  </div>

                  {!auto && index === 0 && (
                    <button
                      type="button"
                      onClick={() => onMarkDone(item.t.id)}
                      className={styles.textLink}
                      style={{ alignSelf: "flex-start", marginTop: 10 }}
                    >
                      Уже сделал
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.overviewGrid}>
          <div className={styles.card}>
            <div className={styles.sectionHeading}>
              <div>
                <h3>Ближайшие дедлайны</h3>
                <p>Только ближайшие даты — без календарного шума.</p>
              </div>
              <button type="button" className={styles.textLink} onClick={() => onGoto(actions[0]?.stId || data.roadmap[0]?.id || "")}>
                План →
              </button>
            </div>
            <div className={styles.deadlineList}>
              {deadlines.length ? deadlines.map((item) => {
                const state = dlState(item.t, false);
                return (
                  <div key={item.t.id} className={styles.deadlineRow}>
                    <span className={styles.deadlineDate}>{fmtDate(item.t.deadline as string)}</span>
                    <span className={styles.deadlineName}>{item.t.t}</span>
                    <span className={styles.deadlineState} data-state={state}>{dlText(item.t, false)}</span>
                  </div>
                );
              }) : (
                <p className={styles.actionBody}>Ближайших дедлайнов нет.</p>
              )}
            </div>
          </div>

          <div className={styles.summaryStack}>
            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>Документы</h3>
                  <p>Что уже готово и где есть замечания.</p>
                </div>
                <button type="button" className={styles.textLink} onClick={onOpenDocs}>Открыть →</button>
              </div>
              <div className={styles.summaryMetric}>
                <span>Проверены</span>
                <strong>{docsReady}</strong>
              </div>
              <div className={styles.summaryMetric}>
                <span>Есть замечания</span>
                <strong>{docsIssues}</strong>
              </div>
              <div className={styles.summaryMetric}>
                <span>Всего требуют проверки</span>
                <strong>{docRows.length}</strong>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.sectionHeading}>
                <div>
                  <h3>Напоминания</h3>
                  <p>{tgOn ? "Telegram подключён — дедлайны придут автоматически." : "Подключи Telegram, чтобы не держать даты в голове."}</p>
                </div>
              </div>
              <button type="button" className={tgOn ? styles.secondaryButton : styles.primaryButton} onClick={onOpenHelp}>
                {tgOn ? "Настроить" : "Подключить Telegram"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Путь целиком</h2>
            <p>Этапы видны, но не требуют внимания, пока до них не дошла очередь.</p>
          </div>
        </div>
        <div className={`${styles.card} ${styles.stageList}`}>
          {data.roadmap.map((stage) => {
            const total = stage.tasks.length;
            const done = stage.tasks.filter((task) => data.done[task.id]).length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <button key={stage.id} type="button" className={styles.stageRow} onClick={() => onGoto(stage.id)}>
                <span className={styles.stageName}>{stage.title}</span>
                <span className={styles.miniTrack} aria-hidden>
                  <span className={styles.miniFill} style={{ width: `${pct}%` }} />
                </span>
                <span className={styles.stageMeta}>{done}/{total}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
