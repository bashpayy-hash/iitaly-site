"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import styles from "./portal-login.module.css";

// The user's selected, existing illustration, optimized and hosted in Higgsfield.
// These are confirmed permanent asset URLs, not expiring upload URLs.
const ART_DESKTOP = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/fe1a7012-e883-4026-a630-67bb8babf92e.webp";
const ART_SMALL = "https://d2ol7oe51mr4n9.cloudfront.net/user_3IEOyz95hPdwK9Yu4IfSlkWBSlJ/9273dd44-3498-4309-9c30-d763a10345b6.webp";

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
    <section className={styles.page} data-portal-login>
      <div className={styles.shell}>
        <div className={styles.intro}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Личный кабинет IITALY</p>
            <h1 className={styles.title}>Тебе не нужно помнить весь путь.</h1>
            <p className={styles.lead}>
              После входа система покажет один следующий шаг, ближайшие дедлайны и документы, которые требуют внимания.
            </p>
          </div>

          <div className={styles.art} aria-hidden="true">
            <picture>
              <source media="(max-width: 760px)" srcSet={ART_SMALL} />
              <Image
                src={ART_DESKTOP}
                alt=""
                width={1280}
                height={960}
                className={styles.artImage}
                unoptimized
                loading="eager"
                fetchPriority="high"
                draggable={false}
                referrerPolicy="no-referrer"
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
  );
}
