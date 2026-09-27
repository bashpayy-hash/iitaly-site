import { TRAINER_SECTIONS, type TrainerField, type PermessoScenario } from "./permessoData";

/** The existing lossless original remains the visual authority. Coordinates are
 * PDF points; normalizedRuns is the ONLY conversion used by interaction layers. */
export const OFFICIAL_PDF = "https://www.portaleimmigrazione.it/media/documentazione/Modulo_1.pdf";
export const SOURCE_SHA256 = "adb5ac7d05f49513856214e1c3d7ee904c1a65bf69643eb0ffd3cd5a3a511f7e";
export const PAPER = { width: 595, height: 842 } as const;
const CDN = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/";
export const ORIGINAL_PAGES = [
  { page: 1, title: "Заявление", url: CDN + "0a9ea39b-6d11-49a1-9f44-1d8ac459a4d8.webp", sha256: "f609784102d429bb79c2e747f56119dc6e69c2f506eca27394d57148640d86bd", bytes: 90386 },
  { page: 2, title: "Личные данные и виза", url: CDN + "6197ee86-f592-42aa-b2f4-880ba25fa2d6.webp", sha256: "a82548859c5f466b448165012d57b15277b8d316f9ce0890763b04068213355d", bytes: 79908 },
  { page: 3, title: "Адрес в Италии", url: CDN + "651d4291-4411-47e0-a06c-c5660305144b.webp", sha256: "e1c7c928c00d0b80bdb4ef073f790927f6c077ae3309232ea978c1fbab5f608c", bytes: 82922 },
  { page: 4, title: "Carta · пропуски", url: CDN + "f70f382a-e77a-4261-b0b4-c48ebc9a7498.webp", sha256: "0c8cf0eee1ab556a9989f76b6879e61f88b8bbe42e90b10962ee5519c3e31c79", bytes: 65758 },
  { page: 5, title: "Семья · пропуски", url: CDN + "6ef1ed32-a4a6-46c6-b9b8-6ede05a3dccf.webp", sha256: "aa9cf13a4ebec64c01c796ff02158c210147d69a2e34d1671f50ec85891f4abb", bytes: 67152 },
  { page: 6, title: "Супруг и дети", url: CDN + "d03ebc7a-608c-4b75-bc81-a6b7a00c54bf.webp", sha256: "03de277fcf481b40ce1554cdb7ed58e085bafd41c03eb8b428731fd51af2eb8b", bytes: 66704 },
  { page: 7, title: "Дети · продолжение", url: CDN + "54eaf595-6863-424f-8556-f2e4c52d4048.webp", sha256: "db6bbff34424554ff31330086fd6a443407bb26d12d190d0b58ad1bce4ea3ead", bytes: 64236 },
  { page: 8, title: "Дети · продолжение", url: CDN + "bef86551-3367-4929-a598-0b108fdca545.webp", sha256: "7d38a02204d682c7fdb8197c0f58543b9a156906154224e973e2e3b09b735484", bytes: 64668 },
] as const;
export type EditorKind = "text" | "date" | "split" | "check" | "radio" | "line" | "signature" | "block";
export type CellRun = { x: number; y: number; count: number; cell: number; height: number; pitch: number; label?: string };
/** Concise copy extends the same field record, never a second hover dictionary.
 * Literal code choices below are transcribed ONLY from this field's existing guide. */
