import { ADMISSION_SOURCES } from "./admissions";
export const OFFICIAL_SOURCES = {
  universitalyInternational: ADMISSION_SOURCES.international,
  padovaDsu: ADMISSION_SOURCES.padovaDsu,
  murAdmission: {
    label: "MUR · подача в государственные вузы Италии",
    href: "https://www.mur.gov.it/it/aree-tematiche/universita/sportello-digitale-unico/presentazione-di-una-domanda-iniziale-di",
  },
  cimea: ADMISSION_SOURCES.cimea,
  lazioDsu: {
    label: "DiSCo Lazio · bando diritto allo studio 2026/27",
    href: "https://laziodisco.it/wp-content/uploads/2026/06/BANDO-DIRITTO-ALLO-STUDIO-26-27.pdf",
  },
} as const;

export const DATA_SNAPSHOT = "19.09.2026";
