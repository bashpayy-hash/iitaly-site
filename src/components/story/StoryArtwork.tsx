/* eslint-disable @next/next/no-img-element -- Existing, sized local cutouts; no generated or remote assets. */
import styles from "./story.module.css";

export type StorySubject = "map" | "folder" | "calendar" | "envelope" | "key" | "vespi";
export function StoryArtwork({ subject, className = "", eager = false }: { subject: StorySubject; className?: string; eager?: boolean }) {
  const src = subject === "vespi" ? "/mascot/vespi-portal-welcome.webp" : `/illustrations/public-paper/${subject}-320.webp`;
  return <div className={`${styles.artwork} ${className}`} data-story-art={subject} aria-hidden="true">
    <img src={src} alt="" width={320} height={320} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
  </div>;
}

/** A visual mnemonic only: it never represents a document or an approval. */
export function taskArtwork(taskId: string, stageId?: string): StorySubject {
  if (/kit|codice|questura|permesso/.test(taskId) || stageId === "arrival") return "key";
  if (/test|exam|ielts|tolc|deadline/.test(taskId)) return "calendar";
  if (/apply|universitaly|visa|dsu|iseeu|income|bank|family/.test(taskId) || ["apply", "dsu", "visa"].includes(stageId || "")) return "envelope";
  if (/profile|shortlist|chances|path12/.test(taskId) || stageId === "start") return "map";
  return "folder";
}
