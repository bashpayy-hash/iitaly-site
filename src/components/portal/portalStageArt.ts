import type { VespiPoseName } from "@/components/mascot/VespiPose";

/* Этап маршрута = костюм Веспи в плашке «Сейчас». Локальный кабинет делит
   путь на свои пять фаз, они сводятся к тем же этапам. Ризограф-предметы
   остаются иллюстрациями шагов (RisoArtImage, higgsfieldVisuals). */

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

export const RISO_SIZE: Record<RisoArt | "stamp-pad", { width: number; height: number }> = {
  map: { width: 480, height: 350 },
  diploma: { width: 480, height: 357 },
  folder: { width: 480, height: 340 },
  envelope: { width: 480, height: 367 },
  coins: { width: 480, height: 467 },
  passport: { width: 480, height: 349 },
  keys: { width: 480, height: 362 },
  "stamp-pad": { width: 480, height: 357 },
};
