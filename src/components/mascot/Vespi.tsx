export const VESPI_NAME = "Веспи";
export type VespiVariant = "route" | "inspector" | "celebrate" | "copilot";
export type VespiPresentation = "portrait" | "figure";
/** Legacy task states remain text-only; the home introduction owns its artwork. */
export function Vespi(props: {variant?: "ride"|"avatar"|VespiVariant; presentation?:VespiPresentation; className?:string; alt?:string; priority?:boolean; sizes?:string}) { void props; return null; }