export type QuickRule = { answer?: string; hint?: string; cells?: string; source?: string; dontWrite?: string; choices?: readonly { value: string; label: string }[]; verify?: boolean; sezione?: number };
export type EditorField = { id: string; page: number; kind: EditorKind; runs: CellRun[]; meta: TrainerField; quick?: QuickRule; blockId?: string; readOnly?: boolean };
const metadata = new Map(TRAINER_SECTIONS.flatMap(s => s.fields).map(f => [f.number, f]));
function run(x: number, y: number, count: number, label?: string, cell = 13.174, height = 18.844, pitch = 17.004): CellRun { return { x, y, count, cell, height, pitch, label }; }
function field(id: string, page: number, runs: CellRun[], kind?: EditorKind, quick?: QuickRule): EditorField {
  const meta = metadata.get(id); if (!meta) throw new Error("Missing source field: " + id);
  return { id, page, runs, kind: kind || (meta.kind === "x" ? "check" : meta.kind === "date" ? "date" : "text"), meta, quick, blockId: meta.section };
}
const header = (id: string, ru: string, it: string, runs: CellRun[], kind: EditorKind): EditorField => ({ id, page: 1, runs, kind, quick: { source: "Инструкция kit", sezione: 1 },
  meta: { number: id, ru, it, section: "request", mode: { rilascio: "write", rinnovo: "write" }, source: "Сверь адресата обращения с инструкцией своего kit.", format: kind === "line" ? "Название Questura на строке Al Signor Questore di." : "Сигла провинции в двух клетках.", mistake: "Не переноси автоматически адрес университета." } });
