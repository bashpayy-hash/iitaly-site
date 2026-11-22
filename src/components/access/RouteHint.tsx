"use client";

import type { ReactNode } from "react";
import { usePaidDevice } from "./usePaidDevice";

/* Words that are true only before payment, inside pages that are otherwise
   static (funnel analysis, owner, 22 Nov: «где пользователю будет сложно
   ориентироваться»). A step's pager said «Дальше» over a step that opens a
   wall, and «Готово» on a step that had not been read. */

/** « · с маршрутом» after a label that leads to a locked step. */
export function RouteHint({ locked }: { locked: boolean }) {
  const paid = usePaidDevice();
  return locked && !paid ? <>{" · с маршрутом"}</> : null;
}

/** One of two labels: `open` for a step that can be read, `locked` for a guest on a locked one. */
export function OpenOrLocked({ isOpen, open, locked }: { isOpen: boolean; open: ReactNode; locked: ReactNode }) {
  const paid = usePaidDevice();
  return <>{isOpen || paid ? open : locked}</>;
}
