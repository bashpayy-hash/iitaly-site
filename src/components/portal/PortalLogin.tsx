"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./portal.module.css";

export function PortalLogin({
  onSubmit,
  error,
}: {
  onSubmit: (surname: string, code: string) => void | Promise<void>;
  error: string | null;
}) {
  const router = useRouter();
  const [surname, setSurname] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (surname.trim().length < 2) {
      setLocalError("Введи фамилию, как при оформлении.");
      return;
    }
    if (code.trim().length < 4) {
      setLocalError("Введи код доступа из страницы подтверждения оплаты.");
      return;
    }
    setLocalError(null);
    setSubmitting(true);
    try {
      await onSubmit(surname.trim(), code.trim().toUpperCase());
    } finally {
      setSubmitting(false);
    }
  }

  const shownError = localError || error;

  return (
    <section className={styles.loginPage}>
      <div className={styles.loginShell}>
        <div className={styles.loginIntro}>
          <p className={styles.kicker}>Личный кабинет IITALY</p>
          <h1 className={styles.loginTitle}>Тебе не нужно помнить весь путь.</h1>
          <p className={styles.loginLead}>
            После входа система покажет один следующий шаг, ближайшие дедлайны и документы, которые требуют внимания.
          </p>
          <div className={styles.loginRoute} aria-hidden>
            <span>Профиль</span>
            <i />
            <span>Документы</span>
            <i />
            <span>Подача</span>
            <i />
            <span>Италия</span>
          </div>
        </div>

        <div className={styles.loginCard}>
          <div>
            <p className={styles.kicker}>Вход</p>
            <h2 className={styles.loginCardTitle}>Продолжить маршрут</h2>
            <p className={styles.loginHint}>Используй фамилию и код, который появился после оплаты.</p>
          </div>

          <div className={styles.loginFields}>
            <label className={styles.loginField}>
              <span>Фамилия</span>
              <input
                value={surname}
                onChange={(e) => {
                  setSurname(e.target.value);
                  setLocalError(null);
                }}
                placeholder="Как в форме оплаты"
                autoComplete="family-name"
                aria-invalid={!!shownError || undefined}
              />
            </label>

            <label className={styles.loginField}>
              <span>Код доступа</span>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setLocalError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="Например, ABCD-1234"
                autoComplete="off"
                aria-invalid={!!shownError || undefined}
              />
            </label>
          </div>

          {shownError && <p role="alert" className={styles.loginError}>{shownError}</p>}

          <button type="button" className={styles.loginSubmit} onClick={submit} disabled={submitting}>
            {submitting ? "Проверяю…" : "Войти в кабинет"}
          </button>

          <p className={styles.loginFoot}>
            Ещё нет кода?{" "}
            <button type="button" onClick={() => router.push("/prices")}>Посмотреть тарифы</button>
          </p>
        </div>
      </div>
    </section>
  );
}
