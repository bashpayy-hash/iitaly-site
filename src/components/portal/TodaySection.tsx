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
    for (const t of st.tasks) out.push({ st: st.title, stId: st.id, order: order++, t, done: !!data.done[t.id] });
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
    .slice(0, 4);
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
  const primary = actions[0];
  const secondary = actions.slice(1);
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
      window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: { prefill: "Помоги с шагом: " + item.t.t } }));
      return;
    }
    onGoto(item.stId);
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Твой маршрут</p>
          <h2 className={styles.heroTitle}>До Италии — по одному понятному шагу.</h2>
          <p className={styles.heroLead}>
            Не нужно держать весь процесс в голове. Кабинет сам поднимает наверх то, что важно сейчас, и прячет остальное до нужного момента.
          </p>

          <div className={styles.heroProgressRow}>
            <div>
              <span className={styles.heroCount}>{data.progress.done} из {data.progress.total}</span>
              <span className={styles.heroPct}> шагов завершено · {data.progress.pct}%</span>
            </div>
            <span className={styles.statusBadge} data-state={needsAttention ? "attention" : "ok"}>
              {needsAttention ? "Нужно внимание" : "Идёшь по плану"}
            </span>
          </div>
          <div className={styles.progressTrack} aria-label={"Пройдено " + data.progress.pct + "%"}>
            <div className={styles.progressFill} style={{ width: data.progress.pct + "%" }} />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Сейчас</p>
            <h2>Один главный шаг</h2>
          </div>
          <button type="button" className={styles.textLink} onClick={() => onGoto(primary?.stId || data.roadmap[0]?.id || "")}>
            Весь план →
          </button>
        </div>

        {primary ? (
          <article className={styles.nextStep}>
            <div className={styles.nextStepMain}>
              <span className={styles.nextStepLabel}>Следующий шаг</span>
              <h3 className={styles.nextStepTitle}>{primary.t.t}</h3>
              <p className={styles.nextStepBody}>
                {(TASK_META[primary.t.id] || {}).why || primary.t.note || "Это следующий шаг этапа «" + primary.st + "»."}
              </p>
              <div className={styles.nextStepMeta}>
                <span>{primary.st}</span>
                {primary.t.deadline && <span>{dlText(primary.t, false)}</span>}
              </div>
            </div>
            <div className={styles.nextStepActions}>
              <button type="button" className={styles.primaryButton} onClick={() => act(primary)}>
                {(TASK_META[primary.t.id] || {}).act || (primary.t.ai || primary.t.expert ? "Разобрать шаг" : "Открыть шаг")}
              </button>
              {!primary.t.ai && !primary.t.expert && (
                <button type="button" onClick={() => onMarkDone(primary.t.id)} className={styles.textLink}>
                  Уже сделал
                </button>
              )}
            </div>
          </article>
        ) : (
          <div className={styles.card}>
            <div className={styles.actionTitle}>Все текущие шаги закрыты</div>
            <p className={styles.actionBody}>Когда появится следующий этап, он автоматически станет главным действием здесь.</p>
          </div>
        )}

        {secondary.length > 0 && (
          <div className={styles.secondarySteps}>
            {secondary.map((item, index) => (
              <button key={item.t.id} type="button" className={styles.secondaryStep} onClick={() => act(item)}>
                <span className={styles.secondaryStepIndex}>{index + 2}</span>
                <span className={styles.secondaryStepCopy}>
                  <strong>{item.t.t}</strong>
                  <small>{item.t.deadline ? dlText(item.t, false) : item.st}</small>
                </span>
                <span className={styles.secondaryStepArrow} aria-hidden>→</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.overviewGrid}>
          <div className={styles.card}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Время</p>
                <h3>Ближайшие дедлайны</h3>
              </div>
              <button type="button" className={styles.textLink} onClick={() => onGoto(primary?.stId || data.roadmap[0]?.id || "")}>План →</button>
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
              }) : <p className={styles.actionBody}>Ближайших дедлайнов нет.</p>}
            </div>
          </div>

          <div className={styles.summaryStack}>
            <button type="button" className={styles.card + " " + styles.summaryCardButton} onClick={onOpenDocs}>
              <div className={styles.summaryHeader}>
                <div>
                  <p className={styles.kicker}>Документы</p>
                  <h3>{docsIssues ? "Есть что исправить" : "Пакет движется"}</h3>
                </div>
                <span aria-hidden>→</span>
              </div>
              <div className={styles.summaryLine}><span>Готовы</span><strong>{docsReady}</strong></div>
              <div className={styles.summaryLine}><span>С замечаниями</span><strong>{docsIssues}</strong></div>
              <div className={styles.summaryLine}><span>Всего в маршруте</span><strong>{docRows.length}</strong></div>
            </button>

            <button type="button" className={styles.card + " " + styles.summaryCardButton} onClick={onOpenHelp}>
              <div className={styles.summaryHeader}>
                <div>
                  <p className={styles.kicker}>Напоминания</p>
                  <h3>{tgOn ? "Telegram подключён" : "Подключить Telegram"}</h3>
                </div>
                <span aria-hidden>→</span>
              </div>
              <p className={styles.actionBody}>
                {tgOn ? "Дедлайны придут автоматически — за 7, 3 и 1 день." : "Чтобы не держать все даты в голове."}
              </p>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Дальше</p>
            <h2>Путь целиком</h2>
            <p>Этапы остаются видимыми, но не требуют внимания раньше времени.</p>
          </div>
        </div>
        <div className={styles.card + " " + styles.stageList}>
          {data.roadmap.map((stage) => {
            const total = stage.tasks.length;
            const done = stage.tasks.filter((task) => data.done[task.id]).length;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <button key={stage.id} type="button" className={styles.stageRow} onClick={() => onGoto(stage.id)}>
                <span className={styles.stageName}>{stage.title}</span>
                <span className={styles.miniTrack} aria-hidden><span className={styles.miniFill} style={{ width: pct + "%" }} /></span>
                <span className={styles.stageMeta}>{done}/{total}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
