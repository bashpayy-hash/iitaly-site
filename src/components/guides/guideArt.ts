/* Своя вещь у каждой темы справочника: один предмет на прозрачном фоне, как
   товар на плитке. С 4 ноября это тот же набор, что в кабинете и на главной
   (owner: «добавь элементы иллюстрированности, но всё ещё с упором на
   реализм, чтобы сочеталось с остальным сайтом») — студийный реализм с
   иллюстративными акцентами, design/illustrations/objects-2026-11-04.json.
   С 7 ноября (owner: «чуть более концептуальными, чем сейчас… сохраняй
   нотки реализма») — полуконцептуальный набор: настоящие материалы,
   упрощённые формы и смысл в композиции (весы для ISEE, реплики над книгой
   для перевода), design/illustrations/objects-2026-11-07.json.
   С 9 ноября (owner: «иконки немного не по теме… DSU — что-то с деньгами,
   Codice fiscale — больше бумажку, не везде конвертики, более реальное»):
   монеты с пачкой купюр для DSU/ISEEU, бумажное свидетельство для Codice
   fiscale, домик на стопке справок для «Справок семьи», ручка с подписанным
   листом для «Если ещё нет 18», книжка с жетонами для воинского учёта —
   design/illustrations/objects-2026-11-09.json.
   С 13 ноября (owner: «чуточку реалистичнее было бы хорошо», затем «по
   иконкам не вижу разницы») — те же предметы и палитра, но как студийные
   фотографии настоящих вещей: реальные пропорции, кожа, бумага с рваным
   краем, мятые купюры — design/illustrations/objects-2026-11-13.json.
   С 19 ноября в гайдах и визе вместо предметов — картуши с пола Галереи
   Виктора Эммануила, выбранный владельцем вариант 7. Owner, на скриншоте
   визы с бордовой книжкой: «Надо было заменить вот это блокнот, он как раз
   так и проблематичен»; затем о мелких картушах в ячейках: «Убери эти
   мелкие гербы, они тут ни к чему, везде применяй этот принцип» — картуш
   только крупный: шапка темы, плитка каталога, пункт визы. Метки на пути
   (56px) остаются предметами общего набора. Плоская классическая эмблема
   темы в барочном картуше из мраморной смальты,
   design/illustrations/cartouche-2026-11-19.json.
   Главная, кабинет и план оставляют общий набор предметов (objectFrame).
   Картинки декоративные (alt=""): смысл несут заголовок и тизер темы. */
const ART: Record<string, string> = {
  education: "diploma",
  tests: "tests",
  apostille: "stamp-pad",
  translation: "translation",
  cimea: "folder",
  con: "family-docs",
  iseeu: "coins",
  visa: "passport",
  minors: "minors",
  military: "military",
  permesso: "keys",
  codice: "tax-card",
  "health-travel": "insurance",
};

/** 480px-кадр предмета из общего набора и его уменьшенная копия для srcSet. */
export function objectFrame(name: string, height: number) {
  return {
    src: `/illustrations/objects/${name}-480.webp`,
    srcSet: `/illustrations/objects/${name}-240.webp 240w, /illustrations/objects/${name}-480.webp 480w`,
    width: 480,
    height,
  };
}

/** Квадратный 480px-картуш темы гайда и его уменьшенная копия для srcSet. */
export function cartoucheFrame(name: string) {
  return {
    src: `/illustrations/cartouche/${name}-480.webp`,
    srcSet: `/illustrations/cartouche/${name}-240.webp 240w, /illustrations/cartouche/${name}-480.webp 480w`,
    width: 480,
    height: 480,
  };
}

export function guideArt(id: string) {
  return cartoucheFrame(ART[id] || ART.cimea);
}
