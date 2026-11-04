import type { VespiPoseName } from "@/components/mascot/VespiPose";

/* Этап маршрута = костюм Веспи в плашке «Сейчас». Локальный кабинет делит
   путь на свои пять фаз, они сводятся к тем же этапам. Предметы этапов —
   общий набор design/illustrations/objects-2026-11-04.json (PortalStageLineup,
   higgsfieldVisuals). */

export type PortalStageKey = "start" | "education12" | "docs" | "apply" | "dsu" | "visa" | "arrival";
export type RisoArt = "map" | "diploma" | "folder" | "envelope" | "coins" | "passport" | "keys";

export const STAGE_ART: Record<PortalStageKey, { pose: VespiPoseName }> = {
  start: { pose: "stage-start" },
  education12: { pose: "stage-education" },
  docs: { pose: "stage-docs" },
  apply: { pose: "stage-apply" },
  dsu: { pose: "stage-dsu" },
  visa: { pose: "stage-visa" },
  arrival: { pose: "stage-arrival" },
};

const LOCAL_PHASES: PortalStageKey[] = ["start", "apply", "docs", "dsu", "visa"];

export function stageKey(id?: string | null): PortalStageKey {
  if (!id) return "start";
  if (id === "documents") return "docs";
  const local = /^workspace-phase-(\d)$/.exec(id);
  if (local) return LOCAL_PHASES[Number(local[1])] || "start";
  return Object.hasOwn(STAGE_ART, id) ? id as PortalStageKey : "start";
}
