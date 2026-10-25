export type HiggsfieldStage = "start" | "docs" | "apply" | "dsu" | "visa" | "arrival";
export type HiggsfieldMedia = { poster: string; video?: string };

/** Replace posters / add reviewed MP4 or WebM exports here, never a service API key.
 * Existing iItaly artwork is the fallback until the new Higgsfield exports arrive.
 * Leaving video undefined avoids requests to nonexistent media files. */
export const HIGGSFIELD_VISUALS: Record<HiggsfieldStage, HiggsfieldMedia> = {
  start: { poster: "/illustrations/editorial/portal-route-512.webp" },
  docs: { poster: "/illustrations/editorial/portal-documents-512.webp" },
  apply: { poster: "/illustrations/editorial/portal-campus-512.webp" },
  dsu: { poster: "/illustrations/editorial/portal-study-512.webp" },
  visa: { poster: "/illustrations/editorial/travel-paperwork-640.webp" },
  arrival: { poster: "/illustrations/editorial/campus-arrival-960.webp" },
};

/** Optional task-specific exports override their stage without changing UI code. */
export const HIGGSFIELD_TASK_VISUALS: Record<string, HiggsfieldMedia | undefined> = {};
export const HIGGSFIELD_VESPI: Partial<Record<"idle" | "thinking" | "celebrate", string>> = {};

export function higgsfieldStage(stage?: string): HiggsfieldStage {
  if (stage === "documents") return "docs";
  return stage && Object.hasOwn(HIGGSFIELD_VISUALS, stage) ? stage as HiggsfieldStage : "start";
}
