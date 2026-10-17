import { Vespi } from "@/components/mascot/Vespi";

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
  return <Vespi variant={portrait ? "avatar" : "ride"} className={className} alt={alt} priority={priority} sizes={portrait ? "48px" : "192px"} />;
}
