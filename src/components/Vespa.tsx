import { Vespi, type VespiVariant } from "@/components/mascot/Vespi";

// Compatibility for existing functional placements. The approved Веспи
// Баурысаков replaces the old scooter without changing their behaviour.
export type VespaPose =
  | "master"
  | "hero"
  | "avatar"
  | "wave"
  | "compare"
  | "documents"
  | "deadline"
  | "visa"
  | "dsu"
  | "plan"
  | "thinking"
  | "empty"
  | "success"
  | "warning"
  | "error"
  | "404"
  | "celebrate";

const ROLE_BY_POSE: Record<VespaPose, VespiVariant> = {
  master: "route",
  hero: "route",
  avatar: "copilot",
  wave: "copilot",
  compare: "route",
  documents: "inspector",
  deadline: "copilot",
  visa: "inspector",
  dsu: "inspector",
  plan: "copilot",
  thinking: "copilot",
  empty: "copilot",
  // Generic success acknowledges an operation, not document acceptance.
  success: "copilot",
  warning: "inspector",
  error: "inspector",
  "404": "route",
  celebrate: "celebrate",
};

export function Vespa({
  pose,
  className = "",
  alt = "",
  priority = false,
}: {
  pose: VespaPose;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  const portrait = ["avatar", "thinking", "success", "warning", "error"].includes(pose);
  return <Vespi variant={ROLE_BY_POSE[pose]} presentation={portrait ? "portrait" : "figure"} className={className} alt={alt} priority={priority} sizes={portrait ? "48px" : "192px"} />;
}
