export type HiggsfieldStage = "start" | "education12" | "docs" | "apply" | "dsu" | "visa" | "arrival";
export type HiggsfieldMedia = { poster: string; video?: string };

/** Stage art in the supplied zhol risograph style (Higgsfield, gpt_image_2_5):
 * one object per stage, the same souvenir the stage awards on completion.
 * Provenance and file hashes: design/mascot/vespi/handmade-v2.json.
 * Leaving video undefined avoids requests to nonexistent media files. */
export const HIGGSFIELD_VISUALS: Record<HiggsfieldStage, HiggsfieldMedia> = {
  start: { poster: "/illustrations/riso/map-480.webp" },
  education12: { poster: "/illustrations/riso/diploma-480.webp" },
  docs: { poster: "/illustrations/riso/folder-480.webp" },
  apply: { poster: "/illustrations/riso/envelope-480.webp" },
  dsu: { poster: "/illustrations/riso/coins-480.webp" },
  visa: { poster: "/illustrations/riso/passport-480.webp" },
  arrival: { poster: "/illustrations/riso/keys-480.webp" },
};

/** Optional task-specific exports override their stage without changing UI code. */
export const HIGGSFIELD_TASK_VISUALS: Record<string, HiggsfieldMedia | undefined> = {};
export const HIGGSFIELD_VESPI: Partial<Record<"idle" | "thinking" | "celebrate", string>> = {};

const LOCAL_PHASES: HiggsfieldStage[] = ["start", "apply", "docs", "dsu", "visa"];

export function higgsfieldStage(stage?: string): HiggsfieldStage {
  if (stage === "documents") return "docs";
  const local = stage && /^workspace-phase-(\d)$/.exec(stage);
  if (local) return LOCAL_PHASES[Number(local[1])] || "start";
  return stage && Object.hasOwn(HIGGSFIELD_VISUALS, stage) ? stage as HiggsfieldStage : "start";
}
