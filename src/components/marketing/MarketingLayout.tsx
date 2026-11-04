import type { ReactNode } from "react";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import styles from "./marketing.module.css";

/** Opt-in shell. Never wrap /universities or the legacy portal in this component. */
export function MarketingLayout({ children, home = false, paper = true }: { children: ReactNode; home?: boolean; paper?: boolean }) {
  return (
    <div className={`${styles.surface} ${home ? "" : styles.contentPage}`} data-marketing-surface>
      <MarketingHeader />
      <main id="main" className={styles.main} data-public-paper-canvas={paper || undefined}>{children}</main>
      <MarketingFooter />
    </div>
  );
}
