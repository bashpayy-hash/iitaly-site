/** Reviewed primary sources. Scope belongs to each source, not the whole university catalogue. */
export const REVIEWED_AT = "2026-10-09";
export const REVIEWED_LABEL = "9 октября 2026";
export type Intake = "2026/27" | "2027/28";
export const VISA_MINIMUM_EUR = 10179.85;
export const VISA_MINIMUM_LABEL = "€10 179,85";
export const VISA_FEE_EUR = 50;
export const CIMEA_VERIFICATION_EUR = 150;
export const CIMEA_WORKING_DAYS = 60;
export const CENT_FEE_EUR = 55;
export const PERMESSO_COST_LABEL = "€116,46";
export const VISA_DEADLINES: Record<Intake, string> = {
  "2026/27": "30 ноября 2026",
  "2027/28": "31 октября 2027",
};

export const ADMISSION_SOURCES = {
  procedure: { label: "Universitaly · процедура 2026/27–2027/28", href: "https://universitaly-private.cineca.it/uploads/universitaly-pubblico/Circolare_2026-2027_studenti_internazionali.pdf", scope: "Национальная процедура · 2026/27 и 2027/28" },
  international: { label: "Universitaly · иностранные студенты", href: "https://www.universitaly.it/en/studenti-stranieri", scope: "Национальные визовые сроки · 2026/27 и 2027/28" },
  faq: { label: "Universitaly · разъяснения к процедуре", href: "https://universitaly-private.cineca.it/uploads/universitaly-pubblico/FAQ.pdf", scope: "Документы и специальные визовые случаи · 2026–2028" },
  qualifications: { label: "Universitaly · иностранные квалификации", href: "https://universitaly-private.cineca.it/uploads/universitaly-pubblico/Allegato_1-Circolare_2026_2027.pdf", scope: "Компенсация школьных лет и право доступа" },
  kazakhstan: { label: "Ca’ Foscari · квалификации Казахстана", href: "https://www.unive.it/pag/41327/", scope: "Правила конкретного университета; не гарантия приёма в другие вузы" },
  apostille: { label: "Казахстан · апостилирование образования", href: "https://www.gov.kz/situations/110/intro?lang=ru", scope: "Госуслуга Казахстана; выбрать услугу для своего уровня образования" },
  translation: { label: "Посольство в Астане · переводы", href: "https://ambastana.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-italiano/traduzione-e-legalizzazione-dei-documenti/", scope: "Обновление 30.09.2026 · Казахстан и Кыргызстан" },
  dov: { label: "Посольство в Астане · DoV", href: "https://ambastana.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-straniero/dichiarazioni-di-valore/", scope: "Условия бесплатности с 01.04.2026" },
  cimea: { label: "CIMEA · Verification и ARDI", href: "https://cimea-diplome.it/page-verification-service", scope: "Индивидуальная проверка квалификации; рабочие дни" },
  visa: { label: "Астана · чек-лист учебной визы D", href: "https://ambastana.esteri.it/wp-content/uploads/2026/06/4a_Checklist-for-Study-University-pre-enrolment-Laurea-Laurea-magistrale-AFAM-etc-2026_REV-2.pdf", scope: "Университетская предзапись · редакция июня 2026" },
  visaWhere: { label: "Астана · где подавать на визу", href: "https://ambastana.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-straniero/visti/dove-chiedere-un-visto/", scope: "Компетенция консульства и официальный канал VFS" },
  visaFees: { label: "Астана · консульские сборы", href: "https://ambastana.esteri.it/it/servizi-consolari-e-visti/servizi-per-il-cittadino-straniero/visti/quanto-costa-un-visto-e-come-pagare/", scope: "Учебная D · сервисный сбор отдельно" },
  visaTiming: { label: "МИД Италии · сроки виз", href: "https://www.esteri.it/it/servizi-opportunita/ingressosoggiornoinitalia/visto_ingresso/termini_rilascio_visti/", scope: "Национальные визы; возможны дополнительные проверки" },
  cent: { label: "CISIA · актуальные правила CEnT-S", href: "https://www.cisiaonline.it/en/cent/all-about-CEnT/all-about-CEnT", scope: "Пять макропериодов; допустимость результата определяет вуз" },
  padova: { label: "Padova · первый раунд 2027/28", href: "https://www.unipd.it/en/ammissione-studenti-internazionali", scope: "15.09–15.11.2026 · большинство программ" },
  edisu: { label: "EDISU Piemonte · bando 2026/27", href: "https://www.edisu.piemonte.it/sites/default/files/documentazione/bandi-di-concorso/Bando_borsa_di_studio_servizio_abitativo_premio_di_laurea_contributo_studenti_con_disabilit%C3%A0_dal_46_p.c._iscritti_al_collocamento_mirato_a.a._2026-27_0.pdf", scope: "Пьемонт · иностранные доходы non-EU · 2026/27" },
  iulm: { label: "IULM · ISEEU parificato 2026/27", href: "https://www.iulm.it/wps/wcm/connect/iulm/e08c8e85-2a3e-4be0-8767-ca3733b94078/Documents%2Bfor%2BISEEU%2Bparificato%2B26_27.pdf?CACHEID=ROOTWORKSPACE.Z18_N19GHC41OO5PD0QACD0HKQ38C6-e08c8e85-2a3e-4be0-8767-ca3733b94078-pYSw2I2&MOD=AJPERES", scope: "IULM · не общее правило Ломбардии" },
  padovaDsu: { label: "Padova · стипендии 2026/27", href: "https://wwwassets.unipd.it/sites/default/files/2026-07/Bando%20Borse%20Studio%202026-27.pdf", scope: "Суммы, ISEE/ISPE, проживание и CFU конкретного конкурса" },
  maeci: { label: "MAECI · конкурс 2026/27", href: "https://www.esteri.it/wp-content/uploads/2026/03/Bando-26-27-ENG.pdf", scope: "Приём завершён 26.03.2026; не конкурс 2027/28" },
  medicine: { label: "MUR · semestre aperto 2026/27", href: "https://www.mur.gov.it/it/news/lunedi-13072026/medicina-al-le-iscrizioni-al-semestre-aperto", scope: "Медицинский маршрут на итальянском; отдельные правила для других программ" },
  permesso: { label: "Bologna · оформление permesso", href: "https://www.unibo.it/en/study/enrolment-fees-and-other-procedures/residence-permit", scope: "Подача, сборы и продление; локальная организация приёма" },
  health: { label: "Bologna · медицинская помощь студентам", href: "https://www.unibo.it/en/study/life-at-university-and-in-the-city/health-and-assistance/health-and-medical-assistance-in-bologna-cesena-forli-ravenna-e-rimini/medical-assistance-for-international-students", scope: "Добровольная SSN; календарный год и условия студенческого тарифа" },
  taxCode: { label: "Bologna · Universitaly и codice fiscale", href: "https://www.unibo.it/en/attachments/guide-universitaly", scope: "Рассчитанный код не заменяет официальный" },
  travel: { label: "Sapienza · поездки с ricevuta", href: "https://www.uniroma1.it/it/pagina/permesso-di-soggiorno-motivi-di-studio", scope: "Первое оформление и продление нужно различать" },
  military: { label: "Минобороны Казахстана · отсрочка", href: "https://www.gov.kz/memleket/entities/mod/press/news/details/1218872?lang=ru", scope: "Обучение за рубежом и индивидуальная оценка Foundation" },
} as const;
export type SourceId = keyof typeof ADMISSION_SOURCES;

export const DSU_EXAMPLES = {
  piemonte: { title: "EDISU Piemonte", year: "2026/27", text: "Для соответствующей категории non-EU: доходы 2025, имущество и средства на 31.12.2025. Обычный срок 4 сентября 2026 уже прошёл.", source: "edisu" },
  iulm: { title: "IULM · ISEEU parificato", year: "2026/27", text: "Доходы 2024, имущество и средства на 31.12.2024, средний банковский остаток за 2024. Это правило IULM, не всей Ломбардии.", source: "iulm" },
  padova: { title: "Padova", year: "2026/27", text: "ISEE до €26 306,25 и ISPE до €43 125,94. Базовая сумма fuorisede — €7 171,11; итог и денежная выплата зависят от условий и услуг.", source: "padovaDsu" },
} as const;
