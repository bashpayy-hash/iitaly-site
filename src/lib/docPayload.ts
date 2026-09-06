// Портировано из старого сайта (index.html, IIFE «ПРОВЕРКА ДОКУМЕНТОВ» и
// window.prepareDocPayload). Фото сжимается прямо в браузере до 1600px по
// длинной стороне: документ остаётся читаемым, а запрос не упирается в
// лимит сервера. PDF идёт как есть, из .docx текст достаётся без сторонних
// библиотек (это zip, внутри document.xml — читаем как бинарную строку).

const MAX_SIDE = 1600;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BASE64 = 7_000_000;

export type DocPayload =
  | { kind: "image"; base64: string; mediaType: "image/jpeg"; preview: string; fileName: string }
  | { kind: "pdf"; base64: string; fileName: string }
  | { kind: "text"; text: string; fileName: string };

export type DocPayloadResult = { payload: DocPayload } | { error: string };

function compressImage(file: File): Promise<{ base64: string; mediaType: "image/jpeg"; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("decode"));
      image.onload = () => {
        let w = image.width;
        let h = image.height;
        if (Math.max(w, h) > MAX_SIDE) {
          const k = MAX_SIDE / Math.max(w, h);
          w = Math.round(w * k);
          h = Math.round(h * k);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(image, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg", preview: dataUrl });
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("read"));
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.readAsDataURL(file);
  });
}

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("read"));
    r.onload = () => resolve(String(r.result));
    r.readAsText(file);
  });
}

async function readDocx(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let raw = "";
  for (let i = 0; i < bytes.length; i++) raw += String.fromCharCode(bytes[i]);
  const chunks = raw.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
  if (!chunks || chunks.length < 3) return "";
  const txt = chunks.map((c) => c.replace(/<[^>]+>/g, "")).join(" ");
  try {
    return decodeURIComponent(escape(txt));
  } catch {
    return txt;
  }
}

export async function preparePayload(file: File | null): Promise<DocPayloadResult> {
  if (!file) return { error: "Файл не выбран" };
  const name = (file.name || "").toLowerCase();
  const isPdf = file.type === "application/pdf" || name.endsWith(".pdf");
  const isImage = /^image\//.test(file.type);
  const isDocx = name.endsWith(".docx");
  const isDoc = name.endsWith(".doc");
  const isText = file.type === "text/plain" || name.endsWith(".txt") || name.endsWith(".rtf");

  if (file.size > MAX_FILE_BYTES && !isImage) {
    return { error: "Файл больше 5 МБ. Раздели документ или пришли только нужные страницы." };
  }

  try {
    if (isImage) {
      const p = await compressImage(file);
      return { payload: { kind: "image", ...p, fileName: file.name } };
    }
    if (isPdf) {
      const base64 = await readBase64(file);
      if (base64.length > MAX_PDF_BASE64) {
        return { error: "PDF слишком большой. Пришли только нужные страницы." };
      }
      return { payload: { kind: "pdf", base64, fileName: file.name } };
    }
    if (isDocx) {
      const text = await readDocx(file);
      if (text.trim().length < 20) {
        return { error: "Не удалось прочитать текст из документа. Сохрани его в PDF или сфотографируй." };
      }
      return { payload: { kind: "text", text, fileName: file.name } };
    }
    if (isText) {
      const text = await readText(file);
      if (text.trim().length < 20) return { error: "Файл пустой или слишком короткий." };
      return { payload: { kind: "text", text, fileName: file.name } };
    }
    if (isDoc) {
      return { error: "Старый формат .doc не читается. Пересохрани в .docx или PDF — в Word это «Сохранить как»." };
    }
    return { error: "Поддерживаем фото, PDF, Word и текстовые файлы." };
  } catch {
    return { error: "Не удалось прочитать файл. Попробуй другой формат." };
  }
}