const passportName: QuickRule = { answer: "Как в паспорте", hint: "Латиницей, точно как напечатано в паспорте.", cells: "ЗАГЛАВНЫЕ; символ в клетку. Между словами — пустая. Дальше — вторая строка.", source: "Паспорт", dontWrite: "кириллицу и сокращения" };
export const EDITOR_FIELDS: EditorField[] = [
  header("questore", "Квестору какого города", "Al Signor Questore di", [run(181,49,1,undefined,252,14)], "line"),
  header("questoreProvince", "Провинция Questura", "Sigla Provincia", [run(177.12,67.84,2,undefined,14.16,19.92,17.28)], "text"),
  field("3",1,[run(45.23,220.14,30,"Строка 1"),run(45.15,244.05,30,"Строка 2")],"text",passportName),
  field("4",1,[run(45.29,280.29,30,"Строка 1"),run(45.21,304.21,30,"Строка 2")],"text",passportName),
  field("5",1,[run(164.35,327.96,2)]), field("6",1,[run(45.23,365.48,30)]),
  field("8",1,[run(215.44,415.39,1)]), field("9",1,[run(215.35,439.30,1)]),
  field("10",1,[run(215.31,463.14,1)]), field("11",1,[run(215.23,487.05,1)]), field("12",1,[run(215.35,510.93,1)]),
  field("14",1,[run(538.38,415.25,1)]), field("15",1,[run(538.30,439.17,1)]),
  field("16",1,[run(521.29,487.02,2)],undefined,{ verify: true, answer: "Уточни код", hint: "Код типа разрешения — по твоему kit, не автоматически для всех студентов.", source: "Таблица motivi / сноска kit" }),
  field("17",1,[run(538.21,510.94,1)]),
  field("18",1,[run(317.36,548.23,14)],undefined,{ answer: "С текущего ВНЖ", source: "Карточка permesso", dontWrite: "номер паспорта или codice fiscale" }),
  field("19",1,[run(402.39,572.60,2)],undefined,{ verify: true, answer: "Сверь текущий код", source: "Карточка / прошлый kit" }),
  field("20",1,[run(198.39,596.48,2,"День"),run(249.39,596.40,2,"Месяц"),run(300.36,596.48,4,"Год")]),
  field("22",1,[run(249.31,661.31,2)],undefined,{ answer: "По составу kit", hint: "Считай заполненные модули, а не страницы и копии.", dontWrite: "число страниц" }),
  field("23",1,[run(385.39,661.46,1)]), field("24",1,[run(538.39,661.40,1)]),
  field("25",1,[run(232.31,685.31,2)],undefined,{ verify: true, answer: "Уточни число листов", hint: "Расчёт помощника — ориентир, не готовый ответ для бумаги.", source: "Инструкция kit / Sportello Amico" }),
  field("26",1,[run(521.39,685.23,2)]),
  field("28",1,[run(79.27,760.04,2,"День"),run(130.27,759.96,2,"Месяц"),run(181.23,760.04,4,"Год")],undefined,{ answer: "Уточни дату подачи", source: "Инструкция kit / Sportello Amico" }),
  field("29",1,[run(277.5,759.0,1,undefined,274.5,51)],"signature",{ answer: "Подпись на бумаге", hint: "Уточни момент подписания. Имя в редакторе не заменяет подпись.", source: "Инструкция kit / Sportello Amico" }),
  field("31",2,[run(216.90,172.53,16)]),
  field("32",2,[run(131.76,196.41,1)],undefined,{ answer: "A / B", hint: "A — не в браке. B — только если брак уже есть.", cells: "Одна буква, без пробелов.", source: "Сноска kit", dontWrite: "семейное положение словами", choices: [{value:"A",label:"Не в браке"},{value:"B",label:"В браке"}] }),
  field("33",2,[run(250.94,196.41,1)],undefined,{ choices: [{value:"F",label:"F"},{value:"M",label:"M"}], source: "Паспорт", cells: "Одна буква." }),
  field("34",2,[run(386.91,196.39,2,"День"),run(438.03,196.52,2,"Месяц"),run(488.90,196.52,4,"Год")]),
  field("35",2,[run(165.88,232.66,3)],undefined,{ verify: true, answer: "Сверь код страны", hint: "Страна рождения и гражданство могут отличаться.", source: "Tabella 3 твоего kit", dontWrite: "код гражданства вместо страны рождения" }),
  field("36",2,[run(370.02,232.74,3)],undefined,{ verify: true, answer: "Сверь код страны", hint: "Код гражданства не подставляется по стране рождения.", source: "Tabella 3 твоего kit" }),
  field("37",2,[run(505.87,232.64,1,"SI"),run(539.95,232.64,1,"NO")],"radio"),
  field("38",2,[run(131.95,256.49,25,"Строка 1"),run(46.83,280.41,30,"Строка 2")]),
  field("40",2,[run(131.76,358.80,1)]), field("41",2,[run(301.92,358.72,1)]), field("42",2,[run(522.93,358.79,2)]),
  field("43",2,[run(97.83,382.80,27)]), field("44",2,[run(97.92,406.72,14)],undefined,{ answer: "Номер из паспорта", source: "Паспорт", dontWrite: "номер визы" }),
  field("45",2,[run(131.78,430.52,2,"День"),run(182.91,430.64,2,"Месяц"),run(233.77,430.64,4,"Год")]),
  field("46",2,[run(131.78,467.02,2)],undefined,{ verify: true, answer: "Сверь код органа", source: "Сноска kit / паспорт" }),
  field("48",2,[run(182.91,549.64,2,"День"),run(234.03,549.77,2,"Месяц"),run(284.90,549.77,4,"Год")]),
  field("49",2,[run(114.76,585.66,26)]), field("50",2,[run(131.69,609.57,8)]), field("51",2,[run(386.90,609.68,2)]),
  field("52",2,[run(148.78,633.57,1)]), field("53",2,[run(386.82,633.59,1)]),
  field("54",2,[run(46.84,681.55,30,"Строка 1"),run(46.76,705.47,30,"Строка 2")]), field("55",2,[run(148.80,729.47,3)]),
  field("56",2,[run(131.78,753.18,2,"День"),run(182.91,753.31,2,"Месяц"),run(233.77,753.31,4,"Год")]),
  field("57",2,[run(386.91,753.08,2,"День"),run(438.03,753.20,2,"Месяц"),run(488.90,753.20,4,"Год")]),
  field("59",3,[run(234.09,154.45,1)]), field("60",3,[run(421.21,154.32,1)]), field("61",3,[run(234.01,178.36,1)]),
  field("63",3,[run(421.13,202.30,1)]), field("64",3,[run(540.01,202.24,1)]),
  field("66",3,[run(114.87,262.32,2)]), field("67",3,[run(46.97,298.32,30)]),
  field("68",3,[run(47.00,334.66,30,"Строка 1"),run(46.91,358.57,30,"Строка 2")]),
  field("69",3,[run(132.04,382.41,5,"Номер дома"),run(234.08,382.41,4,"Литера")],"split"),
  field("70",3,[run(98.04,418.24,5)]), field("71",3,[run(285.04,418.24,5)]), field("72",3,[run(472.04,418.24,5)]),
  field("73",3,[run(199.91,442.38,21,"Строка 1"),run(46.84,466.30,30,"Строка 2")]),
  field("74",3,[run(268.11,490.14,4,"Префикс"),run(353.23,490.14,12,"Номер")],"split"),
  field("75",3,[run(268.02,514.05,4,"Префикс"),run(353.15,514.05,12,"Номер")],"split"),
  field("77",3,[run(47.13,586.24,30,"Строка 1"),run(47.05,610.16,30,"Строка 2")]), field("78",3,[run(115.03,634.11,2)]),
  field("79",3,[run(47.00,669.99,30)]), field("80",3,[run(46.97,706.32,30,"Строка 1"),run(46.88,730.24,30,"Строка 2")]),
  field("81",3,[run(132.04,754.16,5,"Номер дома"),run(234.08,754.16,4,"Литера")],"split"),
  field("82",3,[run(97.90,789.99,5)]), field("83",3,[run(284.90,789.99,5)]), field("84",3,[run(471.90,789.99,5)]),
];
export const fieldWidth = (r: CellRun) => (r.count-1)*r.pitch+r.cell;
export const capacity = (f: EditorField) => f.kind==="line" ? 70 : f.runs.reduce((n,r)=>n+r.count,0);
export function editorMode(f: EditorField,scenario: PermessoScenario) {
  const base = ["31","73","74","75","24"].includes(f.id) ? "ifExists" as const : f.meta.mode[scenario];
  return base !== "empty" && f.quick?.verify ? "verify" as const : base;
}
export const normalizedRuns = (f: EditorField) => f.runs.map(r => ({x:r.x/PAPER.width,y:r.y/PAPER.height,width:fieldWidth(r)/PAPER.width,height:r.height/PAPER.height}));
export function fieldBounds(f: EditorField) { const runs=normalizedRuns(f),x=Math.min(...runs.map(r=>r.x)),y=Math.min(...runs.map(r=>r.y)); return {x,y,width:Math.max(...runs.map(r=>r.x+r.width))-x,height:Math.max(...runs.map(r=>r.y+r.height))-y}; }
export function sezione(f: EditorField) { return f.quick?.sezione || Number(TRAINER_SECTIONS.find(s=>s.id===f.meta.section)?.label.match(/\d+/)?.[0]) || 1; }
export function getPart(f: EditorField,value: string,part: number): string {
  if(f.kind==="split") return value.split("/")[part] || ""; if(f.kind==="line") return value;
  const offset=f.runs.slice(0,part).reduce((n,r)=>n+r.count,0); return value.slice(offset,offset+f.runs[part].count);
}
export function setPart(f: EditorField,value: string,part: number,input: string): string {
  if(f.kind==="split") { const pieces=f.runs.map((_,i)=>getPart(f,value,i));pieces[part]=input;return pieces.join("/"); }
  if(f.kind==="line") return input;
  const offset=f.runs.slice(0,part).reduce((n,r)=>n+r.count,0),suffix=value.slice(offset+f.runs[part].count);
  return value.padEnd(offset," ").slice(0,offset)+input+(suffix.length ? " ".repeat(Math.max(0,f.runs[part].count-input.length))+suffix : "");
}
export function normalize(f: EditorField,value: string): string { if(f.kind==="date")return value.replace(/[\s./-]/g,"");if(f.id==="73")return value.replace(/[\r\n]/g,"");return value.replace(/[\r\n\t]/g," ").toUpperCase(); }
export function valueProblem(f: EditorField,value: string): string {
  if(!value.trim() || value==="/") return "";
  if(f.kind==="split") { if(value.split("/").some((v,i)=>!f.runs[i] || v.length>f.runs[i].count)) return "Текст не помещается в соответствующую часть поля. Не сокращай данные без сверки с документом."; }
  else if(value.length>capacity(f)) return "Текст не помещается в клетки. Ничего не обрезано: сверь написание с документом.";
  if(f.quick?.choices && !f.quick.choices.some(c=>c.value===value)) return "Выбери значение из вариантов, указанных в этом поле гида.";
  if(f.kind==="date") { if(!/^\d{8}$/.test(value)) return "Нужна дата: две цифры дня, две месяца и четыре года.";const d=Number(value.slice(0,2)),m=Number(value.slice(2,4)),y=Number(value.slice(4)),actual=new Date(Date.UTC(y,m-1,d));if(y<1900 || actual.getUTCFullYear()!==y || actual.getUTCMonth()!==m-1 || actual.getUTCDate()!==d)return "Такой даты нет. Проверь день, месяц и год."; }
  if(f.id==="31" && !/^[A-Z0-9]{16}$/.test(value)) return "Проверь 16 букв и цифр codice fiscale. Проверка формата не подтверждает действительность кода.";
  if(["72","84"].includes(f.id) && !/^\d{5}$/.test(value)) return "В CAP должно быть пять цифр.";
  if(f.kind!=="line" && f.kind!=="split" && /[А-Яа-яЁё]/.test(value)) return "На бланке нужна латиница. Перепиши из документа, не используй автоматическую транслитерацию.";
  return "";
}

