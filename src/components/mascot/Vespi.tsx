export const VESPI_NAME = "Веспи";
export type VespiVariant = "route" | "inspector" | "celebrate" | "copilot";
export type VespiPresentation = "portrait" | "figure";
/** Compatibility for old loading states. The gallery has no character artwork. */
export function Vespi(props: {variant?: "ride"|"avatar"|VespiVariant; presentation?:VespiPresentation; className?:string; alt?:string; priority?:boolean; sizes?:string}) { void props; return null; }
