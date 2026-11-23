"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import marketing from "@/components/marketing/marketing.module.css";
import styles from "./portal-login.module.css";
import swap from "@/components/motion/swap.module.css";
import { PAY_WA } from "@/lib/payment";
import { isValidPhone } from "@/lib/phone";
import { requestPortalCode } from "@/lib/portalRecovery";

/* Экран входа — в общем стиле сайта: шапка сайта, те же шрифты и цвета,
   акварель кампуса, что и на главной и в самом кабинете. Раньше он жил в
   отдельном референсе (бежевый фон, засечки, чёрная кнопка, картинка со
   стороннего CDN) и выглядел другим сайтом, без навигации назад. */

export function PortalLogin({
  onSubmit,
  error,
}: {
  onSubmit: (surname: string, code: string) => void | Promise<void>;
  error: string | null;
}) {
  const [surname, setSurname] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);
  const surnameRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const hintId = useId();
  /* «Не помню код» (owner, 20 Nov: «Почему для восстановления пароля он должен
     писать WhatsApp? У нас нету формы восстановления?» — «Да, давай делай»).
     The card turns into a recovery form: surname and phone as at payment.
     The server sends the code to the cabinet's own Telegram and email and
     answers the same for everyone (src/lib/portalRecovery.ts). WhatsApp stays
     as the fallback: on an older server, on a network failure, and when
     nothing arrives. */
  const [mode, setMode] = useState<"login" | "recover">("login");
  // Motion pass, 23 Nov: «Вход» and «Не помню код» replaced each other in one
  // frame. After a switch the card arrives; on a page load it is just there.
  const [switched, setSwitched] = useState(false);
  const [phone, setPhone] = useState("");
  const [recoverState, setRecoverState] = useState<"idle" | "sending" | "sent" | "manual">("idle");
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const recoverInFlight = useRef(false);
  const recoverSurnameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const recoverHeadingRef = useRef<HTMLHeadingElement>(null);
  const recoverStatusRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const recoverErrorId = useId();
  const recoverHintId = useId();

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    if (mode === "recover") recoverHeadingRef.current?.focus();
    else codeRef.current?.focus();
  }, [mode]);

  useEffect(() => {
    if (recoverState === "sent" || recoverState === "manual") recoverStatusRef.current?.focus();
  }, [recoverState]);

  function openRecovery() {
    setLocalError(null);
    setRecoverError(null);
    setRecoverState("idle");
    setSwitched(true);
    setMode("recover");
  }

  async function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recoverInFlight.current) return;
    if (surname.trim().length < 2) {
      setRecoverError("Введи фамилию, как при оплате.");
      recoverSurnameRef.current?.focus();
      return;
    }
    if (!isValidPhone(phone)) {
      setRecoverError("Введи телефон, который указывал при оплате.");
      phoneRef.current?.focus();
      return;
    }
    recoverInFlight.current = true;
    setRecoverError(null);
    setRecoverState("sending");
    try {
      const result = await requestPortalCode(surname.trim(), phone.trim());
      if (result.ok) setRecoverState("sent");
      else if (result.kind === "invalid") { setRecoverError(result.error); setRecoverState("idle"); }
      else setRecoverState("manual");
    } finally {
      recoverInFlight.current = false;
    }
  }

  const whatsappText = surname.trim().length >= 2
    ? `Здравствуйте! Не могу найти код доступа к кабинету IITALY. Фамилия: ${surname.trim()}${phone.trim() ? `, телефон: ${phone.trim()}` : ""}.`
    : "Здравствуйте! Не могу найти код доступа к кабинету IITALY. Моя фамилия: ";
  const whatsappHref = `https://wa.me/${PAY_WA}?text=${encodeURIComponent(whatsappText)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    if (surname.trim().length < 2) {
      setLocalError("Введи фамилию, как при оформлении.");
      surnameRef.current?.focus();
      return;
    }
    if (code.trim().length < 4) {
      setLocalError("Введи код доступа из страницы подтверждения оплаты.");
      codeRef.current?.focus();
      return;
    }
    inFlight.current = true;
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit(surname.trim(), code.trim().toUpperCase());
    } catch {
      setLocalError("Не удалось войти. Проверь соединение и попробуй ещё раз.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  const shownError = localError || error;

  return (
    <div className={marketing.surface}>
    <MarketingHeader />
    <main id="main">
    <section className={styles.page} data-portal-login>
      <div className={styles.shell}>
        <div className={styles.intro}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Личный кабинет IITALY</p>
            <h1 className={styles.title}>Тебе не нужно помнить <span className="warm-highlight">весь путь.</span></h1>
            <p className={styles.lead}>
              После входа система покажет один следующий шаг, ближайшие дедлайны и документы, которые требуют внимания.
            </p>
          </div>

          <div className={styles.art} aria-hidden="true">
            <picture>
              <source media="(max-width: 760px)" srcSet="/illustrations/editorial/campus-arrival-480.webp" />
              <img
                src="/illustrations/editorial/campus-arrival-960.webp"
                srcSet="/illustrations/editorial/campus-arrival-960.webp 960w, /illustrations/editorial/campus-arrival-1168.webp 1168w"
                sizes="(max-width: 1000px) 60vw, 700px"
                alt=""
                width={1168}
                height={880}
                className={styles.artImage}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable={false}
                data-portal-login-art
              />
            </picture>
          </div>


          <div className={styles.route} aria-hidden="true">
            <span>Профиль</span><i />
            <span>Документы</span><i />
            <span>Подача</span><i />
            <span>Италия</span>
          </div>
        </div>

        {mode === "recover" ? (
        <form
          className={`${styles.card} ${switched ? swap.rise : ""}`}
          onSubmit={recover}
          noValidate
          aria-labelledby="portal-recover-heading"
          aria-busy={recoverState === "sending"}
          data-fab-yield
          data-portal-recover
        >
          <div>
            <p className={styles.eyebrow}>Вход</p>
            <h2 id="portal-recover-heading" ref={recoverHeadingRef} tabIndex={-1} className={styles.cardTitle}>Не помню код</h2>
            <p id={recoverHintId} className={styles.hint}>Укажи фамилию и телефон, как при оплате. Код придёт в Telegram или на почту, если они подключены к кабинету. Если нет&nbsp;— пришлём вручную через WhatsApp.</p>
          </div>

          {recoverState === "sent" || recoverState === "manual" ? (
            <div ref={recoverStatusRef} tabIndex={-1} role="status" className={`${styles.notice} ${swap.fade}`} data-portal-recover-status={recoverState}>
              {recoverState === "sent" ? <>
                <p className={styles.noticeTitle}>Запрос принят</p>
                <p>Если кабинет с такими фамилией и телефоном есть, код уже в Telegram или на почте, которые к нему подключены. Не пришёл за пару минут&nbsp;— напиши нам, пришлём вручную.</p>
              </> : <>
                <p className={styles.noticeTitle}>Пришлём код вручную</p>
                <p>Отправить код автоматически сейчас не получилось. Напиши нам в WhatsApp: фамилия и телефон уже в сообщении.</p>
              </>}
              <a className={styles.whatsapp} href={whatsappHref} target="_blank" rel="noopener noreferrer">Написать в WhatsApp</a>
            </div>
          ) : <>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>Фамилия</span>
                <input
                  ref={recoverSurnameRef}
                  name="surname"
                  value={surname}
                  onChange={(event) => {
                    setSurname(event.target.value);
                    setRecoverError(null);
                  }}
                  placeholder="Как в форме оплаты"
                  autoComplete="family-name"
                  aria-invalid={!!recoverError || undefined}
                  aria-describedby={recoverError ? recoverErrorId : recoverHintId}
                />
              </label>
              <label className={styles.field}>
                <span>Телефон</span>
                <input
                  ref={phoneRef}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setRecoverError(null);
                  }}
                  placeholder="+7 777 123 45 67"
                  autoComplete="tel"
                  aria-invalid={!!recoverError || undefined}
                  aria-describedby={recoverError ? recoverErrorId : recoverHintId}
                />
              </label>
            </div>
            {recoverError && <p id={recoverErrorId} role="alert" className={`${styles.error} ${swap.fade}`}>{recoverError}</p>}
            <button type="submit" className={styles.submit} disabled={recoverState === "sending"}>
              {recoverState === "sending" ? "Отправляю…" : "Прислать код"}
            </button>
          </>}
          <p className={styles.foot}>
            Код нашёлся?{" "}
            <button type="button" className={styles.textButton} onClick={() => { setSwitched(true); setMode("login"); }} data-portal-recover-back>Ввести код</button>
          </p>
        </form>
        ) : (
        <form
          className={`${styles.card} ${switched ? swap.rise : ""}`}
          onSubmit={submit}
          noValidate
          aria-labelledby="portal-login-heading"
          aria-busy={submitting}
          data-fab-yield
        >
          <div>
            <p className={styles.eyebrow}>Вход</p>
            <h2 id="portal-login-heading" className={styles.cardTitle}>Продолжить маршрут</h2>
            <p id={hintId} className={styles.hint}>Используй фамилию и код, который появился после оплаты.</p>
          </div>

          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Фамилия</span>
              <input
                ref={surnameRef}
                name="surname"
                value={surname}
                onChange={(event) => {
                  setSurname(event.target.value);
                  setLocalError(null);
                }}
                placeholder="Как в форме оплаты"
                autoComplete="family-name"
                aria-invalid={!!shownError || undefined}
                aria-describedby={shownError ? errorId : hintId}
              />
            </label>
            <label className={styles.field}>
              <span>Код доступа</span>
              <input
                ref={codeRef}
                name="access-code"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setLocalError(null);
                }}
                placeholder="Например, ABCD-1234"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-invalid={!!shownError || undefined}
                aria-describedby={shownError ? errorId : hintId}
              />
            </label>
          </div>

          {shownError && <p id={errorId} role="alert" className={`${styles.error} ${swap.fade}`}>{shownError}</p>}
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? "Проверяю…" : "Войти в кабинет"}
          </button>
          {/* Owner, 14 Nov 2026 («исправь все неточности», after the uxaudit
             pass): the only way out of this form was «Посмотреть тарифы», which
             reads as «pay again» to someone who paid and lost the code. Since
             20 Nov the way back is the recovery form above, not WhatsApp. */}
          <p className={styles.foot}>
            Не помню код —{" "}
            <button type="button" className={styles.textButton} onClick={openRecovery} data-portal-recover-open>восстановить</button>
          </p>
          <p className={styles.foot}>
            Ещё нет кода? <Link href="/prices">Посмотреть цену</Link>
          </p>
        </form>
        )}
      </div>
    </section>
    </main>
    </div>
  );
}
