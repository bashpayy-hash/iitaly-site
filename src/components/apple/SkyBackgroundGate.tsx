"use client";

import { usePathname } from "next/navigation";
import { SkyBackground } from "@/components/apple/SkyBackground";

/** One shared sky behind the home product stage. Forms use an opaque light
 * surface; /universities and all legacy routes still render no background. */
const SCRIM_BY_PATH: Record<string, number> = {
  "/": 0.38,
};

export function SkyBackgroundGate() {
  const pathname = usePathname();
  const scrim = SCRIM_BY_PATH[pathname ?? ""];
  if (scrim === undefined) return null;
  return <SkyBackground scrim={scrim} />;
}
