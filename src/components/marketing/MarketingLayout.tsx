import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { MarketingHeader } from "./MarketingHeader";
import styles from "./marketing.module.css";

/** Shared Renaissance gallery shell. */
export function MarketingLayout({ children, home = false }: { children: ReactNode; home?: boolean }) {
  return (
    <div className={`${styles.surface} ${home ? "" : styles.contentPage}`} data-marketing-surface>
      <MarketingHeader />
      <main id="main" className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
