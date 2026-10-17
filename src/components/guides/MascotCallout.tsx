import type { ReactNode } from "react";
import ui from "./guide-browser.module.css";

/** Reviewed warnings stay verbatim. Reserve the character for personal help. */
export function MascotCallout({ children }: { children: ReactNode }) {
  return <aside className={ui.callout} data-vespi-tip>
    <div><p className={ui.tipLabel}>Обрати внимание</p><div>{children}</div></div>
  </aside>;
}
