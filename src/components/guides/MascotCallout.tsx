import type { ReactNode } from "react";
import { Vespi } from "@/components/mascot/Vespi";
import ui from "./guide-browser.module.css";

/** Preserve the reviewed warning verbatim; Vespi helps locate it, not certify it. */
export function MascotCallout({ children }: { children: ReactNode }) {
  return <aside className={ui.callout} data-vespi-tip>
    <Vespi variant="avatar" className={ui.tipAvatar} sizes="36px" />
    <div><p className={ui.tipLabel}>Веспи напоминает</p><div>{children}</div></div>
  </aside>;
}
