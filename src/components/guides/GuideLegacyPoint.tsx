"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Old links from the inline switcher (/guides/tests?point=2) open that step's page. */
export function GuideLegacyPoint({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();
  useEffect(() => {
    const point = Number(new URLSearchParams(window.location.search).get("point"));
    const target = hrefs[point - 1];
    if (Number.isInteger(point) && target) router.replace(target);
  }, [hrefs, router]);
  return null;
}
