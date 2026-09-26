import { TRAINER_SECTIONS, type TrainerField, type PermessoScenario } from "./permessoData";

/** PDF points, top-left origin, measured from the official source. The backdrop
 * is a lossless 3x render, not a reconstruction. Unequal row counts are deliberate. */
export const OFFICIAL_PDF = "https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf";
export const SOURCE_SHA256 = "adb5ac7d05f49513856214e1c3d7ee904c1a65bf69643eb0ffd3cd5a3a511f7e";
export const PAPER = { width: 595, height: 842 } as const;
const CDN = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/";
export const ORIGINAL_PAGES = [
  { page: 1, title: "Заявление", url: CDN + "0a9ea39b-6d11-49a1-9f44-1d8ac459a4d8.webp", sha256: "f609784102d429bb79c2e747f56119dc6e69c2f506eca27394d57148640d86bd", bytes: 90386 },
  { page: 2, title: "Личные данные и виза", url: CDN + "6197ee86-f592-42aa-b2f4-880ba25fa2d6.webp", sha256: "a82548859c5f466b448165012d57b15277b8d316f9ce0890763b04068213355d", bytes: 79908 },
  { page: 3, title: "Адрес в Италии", url: CDN + "651d4291-4411-47e0-a06c-c5660305144b.webp", sha256: "e1c7c928c00d0b80bdb4ef073f790927f6c077ae3309232ea978c1fbab5f608c", bytes: 82922 },
] as const;
export type EditorKind = "text" | "date" | "split" | "check" | "radio" | "line" | "signature";
export type CellRun = { x: number; y: number; count: number; cell: number; height: number; pitch: number; label?: string };
export type EditorField = { id: string; page: number; kind: EditorKind; runs: CellRun[]; meta: TrainerField };
const metadata = new Map(TRAINER_SECTIONS.flatMap(s => s.fields).map(f => [f.number, f]));
function run(x: number, y: number, count: number, label?: string, cell = 13.174, height = 18.844, pitch = 17.004): CellRun {
  return { x, y, count, cell, height, pitch, label };
}
function field(id: string, page: number, runs: CellRun[], kind?: EditorKind): EditorField {
  const meta = metadata.get(id);
  if (!meta) throw new Error("Missing source field: " + id);
  return { id, page, runs, kind: kind || (meta.kind === "x" ? "check" : meta.kind === "date" ? "date" : "text"), meta };
}
const header = (id: string, ru: string, it: string, runs: CellRun[], kind: EditorKind): EditorField => ({
  id, page: 1, runs, kind,
  meta: { number: id, ru, it, section: "request", mode: { rilascio: "write", rinnovo: "write" },
    source: "Сверь адресата обращения с инструкцией своего kit.",
    format: kind === "line" ? "Название Questura на строке Al Signor Questore di." : "Сигла провинции в двух клетках.",
    mistake: "Не переноси автоматически адрес университета." },
});
export const EDITOR_FIELDS: EditorField[] = [
  header("questore", "Квестору какого города", "Al Signor Questore di", [run(181,49,1,undefined,252,14)], "line"),
  header("questoreProvince", "Провинция Questura", "Sigla Provincia", [run(177.12,67.84,2,undefined,14.16,19.92,17.28)], "text"),
  field("3",1,[run(45.23,220.14,30,"Строка 1"),run(45.15,244.05,30,"Строка 2")]),
  field("4",1,[run(45.29,280.29,30,"Строка 1"),run(45.21,304.21,30,"Строка 2")]),
  field("5",1,[run(164.35,327.96,2)]),
  field("6",1,[run(45.23,365.48,30)]),
  field("8",1,[run(215.44,415.39,1)]),
  field("9",1,[run(215.35,439.30,1)]),
  field("10",1,[run(215.31,463.14,1)]),
  field("11",1,[run(215.23,487.05,1)]),
  field("12",1,[run(215.35,510.93,1)]),
  field("14",1,[run(538.38,415.25,1)]),
  field("15",1,[run(538.30,439.17,1)]),
  field("16",1,[run(521.29,487.02,2)]),
  field("17",1,[run(538.21,510.94,1)]),
  field("18",1,[run(317.36,548.23,14)]),
  field("19",1,[run(402.39,572.60,2)]),
  field("20",1,[run(198.39,596.48,2,"День"),run(249.39,596.40,2,"Месяц"),run(300.36,596.48,4,"Год")]),
  field("22",1,[run(249.31,661.31,2)]),
  field("23",1,[run(385.39,661.46,1)]),
  field("24",1,[run(538.39,661.40,1)]),
  field("25",1,[run(232.31,685.31,2)]),
  field("26",1,[run(521.39,685.23,2)]),
  field("28",1,[run(79.27,760.04,2,"День"),run(130.27,759.96,2,"Месяц"),run(181.23,760.04,4,"Год")]),
  field("29",1,[run(277.5,759.0,1,undefined,274.5,51)],"signature"),
  field("31",2,[run(216.90,172.53,16)]),
  field("32",2,[run(131.76,196.41,1)]),
  field("33",2,[run(250.94,196.41,1)]),
  field("34",2,[run(386.91,196.39,2,"День"),run(438.03,196.52,2,"Месяц"),run(488.90,196.52,4,"Год")]),
  field("35",2,[run(165.88,232.66,3)]),
  field("36",2,[run(370.02,232.74,3)]),
  field("37",2,[run(505.87,232.64,1,"SI"),run(539.95,232.64,1,"NO")],"radio"),
  field("38",2,[run(131.95,256.49,25,"Строка 1"),run(46.83,280.41,30,"Строка 2")]),
  field("40",2,[run(131.76,358.80,1)]),
  field("41",2,[run(301.92,358.72,1)]),
  field("42",2,[run(522.93,358.79,2)]),
  field("43",2,[run(97.83,382.80,27)]),
  field("44",2,[run(97.92,406.72,14)]),
  field("45",2,[run(131.78,430.52,2,"День"),run(182.91,430.64,2,"Месяц"),run(233.77,430.64,4,"Год")]),
  field("46",2,[run(131.78,467.02,2)]),
  field("48",2,[run(182.91,549.64,2,"День"),run(234.03,549.77,2,"Месяц"),run(284.90,549.77,4,"Год")]),
  field("49",2,[run(114.76,585.66,26)]),
  field("50",2,[run(131.69,609.57,8)]),
  field("51",2,[run(386.90,609.68,2)]),
  field("52",2,[run(148.78,633.57,1)]),
  field("53",2,[run(386.82,633.59,1)]),
  field("54",2,[run(46.84,681.55,30,"Строка 1"),run(46.76,705.47,30,"Строка 2")]),
  field("55",2,[run(148.80,729.47,3)]),
  field("56",2,[run(131.78,753.18,2,"День"),run(182.91,753.31,2,"Месяц"),run(233.77,753.31,4,"Год")]),
  field("57",2,[run(386.91,753.08,2,"День"),run(438.03,753.20,2,"Месяц"),run(488.90,753.20,4,"Год")]),
  field("59",3,[run(234.09,154.45,1)]),
  field("60",3,[run(421.21,154.32,1)]),
  field("61",3,[run(234.01,178.36,1)]),
  field("63",3,[run(421.13,202.30,1)]),
  field("64",3,[run(540.01,202.24,1)]),
  field("66",3,[run(114.87,262.32,2)]),
  field("67",3,[run(46.97,298.32,30)]),
  field("68",3,[run(47.00,334.66,30,"Строка 1"),run(46.91,358.57,30,"Строка 2")]),
  field("69",3,[run(132.04,382.41,5,"Номер дома"),run(234.08,382.41,4,"Литера")],"split"),
  field("70",3,[run(98.04,418.24,5)]),
  field("71",3,[run(285.04,418.24,5)]),
  field("72",3,[run(472.04,418.24,5)]),
  field("73",3,[run(199.91,442.38,21,"Строка 1"),run(46.84,466.30,30,"Строка 2")]),
  field("74",3,[run(268.11,490.14,4,"Префикс"),run(353.23,490.14,12,"Номер")],"split"),
  field("75",3,[run(268.02,514.05,4,"Префикс"),run(353.15,514.05,12,"Номер")],"split"),
  field("77",3,[run(47.13,586.24,30,"Строка 1"),run(47.05,610.16,30,"Строка 2")]),
  field("78",3,[run(115.03,634.11,2)]),
  field("79",3,[run(47.00,669.99,30)]),
  field("80",3,[run(46.97,706.32,30,"Строка 1"),run(46.88,730.24,30,"Строка 2")]),
  field("81",3,[run(132.04,754.16,5,"Номер дома"),run(234.08,754.16,4,"Литера")],"split"),
  field("82",3,[run(97.90,789.99,5)]),
  field("83",3,[run(284.90,789.99,5)]),
  field("84",3,[run(471.90,789.99,5)]),
];
export const fieldWidth = (r: CellRun) => (r.count-1)*r.pitch+r.cell;
export const capacity = (f: EditorField) => f.kind==="line" ? 70 : f.runs.reduce((n,r)=>n+r.count,0);
export function editorMode(f: EditorField,scenario: PermessoScenario) {
  if (["31","73","74","75","24"].includes(f.id)) return "ifExists" as const;
  return f.meta.mode[scenario];
}
export function getPart(f: EditorField,value: string,part: number): string {
  if(f.kind==="split") return value.split("/")[part] || "";
  if(f.kind==="line") return value;
  const offset=f.runs.slice(0,part).reduce((n,r)=>n+r.count,0);
  return value.slice(offset,offset+f.runs[part].count);
}
export function setPart(f: EditorField,value: string,part: number,input: string): string {
  if(f.kind==="split") { const pieces=f.runs.map((_,i)=>getPart(f,value,i));pieces[part]=input;return pieces.join("/"); }
  if(f.kind==="line") return input;
  const offset=f.runs.slice(0,part).reduce((n,r)=>n+r.count,0);
  const suffix=value.slice(offset+f.runs[part].count);
  // Never trim user-entered spaces while typing a multiword name. Only insert
  // positional padding when a subsequent printed row/group already has data.
  return value.padEnd(offset," ").slice(0,offset)+input+(suffix.length ? " ".repeat(Math.max(0,f.runs[part].count-input.length))+suffix : "");
}
export function normalize(f: EditorField,value: string): string {
  if(f.kind==="date") return value.replace(/[\s./-]/g,"");
  if(f.id==="73") return value.replace(/[\r\n]/g,"");
  return value.replace(/[\r\n\t]/g," ").toUpperCase();
}
export function valueProblem(f: EditorField,value: string): string {
  if(!value.trim() || value==="/") return "";
  if(f.kind==="split") {
    if(value.split("/").some((v,i)=>!f.runs[i] || v.length>f.runs[i].count)) return "Текст не помещается в соответствующую часть поля. Не сокращай данные без сверки с документом.";
  } else if(value.length>capacity(f)) return "Текст не помещается в клетки. Ничего не обрезано: сверь написание с документом.";
  if(f.kind==="date") {
    if(!/^\d{8}$/.test(value)) return "Нужна дата: две цифры дня, две месяца и четыре года.";
    const d=Number(value.slice(0,2)),m=Number(value.slice(2,4)),y=Number(value.slice(4));
    const actual=new Date(Date.UTC(y,m-1,d));
    if(y<1900 || actual.getUTCFullYear()!==y || actual.getUTCMonth()!==m-1 || actual.getUTCDate()!==d) return "Такой даты нет. Проверь день, месяц и год.";
  }
  if(f.id==="31" && !/^[A-Z0-9]{16}$/.test(value)) return "Проверь 16 букв и цифр codice fiscale. Проверка формата не подтверждает действительность кода.";
  if(["72","84"].includes(f.id) && !/^\d{5}$/.test(value)) return "В CAP должно быть пять цифр.";
  if(f.kind!=="line" && f.kind!=="split" && /[А-Яа-яЁё]/.test(value)) return "На бланке нужна латиница. Перепиши из документа, не используй автоматическую транслитерацию.";
  return "";
}
