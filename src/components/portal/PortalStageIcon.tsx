import { BookOpen, Files, GraduationCap, HandCoins, Map, Plane, Languages } from "lucide-react";

/** Section identity without another face or an inferred document verdict. */
export function PortalStageIcon({ id, className = "" }: { id: string; className?: string }) {
  const phase = id.match(/^workspace-phase-(\d)$/)?.[1];
  const Icon = phase ? [Map, Languages, Files, HandCoins, Plane][Number(phase)] || BookOpen : /education|start/.test(id) ? Map : /test|language/.test(id) ? Languages
    : /dsu|financ|scholar/.test(id) ? HandCoins : /visa|arrival/.test(id) ? Plane
      : /apply|admission/.test(id) ? GraduationCap : /doc/.test(id) ? Files : BookOpen;
  return <Icon className={className} size={20} strokeWidth={1.5} aria-hidden="true" data-stage-icon />;
}
