import type { PortalProfile } from "@/lib/portalApi";
import { wizardFor } from "@/data/wizardTracks";
import { masterDiploma } from "@/lib/portalNavigation";
import styles from "./portal-step.module.css";

export function SavedProfileAnswers({ profile, answers, onEdit }: { profile: PortalProfile; answers?: Record<string, string>; onEdit: () => void }) {
  const diploma = masterDiploma(profile);
  const rows = answers ? wizardFor(answers).filter(question => answers[question.id]).map(question => [question.q, question.opts.find(option => option.v === answers[question.id])?.t || answers[question.id]]) : [
    diploma ? ["Диплом бакалавра", diploma] : ["Этап учёбы", profile.education], ["Цель", profile.goal], ["Бюджет", profile.budget],
    ["Путь", profile.educationPath === "university_kz" ? "Год в вузе Казахстана" : profile.educationPath === "foundation" ? "Подготовительная программа" : undefined],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  return <section data-saved-profile aria-label="Сохранённые ответы">
    <dl className={styles.answers}>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    {!rows.length && <p>Сохранённые ответы не найдены. Открой профиль, чтобы заполнить их.</p>}
    <a className={styles.link} href="/portal?view=settings" onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onEdit(); }}>Изменить</a>
  </section>;
}
