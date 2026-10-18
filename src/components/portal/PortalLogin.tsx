"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import marketing from "@/components/marketing/marketing.module.css";
import styles from "./portal-login.module.css";
import { Vespi } from "@/components/mascot/Vespi";

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
            <h1 className={styles.title}>Тебе не нужно помнить весь <span className="editorial-accent">путь.</span></h1>
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

          <Vespi className={styles.companion} sizes="(max-width: 760px) 112px, 148px" priority />

          <div className={styles.route} aria-hidden="true">
            <span>Профиль</span><i />
            <span>Документы</span><i />
            <span>Подача</span><i />
            <span>Италия</span>
          </div>
        </div>

        <form
          className={styles.card}
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

          {shownError && <p id={errorId} role="alert" className={styles.error}>{shownError}</p>}
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? "Проверяю…" : "Войти в кабинет"}
          </button>
          <p className={styles.foot}>
            Ещё нет кода? <Link href="/prices">Посмотреть тарифы</Link>
          </p>
        </form>
      </div>
    </section>
    </main>
    </div>
  );
}