/** Section reading zones are projections of the existing section records. */
function sectionHeading(id:string,page:number,sectionId:string,x:number,y:number,w:number,h:number):EditorField {
  const s=TRAINER_SECTIONS.find(s=>s.id===sectionId)!;
  const mode=(scenario:PermessoScenario)=>s.fields.every(f=>f.mode[scenario]==="empty") ? "empty" as const : s.fields.some(f=>f.mode[scenario]==="write") ? "write" as const : "ifExists" as const;
  return {id,page,kind:"block",readOnly:true,blockId:sectionId,runs:[run(x,y,1,undefined,w,h)],quick:{answer:"Смотри поля блока",hint:s.note,source:"Инструкция kit"},meta:{number:id,it:s.title.toUpperCase(),ru:s.note||s.title,section:sectionId,mode:{rilascio:mode("rilascio"),rinnovo:mode("rinnovo")},source:s.note||"Пояснения — у каждого поля этого блока.",format:"Проверяй строки по отдельности.",mistake:""}};
}
export const SECTION_ZONES: EditorField[] = [
 sectionHeading("2",1,"request",47.52,186.13,506,13),sectionHeading("21",1,"application",44.52,641.38,506,13),
 sectionHeading("30",2,"identity",46.52,142.74,507,13),sectionHeading("39",2,"passport",46.19,330.29,507,13),sectionHeading("47",2,"visa",46.52,522.82,507,13),
 sectionHeading("58",3,"travel",46.27,133.99,507,13),sectionHeading("65",3,"address",46.52,240.82,507,13),sectionHeading("76",3,"correspondence",46.52,550.86,507,13),
];
/** Pages 4–8 are annotation-only in the existing student-without-family scope.
 * Family facts are not inferred from age or nationality. */
