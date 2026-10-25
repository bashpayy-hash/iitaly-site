import { selectedUniversities } from "@/lib/portalShortlist";
import { fmtDate } from "@/lib/portalMeta";
import styles from "./portal-welcome.module.css";

export function PortalUniversitySummary({ ids, onEdit }: { ids: string[]; onEdit: () => void }) {
  const universities = selectedUniversities(ids);
  if (!universities.length) return null;
  return <div className={styles.universities} data-saved-universities>
    <span>Твои вузы</span>
    <ul>{universities.map(university => <li key={university.id}>{university.name}{university.deadline && <span> · До {fmtDate(university.deadline)}</span>}</li>)}</ul>
    <a href="/portal?view=plan&task=shortlist" onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); onEdit(); }}>изменить</a>
  </div>;
}
