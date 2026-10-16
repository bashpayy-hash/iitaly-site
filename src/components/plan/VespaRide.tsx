import { Vespi } from "@/components/mascot/Vespi";
import styles from "./vespa-ride.module.css";

/** Truthful waiting state: only mounted while reading/checking. The approved
 * character stays intact; compositor-only movement stops for reduced motion. */
export function VespaRide({ text }: { text: string }) {
  return <div className={styles.card}>
    <p className="text-apple-body-sm text-cloud-body">{text}</p>
    <div aria-hidden className={styles.lane}>
      <div className={styles.scenery} />
      <div className={styles.road}><div className={styles.dashes} /></div>
      <div className={styles.rider}>
        <span className={styles.shadow} />
        <Vespi className={styles.body} sizes="72px" priority />
      </div>
    </div>
  </div>;
}
