"use client";

import { useEffect } from "react";
import { usePaidDevice } from "@/components/access/usePaidDevice";
import { markGuideRead } from "./guideReading";

/** Marks a guide page as read on this device once its text is on screen:
 *  an open page at once, a closed one only on a device with a paid cabinet. */
export function GuideReadMark({ readKey, open }: { readKey: string; open: boolean }) {
  const paid = usePaidDevice();
  useEffect(() => { if (open || paid) markGuideRead(readKey); }, [readKey, open, paid]);
  return null;
}