function skipped(id:string,page:number,sec:number,it:string,ru:string,runs:CellRun[],block=false):EditorField {
 const reason=sec===12?"Если детей до 14 лет, живущих в Италии, нет — этот блок оставь пустым.":sec===11?"Если этот студенческий kit не включает супруга — блок оставь пустым.":sec===10?"В сценарии без совместно проживающих иждивенцев этот блок пустой.":"Это блок Carta di soggiorno, не текущий студенческий сценарий.";
 return {id,page,runs,kind:block?"block":"text",readOnly:true,blockId:"sezione-"+sec,quick:{sezione:sec,answer:block?"Весь блок пустой":"Пусто",hint:reason,source:"Бланк · Sezione "+sec,dontWrite:"прочерки, нули, «нет», своё имя"},meta:{number:id,it,ru,section:"sezione-"+sec,mode:{rilascio:"empty",rinnovo:"empty"},source:reason,format:"Оставь пустым.",mistake:"Не вписывай свои данные в строки другого члена семьи."}};
}
function familyGroup(first:number,page:number,sec:number,y:number,x:number,x2:number,xSex:number,xDate:number,xCountry:number,xCit:number,xCity:number):EditorField[] {
 const f=(offset:number,it:string,ru:string,runs:CellRun[])=>skipped(String(first+offset),page,sec,it,ru,runs);
 return [f(0,"COGNOME","Фамилия в семейном блоке",[run(x,y,30),run(x2,y+23.915,30)]),f(1,"NOME","Имя в семейном блоке",[run(x,y+72,30),run(x2,y+95.915,30)]),f(2,"SESSO","Пол члена семьи",[run(xSex,y+119.795,1)]),f(3,"NATO/A IL","Дата рождения члена семьи",[run(xDate,y+119.795,2),run(xDate+51.02,y+119.795,2),run(xDate+102.05,y+119.795,4)]),f(4,"CODICE STATO NASCITA","Страна рождения члена семьи",[run(xCountry,y+156.105,3)]),f(5,"CODICE STATO CITTADINANZA","Гражданство члена семьи",[run(xCit,y+156.105,3)]),f(6,"CITTA’ DI NASCITA","Город рождения члена семьи",[run(xCity,y+179.915,24),run(x2+.06,y+203.835,30)])];
}
export const READ_ONLY_FIELDS:EditorField[] = [
 skipped("85",4,9,"CARTA DI SOGGIORNO","Carta di soggiorno",[run(47.76,141.50,1,undefined,505,13)],true),
 skipped("87",4,9,"RILASCIATA IN DATA","Дата выдачи",[run(148.91,178.52,2),run(199.94,178.52,2),run(250.96,178.52,4)]),
 skipped("88",4,9,"DAL COMUNE","Выдано Comune",[run(148.91,211.40,1)]),skipped("89",4,9,"PROVINCIA","Провинция",[run(284.85,211.40,2)]),
 skipped("90",4,9,"COMUNE","Comune",[run(46.87,250.36,30)]),skipped("91",4,9,"O DA ASL","Выдано ASL",[run(114.90,274.48,1)]),skipped("92",4,9,"PROVINCIA","Провинция",[run(284.97,274.48,2)]),skipped("93",4,9,"ASL","ASL",[run(46.90,313.31,30)]),
 skipped("96",4,9,"PROVINCIA","Провинция",[run(131.93,396.36,2)]),skipped("97",4,9,"COMUNE","Comune",[run(46.90,437.19,30)]),skipped("98",4,9,"INDIRIZZO","Адрес",[run(114.99,461.27,26),run(46.87,485.19,30)]),
 skipped("99",4,9,"PROVINCIA","Провинция",[run(131.93,526.35,2)]),skipped("100",4,9,"COMUNE","Comune",[run(46.90,567.19,30)]),skipped("101",4,9,"INDIRIZZO","Адрес",[run(114.99,591.27,26),run(46.87,615.19,30)]),
 skipped("102",4,9,"PROVINCIA","Провинция",[run(131.81,663.48,2)]),skipped("103",4,9,"COMUNE","Comune",[run(46.77,704.31,30)]),skipped("104",4,9,"INDIRIZZO","Адрес",[run(114.86,728.40,26),run(46.75,752.31,30)]),
 skipped("105",5,9,"PROVINCIA","Провинция",[run(131.93,145.31,2)]),skipped("106",5,9,"COMUNE","Comune",[run(46.90,190.31,30)]),skipped("107",5,9,"INDIRIZZO","Адрес",[run(114.99,214.40,26),run(46.87,238.31,30)]),
 skipped("109",5,9,"PROVINCIA","Провинция",[run(131.89,298.44,2)]),skipped("110",5,9,"COMUNE","Comune",[run(46.77,346.19,30)]),skipped("111",5,9,"INDIRIZZO","Адрес",[run(114.86,370.27,26),run(46.75,394.19,30)]),
 skipped("114",5,9,"SI","Да",[run(233.86,466.36,1)]),skipped("115",5,9,"NO","Нет",[run(369.92,466.36,1)]),skipped("117",5,9,"SI","Да",[run(233.92,490.44,1)]),skipped("118",5,9,"NO","Нет",[run(369.98,490.44,1)]),
 skipped("119",5,10,"FAMILIARI A CARICO CONVIVENTI","Совместно проживающие иждивенцы",[run(46.29,536.70,1,undefined,507,13)],true),
 skipped("120",5,10,"NUMERO PERSONE CONVIVENTI","Число совместно проживающих",[run(216.90,563.31,2)]),
 skipped("122",5,10,"CONIUGE","Супруг",[run(114.86,611.19,1)]),skipped("123",5,10,"FIGLI","Дети",[run(233.89,611.19,1)]),skipped("124",5,10,"NUMERO","Количество",[run(370.08,611.19,2)]),skipped("125",5,10,"ALTRO","Другое",[run(114.92,635.27,1)]),skipped("126",5,10,"SPECIFICARE RAPPORTO DI PARENTELA","Родство",[run(370.08,635.27,11)]),
 skipped("128",6,11,"CONIUGE","Супруг",[run(45.76,139.63,1,undefined,507,13)],true),
 ...familyGroup(129,6,11,179.305,46.26,46.17,114.33,233.38,165.37,505.29,148.37),
 skipped("136",6,12,"FIGLI MINORI DI 14 ANNI A CARICO REGOLARMENTE SOGGIORNANTI IN ITALIA","Дети до 14 лет, живущие в Италии",[run(46.19,434.85,1,undefined,507,13)],true),
 ...familyGroup(137,6,12,474.555,46.26,46.17,114.33,233.38,165.37,505.29,148.37),
 skipped("144",7,12,"FIGLI MINORI DI 14 ANNI A CARICO REGOLARMENTE SOGGIORNANTI IN ITALIA (CONTINUA)","Дети до 14 лет · продолжение",[run(46.11,139.36,1,undefined,507,13)],true),
 ...familyGroup(145,7,12,179.705,46.36,46.28,114.43,233.49,165.48,505.39,148.47),
 ...familyGroup(152,7,12,474.955,46.36,46.28,114.43,233.49,165.48,505.39,148.47),
 skipped("159",8,12,"FIGLI MINORI DI 14 ANNI A CARICO REGOLARMENTE SOGGIORNANTI IN ITALIA (CONTINUA)","Дети до 14 лет · продолжение",[run(47.38,139.08,1,undefined,507,13)],true),
 ...familyGroup(160,8,12,179.621,47.25,47.17,115.32,234.38,166.36,506.28,149.36),
 ...familyGroup(167,8,12,474.871,47.25,47.17,115.32,234.38,166.36,506.28,149.36),
];
export const ALL_GUIDANCE_FIELDS=[...EDITOR_FIELDS,...SECTION_ZONES,...READ_ONLY_FIELDS].sort((a,b)=>a.page-b.page || (Number(a.id)||0)-(Number(b.id)||0));
