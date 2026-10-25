import type { VespiPoseName } from "@/components/mascot/VespiPose";

/* Этап маршрута = костюм Веспи + сувенир в технике ризографии (стиль zhol).
   Сувенир — награда за пройденный этап, показывается только когда все шаги
   этапа сохранены. Локальный кабинет делит путь на свои пять фаз, они
   сводятся к тем же этапам. */

export type PortalStageKey = "start" | "education12" | "docs" | "apply" | "dsu" | "visa" | "arrival";
export type RisoArt = "map" | "diploma" | "folder" | "envelope" | "coins" | "passport" | "keys";

export const STAGE_ART: Record<PortalStageKey, { pose: VespiPoseName; souvenir: RisoArt; prize: string }> = {
  start: { pose: "stage-start", souvenir: "map", prize: "Карта маршрута" },
  education12: { pose: "stage-education", souvenir: "diploma", prize: "Свиток 12 лет" },
  docs: { pose: "stage-docs", souvenir: "folder", prize: "Папка с печатью" },
  apply: { pose: "stage-apply", souvenir: "envelope", prize: "Письмо из вуза" },
  dsu: { pose: "stage-dsu", souvenir: "coins", prize: "Копилка DSU" },
  visa: { pose: "stage-visa", souvenir: "passport", prize: "Паспорт со штампом" },
  arrival: { pose: "stage-arrival", souvenir: "keys", prize: "Ключи от нового дома" },
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
