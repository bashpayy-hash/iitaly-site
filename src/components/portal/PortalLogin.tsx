"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Aldo } from "@/components/Aldo";

export function PortalLogin({
  onSubmit,
  error,
}: {
  onSubmit: (surname: string, code: string) => void;
  error: string | null;
}) {
  const router = useRouter();
  const [surname, setSurname] = useState("");
  const [code, setCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function submit() {
    if (surname.trim().length < 2) {
      setLocalError("Введи фамилию, как при оформлении.");
      return;
    }
    if (code.trim().length < 4) {
      setLocalError("Введи код брони из WhatsApp.");
      return;
    }
    setLocalError(null);
    onSubmit(surname.trim(), code.trim().toUpperCase());
  }

  return (
    <section className="overflow-hidden px-5 pt-10 pb-16 sm:pt-14">
      <div className="mx-auto max-w-[500px]">
        <Aldo pose="greeting" className="h-14 w-14" />
        <p className="mt-3 text-xs font-extrabold tracking-[0.16em] text-sec uppercase">Личный кабинет</p>
        <h1 className="mt-2 font-display text-[9vw] leading-[0.95] font-black tracking-tight uppercase sm:text-[5vw] lg:text-[2.6vw]">
          Твой маршрут поступления
        </h1>
        <p className="mt-5 text-base text-ink-soft">
          Система ведёт тебя по шагам: что сделано, что горит, какой документ
          нужен следующим. Вход как проверка брони: фамилия и код, который
          приходит в WhatsApp после оплаты.
        </p>

        <div className="mt-6 space-y-2.5">
          <label className="block">
            <span className="sr-only">Фамилия</span>
            <input
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Фамилия"
              autoComplete="family-name"
              className="w-full rounded-md border-2 border-ink bg-paper px-4 py-3 text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            />
          </label>
          <label className="block">
            <span className="sr-only">Код брони</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Код брони, например ABCD-1234"
              autoComplete="off"
              className="w-full rounded-md border-2 border-ink bg-paper px-4 py-3 text-sm font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            />
          </label>
          <Button type="button" variant="primary" onClick={submit} className="w-full">
            Войти
          </Button>
        </div>

        {(localError || error) && (
          <div role="alert" className="mt-3 rounded-md border-2 border-red bg-red/5 px-4 py-3 text-sm font-bold text-red">
            {localError || error}
          </div>
        )}

        <p className="mt-4 text-sm text-ink-soft">
          Ещё нет кода?{" "}
          <button type="button" onClick={() => router.push("/prices")} className="font-bold text-red underline underline-offset-4">
            Посмотреть тарифы
          </button>{" "}
          — кабинет открывается сразу после оплаты.
        </p>
      </div>
    </section>
  );
}
