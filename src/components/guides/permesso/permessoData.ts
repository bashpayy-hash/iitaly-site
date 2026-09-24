export type PermessoScenario = "rilascio" | "rinnovo";
export type FieldMode = "write" | "empty" | "post" | "ifExists" | "recommended" | "verify";

export interface TrainerField {
  number: string;
  it: string;
  ru: string;
  section: string;
  cells?: number;
  rows?: 1 | 2;
  kind?: "text" | "date" | "x" | "code" | "number";
  mode: Record<PermessoScenario, FieldMode>;
  source: string;
  format: string;
  example?: Partial<Record<PermessoScenario, string>>;
  mistake: string;
}

export interface TrainerSection {
  id: string;
  label: string;
  title: string;
  note?: string;
  fields: TrainerField[];
}

const BOTH_WRITE = { rilascio: "write", rinnovo: "write" } as const;
const BOTH_EMPTY = { rilascio: "empty", rinnovo: "empty" } as const;
const BOTH_POST = { rilascio: "post", rinnovo: "post" } as const;
const BOTH_VERIFY = { rilascio: "verify", rinnovo: "verify" } as const;
const BOTH_IF_EXISTS = { rilascio: "ifExists", rinnovo: "ifExists" } as const;

export const TRAINER_SECTIONS: TrainerSection[] = [
  {
    id: "request",
    label: "Sezione 1",
    title: "Dati della richiesta",
    note: "Кто подаёт, где живёт и что именно просит.",
    fields: [
      { number: "3", it: "COGNOME", ru: "Фамилия", section: "request", cells: 22, rows: 2, kind: "text", mode: BOTH_WRITE, source: "Паспорт: латиница, ровно как напечатано.", format: "ЗАГЛАВНЫЕ, один символ в клетке. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", example: { rilascio: "KUZNETSOVA", rinnovo: "KUZNETSOVA" }, mistake: "Не транслитерируй фамилию заново по-русски." },
      { number: "4", it: "NOME", ru: "Имя", section: "request", cells: 22, rows: 2, kind: "text", mode: BOTH_WRITE, source: "Паспорт.", format: "ЗАГЛАВНЫЕ, включая второе имя, если оно есть в паспорте. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", example: { rilascio: "MARIA", rinnovo: "MARIA" }, mistake: "Не сокращай имя и не меняй порядок." },
      { number: "5", it: "PROVINCIA DI DOMICILIO", ru: "Сигла провинции", section: "request", cells: 2, kind: "code", mode: BOTH_WRITE, source: "Провинция фактического жилья в Италии.", format: "2 буквы, например MI / RM / FI.", example: { rilascio: "FI", rinnovo: "FI" }, mistake: "Не ставь провинцию университета, если живёшь в другой." },
      { number: "6", it: "COMUNE DI DOMICILIO", ru: "Comune проживания", section: "request", cells: 18, kind: "text", mode: BOTH_WRITE, source: "Адрес жилья в Италии.", format: "Итальянское название comune, ЗАГЛАВНЫМИ.", example: { rilascio: "FIRENZE", rinnovo: "FIRENZE" }, mistake: "Не пиши MILAN или «Милан»: на бланке нужен итальянский comune." },
      { number: "8", it: "RILASCIO", ru: "Первое ВНЖ", section: "request", cells: 1, kind: "x", mode: { rilascio: "write", rinnovo: "empty" }, source: "Сценарий подачи.", format: "X в квадрате.", example: { rilascio: "X" }, mistake: "Не ставь галочку ✓ и не закрашивай квадрат." },
      { number: "9", it: "RINNOVO", ru: "Продление", section: "request", cells: 1, kind: "x", mode: { rilascio: "empty", rinnovo: "write" }, source: "Сценарий подачи.", format: "X в квадрате.", example: { rinnovo: "X" }, mistake: "При первом permesso поле 9 пустое." },
      { number: "10", it: "AGGIORNAMENTO", ru: "Обновление", section: "request", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к двум сценариям этого тренажёра.", format: "Оставить пустым.", mistake: "Не выбирай другой тип запроса «на всякий случай»." },
      { number: "11", it: "DUPLICATO", ru: "Дубликат", section: "request", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к двум сценариям этого тренажёра.", format: "Оставить пустым.", mistake: "Не выбирай другой тип запроса «на всякий случай»." },
      { number: "12", it: "CONVERSIONE", ru: "Конвертация", section: "request", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к двум сценариям этого тренажёра.", format: "Оставить пустым.", mistake: "Не выбирай другой тип запроса «на всякий случай»." },
      { number: "14", it: "PERMESSO DI SOGGIORNO", ru: "Permesso", section: "request", cells: 1, kind: "x", mode: BOTH_WRITE, source: "Тип документа, который просишь.", format: "X.", example: { rilascio: "X", rinnovo: "X" }, mistake: "Не ставь X в поле 15 Carta di soggiorno." },
      { number: "15", it: "CARTA DI SOGGIORNO", ru: "Carta", section: "request", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не наш студенческий сценарий.", format: "Оставить пустым.", mistake: "Для обычного студенческого permesso X стоит только в 14." },
      { number: "16", it: "CODICE TIPOLOGIA", ru: "Код того, что просишь", section: "request", cells: 2, kind: "code", mode: BOTH_WRITE, source: "Таблица motivi Portale Immigrazione + указания твоего kit / international office.", format: "2 цифры. Выбери код в виджете ниже.", mistake: "Не ставь 24 или 31 автоматически всем студентам." },
      { number: "17", it: "AGGIORNAMENTO FOTO CARTA", ru: "Обновление фото carta", section: "request", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к нашим сценариям.", format: "Пусто.", mistake: "Не ставь X." },
      { number: "18", it: "NUMERO PERMESSO", ru: "Номер текущего permesso", section: "request", cells: 12, kind: "text", mode: { rilascio: "empty", rinnovo: "write" }, source: "Текущая карточка permesso.", format: "Копируй целиком, включая первую букву I.", example: { rinnovo: "I1234567890" }, mistake: "Не путай с номером паспорта или codice fiscale." },
      { number: "19", it: "CODICE TIPOLOGIA PERMESSO", ru: "Код на текущей карточке", section: "request", cells: 2, kind: "code", mode: { rilascio: "empty", rinnovo: "write" }, source: "Текущая карточка / прошлый kit.", format: "2 цифры. Это код того, что уже есть на руках.", mistake: "Поле 19 не обязано совпадать с 16 — сравни с карточкой." },
      { number: "20", it: "SCADENZA PERMESSO", ru: "Срок текущей карточки", section: "request", cells: 8, kind: "date", mode: { rilascio: "empty", rinnovo: "write" }, source: "Текущая карточка permesso.", format: "gg / mm / aaaa.", example: { rinnovo: "30092026" }, mistake: "Не пиши желаемую новую дату и не копируй срок паспорта." },
    ],
  },
  {
    id: "application",
    label: "Sezione 2",
    title: "Dati sull'istanza",
    note: "Сколько модулей и листов идёт в конверт; дата и подпись — только на почте.",
    fields: [
      { number: "22", it: "INDICARE QUALI MODULI SONO STATI COMPILATI", ru: "Какие модули заполнены", section: "application", cells: 2, kind: "number", mode: BOTH_WRITE, source: "Обычно только Modulo 1 для студента без дохода от работы.", format: "01; если реально нужен Modulo 2 — 02.", example: { rilascio: "01", rinnovo: "01" }, mistake: "Не считай сюда страницы и ксерокопии." },
      { number: "23", it: "MODULO 1", ru: "Modulo 1 приложен", section: "application", cells: 1, kind: "x", mode: BOTH_WRITE, source: "Бумажный kit.", format: "X.", example: { rilascio: "X", rinnovo: "X" }, mistake: "Не путай с количеством листов." },
      { number: "24", it: "MODULO 2", ru: "Modulo 2", section: "application", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Для студента без работы не нужен.", format: "Пусто, если Modulo 2 не кладёшь.", mistake: "Не ставь X просто потому, что бланк лежит в kit." },
      { number: "25", it: "INDICARE IL NUMERO TOTALE DI FOGLI", ru: "Общее число листов", section: "application", cells: 2, kind: "number", mode: BOTH_VERIFY, source: "Правило подсчёта нужно сверить по инструкции твоего kit / у Sportello Amico. Калькулятор ниже — только ориентир.", format: "Две цифры после проверки способа подсчёта.", mistake: "Не переносить число из калькулятора на бумагу без проверки." },
      { number: "26", it: "FIGLI A CARICO", ru: "Дети на иждивении", section: "application", cells: 2, kind: "number", mode: BOTH_EMPTY, source: "Сценарий: студент без детей.", format: "Пусто.", mistake: "Не пиши 0 или 00." },
      { number: "28", it: "DATA", ru: "Дата подачи", section: "application", cells: 8, kind: "date", mode: BOTH_VERIFY, source: "По реальным заполненным примерам практика различается. Уточни у Sportello Amico, когда ставить дату.", format: "gg / mm / aaaa после уточнения.", mistake: "Не выдаём правило «только на почте» как универсальное без подтверждения." },
      { number: "29", it: "FIRMA", ru: "Подпись", section: "application", cells: 10, kind: "text", mode: BOTH_VERIFY, source: "По примерам подпись уже стоит, поэтому момент подписания нужно уточнить у Sportello Amico.", format: "Подпись после уточнения порядка.", mistake: "Не предполагаем автоматически, подписывать дома или на почте." },
    ],
  },
  {
    id: "identity",
    label: "Sezione 3",
    title: "Dati anagrafici",
    fields: [
      { number: "31", it: "CODICE FISCALE (OVE IN POSSESSO)", ru: "Налоговый код", section: "identity", cells: 16, kind: "text", mode: { rilascio: "ifExists", rinnovo: "write" }, source: "Карточка / сертификат codice fiscale.", format: "Ровно 16 букв и цифр.", example: { rilascio: "ZZZAAA00A00Z000X", rinnovo: "ZZZAAA00A00Z000X" }, mistake: "При первом permesso не выдумывай код, если его ещё нет; при продлении перепиши существующий codice fiscale." },
      { number: "32", it: "STATO CIVILE", ru: "Семейное положение", section: "identity", cells: 1, kind: "code", mode: BOTH_WRITE, source: "Официальная сноска kit.", format: "A = не в браке; B = в браке.", example: { rilascio: "A", rinnovo: "A" }, mistake: "Не придумывай другие буквы без patronato / foglio note." },
      { number: "33", it: "SESSO", ru: "Пол", section: "identity", cells: 1, kind: "code", mode: BOTH_WRITE, source: "Паспорт / данные заявителя.", format: "F или M.", example: { rilascio: "F", rinnovo: "F" }, mistake: "Одна буква." },
      { number: "34", it: "NATO/A IL", ru: "Дата рождения", section: "identity", cells: 8, kind: "date", mode: BOTH_WRITE, source: "Паспорт.", format: "gg / mm / aaaa.", example: { rilascio: "14032004", rinnovo: "14032004" }, mistake: "Слэши уже есть на бумаге — их не вписывают." },
      { number: "35", it: "CODICE STATO NASCITA", ru: "Код страны рождения", section: "identity", cells: 3, kind: "code", mode: BOTH_WRITE, source: "Tabella 3 из бумажного kit.", format: "Сверь точный код и формат с Tabella 3 твоего kit.", example: { rilascio: "KAZ", rinnovo: "KAZ" }, mistake: "Страна рождения и гражданство могут отличаться." },
      { number: "36", it: "CODICE STATO CITTADINANZA", ru: "Код гражданства", section: "identity", cells: 3, kind: "code", mode: BOTH_WRITE, source: "Tabella 3 из бумажного kit.", format: "Сверь точный код и формат с Tabella 3 твоего kit.", example: { rilascio: "KAZ", rinnovo: "KAZ" }, mistake: "Не копируй поле 35 автоматически, если гражданство другое." },
      { number: "37", it: "RIFUGIATO", ru: "Статус беженца", section: "identity", cells: 2, kind: "x", mode: BOTH_WRITE, source: "Твой фактический статус.", format: "Для обычного студента X в NO.", example: { rilascio: "NO", rinnovo: "NO" }, mistake: "Не ставь SI, если это не твой официальный статус." },
      { number: "38", it: "CITTÀ DI NASCITA", ru: "Город рождения", section: "identity", cells: 20, rows: 2, kind: "text", mode: BOTH_WRITE, source: "Паспорт.", format: "Латиницей, ЗАГЛАВНЫМИ. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", example: { rilascio: "ALMATY", rinnovo: "ALMATY" }, mistake: "Не пиши кириллицей." },
    ],
  },
  {
    id: "passport",
    label: "Sezione 4",
    title: "Documento di identità",
    fields: [
      { number: "40", it: "PASSAPORTO", ru: "Паспорт", section: "passport", cells: 1, kind: "x", mode: BOTH_WRITE, source: "Документ, по которому подаёшь.", format: "X.", example: { rilascio: "X", rinnovo: "X" }, mistake: "Для обычного загранпаспорта X только здесь." },
      { number: "41", it: "ALTRO TIPO DI DOCUMENTO", ru: "Другой тип документа", section: "passport", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к обычному загранпаспорту.", format: "Оставить пустым.", mistake: "Для обычного паспорта X стоит в поле 40." },
      { number: "42", it: "SPECIFICARE ALTRO TIPO DI DOCUMENTO", ru: "Указать другой тип документа", section: "passport", cells: 2, kind: "text", mode: BOTH_EMPTY, source: "Не относится к обычному загранпаспорту.", format: "Оставить пустым.", mistake: "Не заполняй без другого типа документа." },
      { number: "43", it: "ALTRO", ru: "Другое", section: "passport", cells: 14, rows: 2, kind: "text", mode: BOTH_EMPTY, source: "Не относится к обычному загранпаспорту.", format: "Оставить пустым.", mistake: "Не заполняй без другого типа документа." },
      { number: "44", it: "NUMERO", ru: "Номер паспорта", section: "passport", cells: 14, kind: "text", mode: BOTH_WRITE, source: "Страница паспорта с данными.", format: "Копируй полностью, включая буквы.", example: { rilascio: "N12345678", rinnovo: "N12345678" }, mistake: "Не путай с номером permesso." },
      { number: "45", it: "VALIDO SINO AL", ru: "Паспорт действителен до", section: "passport", cells: 8, kind: "date", mode: BOTH_WRITE, source: "Страница паспорта с данными.", format: "Дата окончания, gg / mm / aaaa.", example: { rilascio: "01052031", rinnovo: "01052031" }, mistake: "Это не дата выдачи паспорта." },
      { number: "46", it: "RILASCIATO DA", ru: "Кем выдан", section: "passport", cells: 2, kind: "code", mode: BOTH_WRITE, source: "Foglio note / инструкция Mod. 209.", format: "Для обычного паспорта, выданного дома, обычно 01.", example: { rilascio: "01", rinnovo: "01" }, mistake: "02/03 относятся к выдаче консульством — не выбирай их без причины." },
    ],
  },
  {
    id: "visa",
    label: "Sezione 5",
    title: "Dati del visto",
    note: "Заполняется при первом запросе; при продлении вся секция остаётся пустой.",
    fields: [
      { number: "48", it: "DATA DI INGRESSO IN ITALIA", ru: "Дата въезда", section: "visa", cells: 8, kind: "date", mode: { rilascio: "write", rinnovo: "empty" }, source: "Штамп ingresso.", format: "Дата фактического въезда.", example: { rilascio: "28092026" }, mistake: "Не копируй дату начала визы." },
      { number: "49", it: "FRONTIERA", ru: "Пограничный пункт", section: "visa", cells: 22, kind: "text", mode: { rilascio: "write", rinnovo: "empty" }, source: "Штамп въезда.", format: "Название пункта / аэропорта.", example: { rilascio: "ROMA FIUMICINO" }, mistake: "Не пиши аэропорт по памяти, если штамп показывает другой пункт." },
      { number: "50", it: "NUMERO VISTO", ru: "Номер визы", section: "visa", cells: 14, kind: "text", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "Копируй номер целиком.", example: { rilascio: "MX2026001234" }, mistake: "Не путай с номером паспорта." },
      { number: "51", it: "TIPO VISTO", ru: "Тип визы", section: "visa", cells: 1, kind: "code", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "Для долгосрочной студенческой визы обычно D.", example: { rilascio: "D" }, mistake: "Смотри наклейку, а не ставь D автоматически." },
      { number: "52", it: "INGRESSO SINGOLO", ru: "Однократный въезд", section: "visa", cells: 1, kind: "x", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "X только если виза single.", mistake: "Нельзя ставить X одновременно в 52 и 53." },
      { number: "53", it: "INGRESSO MULTIPLO", ru: "Многократный въезд", section: "visa", cells: 1, kind: "x", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "X только если виза multi.", example: { rilascio: "X" }, mistake: "Проверь наклейку: это не предположение." },
      { number: "54", it: "MOTIVO DEL VISTO", ru: "Мотив визы", section: "visa", cells: 14, kind: "text", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "Латиницей, как на визе.", example: { rilascio: "STUDIO" }, mistake: "Не переводить на русский." },
      { number: "55", it: "DURATA", ru: "Длительность визы", section: "visa", cells: 3, kind: "number", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "В днях.", example: { rilascio: "365" }, mistake: "Год — это не 12 месяцев в этом поле." },
      { number: "56", it: "VALIDO DAL", ru: "Виза действует с", section: "visa", cells: 8, kind: "date", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "gg / mm / aaaa.", example: { rilascio: "12092026" }, mistake: "Не подменяй датой въезда." },
      { number: "57", it: "SINO AL", ru: "Виза действует до", section: "visa", cells: 8, kind: "date", mode: { rilascio: "write", rinnovo: "empty" }, source: "Визовая наклейка.", format: "gg / mm / aaaa.", example: { rilascio: "12092027" }, mistake: "Копируй срок визы." },
    ],
  },
  {
    id: "travel",
    label: "Sezione 6",
    title: "Titolo / documento di viaggio",
    note: "Для студента с обычным паспортом этот блок не заполняется.",
    fields: [
      { number: "59", it: "TITOLO DI VIAGGIO PER STRANIERO", ru: "Проездной документ иностранца", section: "travel", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к обычному национальному паспорту.", format: "Оставить пустым.", mistake: "Не путай с продлением самого permesso." },
      { number: "60", it: "TITOLO DI VIAGGIO PER APOLIDE", ru: "Проездной документ лица без гражданства", section: "travel", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к обычному национальному паспорту.", format: "Оставить пустым.", mistake: "Не отмечай без соответствующего документа." },
      { number: "61", it: "DOCUMENTO DI VIAGGIO PER RIFUGIATO", ru: "Проездной документ беженца", section: "travel", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к обычному национальному паспорту.", format: "Оставить пустым.", mistake: "Не отмечай без соответствующего документа." },
      { number: "62", it: "PERIODO PER IL QUALE SI CHIEDE IL RINNOVO", ru: "Период продления документа", section: "travel", cells: 0, kind: "text", mode: BOTH_EMPTY, source: "Подпись на бумажном бланке, не поле для обычного студента.", format: "Ничего не писать.", mistake: "Это заголовок к полям 63–64." },
      { number: "63", it: "1 ANNO", ru: "1 год", section: "travel", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к обычному национальному паспорту.", format: "Оставить пустым.", mistake: "Не отмечай без соответствующего документа." },
      { number: "64", it: "2 ANNI", ru: "2 года", section: "travel", cells: 1, kind: "x", mode: BOTH_EMPTY, source: "Не относится к обычному национальному паспорту.", format: "Оставить пустым.", mistake: "Не отмечай без соответствующего документа." },
    ],
  },
  {
    id: "address",
    label: "Sezione 7",
    title: "Recapito in Italia",
    fields: [
      { number: "66", it: "PROVINCIA", ru: "Провинция", section: "address", cells: 2, kind: "code", mode: BOTH_WRITE, source: "Фактический адрес проживания.", format: "2 буквы.", example: { rilascio: "FI", rinnovo: "FI" }, mistake: "Должна соответствовать comune из поля 67." },
      { number: "67", it: "COMUNE", ru: "Comune", section: "address", cells: 18, kind: "text", mode: BOTH_WRITE, source: "Фактический адрес проживания.", format: "Итальянское название, ЗАГЛАВНЫМИ.", example: { rilascio: "FIRENZE", rinnovo: "FIRENZE" }, mistake: "Не используй английское название города." },
      { number: "68", it: "INDIRIZZO", ru: "Улица", section: "address", cells: 24, rows: 2, kind: "text", mode: BOTH_WRITE, source: "Договор / адрес проживания.", format: "VIA / VIALE / PIAZZA + название. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", example: { rilascio: "VIA SAN GALLO", rinnovo: "VIA SAN GALLO" }, mistake: "Номер дома идёт отдельно в поле 69." },
      { number: "69", it: "NUMERO CIVICO", ru: "Номер дома", section: "address", cells: 6, kind: "text", mode: BOTH_WRITE, source: "Адрес проживания.", format: "Номер / буква.", example: { rilascio: "22", rinnovo: "22" }, mistake: "Не вписывай его повторно в конец поля 68." },
      { number: "70", it: "SCALA", ru: "Лестница / подъезд", section: "address", cells: 5, kind: "text", mode: BOTH_IF_EXISTS, source: "Адрес проживания, если scala указана.", format: "Оставь пустым, если в адресе этого нет.", mistake: "Не переноси сюда номер квартиры." },
      { number: "71", it: "INTERNO", ru: "Квартира / interno", section: "address", cells: 5, kind: "text", mode: BOTH_IF_EXISTS, source: "Адрес проживания, если interno указан.", format: "Оставь пустым, если в адресе этого нет.", mistake: "Не записывай сюда scala." },
      { number: "72", it: "CAP", ru: "Почтовый индекс", section: "address", cells: 5, kind: "number", mode: BOTH_WRITE, source: "Адрес проживания.", format: "5 цифр.", example: { rilascio: "50129", rinnovo: "50129" }, mistake: "Проверь CAP именно своего адреса." },
      { number: "73", it: "INDIRIZZO E-MAIL (FACOLTATIVO)", ru: "Email", section: "address", cells: 24, rows: 2, kind: "text", mode: BOTH_IF_EXISTS, source: "Твоя рабочая почта.", format: "Каждый символ в клетке; @ тоже занимает клетку. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", example: { rilascio: "MARIA.K@MAIL.COM", rinnovo: "MARIA.K@MAIL.COM" }, mistake: "Не выкидывай @ и не ставь пробелы." },
      { number: "74", it: "TELEFONO FISSO IN ITALIA (FACOLTATIVO)", ru: "Стационарный телефон", section: "address", cells: 12, kind: "number", mode: BOTH_IF_EXISTS, source: "Только если есть.", format: "Итальянский номер.", mistake: "Не обязательно заполнять." },
      { number: "75", it: "TELEFONO CELLULARE IN ITALIA (FACOLTATIVO)", ru: "Мобильный в Италии", section: "address", cells: 10, kind: "number", mode: BOTH_IF_EXISTS, source: "Итальянский мобильный.", format: "Без +39 и пробелов.", example: { rilascio: "3331234567", rinnovo: "3331234567" }, mistake: "Не добавляй +39 в клетки." },
    ],
  },
  {
    id: "correspondence",
    label: "Sezione 8",
    title: "Recapito per comunicazioni",
    note: "Заполняй только если письма должны приходить на другой адрес.",
    fields: [
      { number: "77", it: "PRESSO", ru: "У кого / presso", section: "correspondence", cells: 24, rows: 2, kind: "text", mode: BOTH_IF_EXISTS, source: "Заполняй только если почта должна приходить по другому адресу.", format: "Оставь всю секцию пустой, если адрес совпадает с Sezione 7. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", mistake: "Не дублируй тот же адрес без необходимости." },
      { number: "78", it: "PROVINCIA", ru: "Провинция другого адреса", section: "correspondence", cells: 2, kind: "code", mode: BOTH_IF_EXISTS, source: "Другой адрес для корреспонденции.", format: "2 буквы.", mistake: "Не заполняй, если используешь основной адрес." },
      { number: "79", it: "COMUNE", ru: "Comune другого адреса", section: "correspondence", cells: 18, kind: "text", mode: BOTH_IF_EXISTS, source: "Другой адрес для корреспонденции.", format: "Итальянское название comune.", mistake: "Не заполняй, если используешь основной адрес." },
      { number: "80", it: "INDIRIZZO", ru: "Улица другого адреса", section: "correspondence", cells: 24, rows: 2, kind: "text", mode: BOTH_IF_EXISTS, source: "Другой адрес для корреспонденции.", format: "Улица без номера дома. Если текст не помещается, продолжай со второй строки; между словами оставляй одну пустую клетку.", mistake: "Номер дома идёт отдельно в поле 81." },
      { number: "81", it: "NUMERO CIVICO", ru: "Номер дома / литера", section: "correspondence", cells: 6, kind: "text", mode: BOTH_IF_EXISTS, source: "Другой адрес для корреспонденции.", format: "numero / lettera.", mistake: "Не смешивай номер и interno." },
      { number: "82", it: "SCALA", ru: "Лестница / подъезд", section: "correspondence", cells: 5, kind: "text", mode: BOTH_IF_EXISTS, source: "Другой адрес, если применимо.", format: "Оставь пустым, если scala нет.", mistake: "Не выдумывай значение." },
      { number: "83", it: "INTERNO", ru: "Квартира / interno", section: "correspondence", cells: 5, kind: "text", mode: BOTH_IF_EXISTS, source: "Другой адрес, если применимо.", format: "Оставь пустым, если interno нет.", mistake: "Не выдумывай значение." },
      { number: "84", it: "CAP", ru: "Почтовый индекс другого адреса", section: "correspondence", cells: 5, kind: "number", mode: BOTH_IF_EXISTS, source: "Другой адрес для корреспонденции.", format: "5 цифр.", mistake: "Не заполняй, если используешь основной адрес." },
    ],
  },
];

export const PERMIT_CODES = [
  { code: "24", title: "Motivi di studio · art. 39", note: "Учёба / языковые и другие случаи art. 39." },
  { code: "31", title: "Studente · art. 39-bis", note: "Категории studente по art. 39-bis. Сверь со своим kit / international office." },
  { code: "32", title: "Alunno · art. 39-bis", note: "Школьник / alunno." },
  { code: "27", title: "Ricercatore", note: "Исследователь." },
] as const;

export const PROVINCES = [
  ["MI","Milano"],["MB","Monza"],["RM","Roma"],["FI","Firenze"],["PO","Prato"],["BO","Bologna"],["TO","Torino"],["PD","Padova"],["VE","Venezia"],["VR","Verona"],["NA","Napoli"],["PI","Pisa"],["SI","Siena"],["PG","Perugia"],["TS","Trieste"],["TN","Trento"],["BZ","Bolzano"],["GE","Genova"],["BA","Bari"],["LE","Lecce"],["CT","Catania"],["PA","Palermo"],["CA","Cagliari"],["SS","Sassari"],["AQ","L'Aquila"],["AN","Ancona"],["PV","Pavia"],["PR","Parma"],["MO","Modena"],["RE","Reggio Emilia"],["FE","Ferrara"],["BS","Brescia"],["BG","Bergamo"],["CO","Como"],["VA","Varese"],["UD","Udine"],["TV","Treviso"],["RA","Ravenna"],["FC","Forlì-Cesena"],["RN","Rimini"],["PU","Pesaro e Urbino"],["MC","Macerata"],["LT","Latina"],["FR","Frosinone"],["VT","Viterbo"],["RI","Rieti"],["TR","Terni"],["AR","Arezzo"],["LI","Livorno"],["LU","Lucca"],["SP","La Spezia"],["AO","Aosta"],["CR","Cremona"],["MN","Mantova"],["NO","Novara"],["AL","Alessandria"],["CN","Cuneo"],["VC","Vercelli"],["FG","Foggia"],["TA","Taranto"],["CS","Cosenza"],["RC","Reggio Calabria"],["ME","Messina"],["SR","Siracusa"],["RG","Ragusa"],["SA","Salerno"],["CE","Caserta"],["PE","Pescara"],["CH","Chieti"]
] as const;

export const COUNTRY_CODES = [
  ["KAZ","Казахстан"],["RUS","Россия"],["UKR","Украина"],["BLR","Беларусь"],["UZB","Узбекистан"],["KGZ","Кыргызстан"],["TJK","Таджикистан"],["TKM","Туркменистан"],["AZE","Азербайджан"],["ARM","Армения"],["GEO","Грузия"],["MDA","Молдова"],["CHN","Китай"],["IND","Индия"],["TUR","Турция"],["IRN","Иран"],["USA","США"],["BRA","Бразилия"],["MEX","Мексика"],["MAR","Марокко"],["EGY","Египет"],["TUN","Тунис"],["NGA","Нигерия"],["GHA","Гана"],["CMR","Камерун"],["PAK","Пакистан"],["BGD","Бангладеш"],["VNM","Вьетнам"],["IDN","Индонезия"],["KOR","Корея"],["JPN","Япония"],["COL","Колумбия"],["PER","Перу"],["VEN","Венесуэла"],["ARG","Аргентина"],["ALB","Албания"],["SRB","Сербия"],["MKD","Северная Македония"]
] as const;
