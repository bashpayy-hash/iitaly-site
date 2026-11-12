"use client";

import { Lock, LockOpen } from "lucide-react";
import { BentoCell, bento, type BentoSpan } from "@/components/ui/Bento";
import { paidDeviceNow, usePaidDevice } from "@/components/access/usePaidDevice";
import { useWallPurchase, type WallPlace } from "@/components/access/useWallPurchase";
import walls from "./guide-wall.module.css";
import styles from "./guide-steps.module.css";

/* Что здесь бесплатно, а что с маршрутом (owner, 12 Nov: «я всё ещё не вижу
   дозирования контента по платной/бесплатной основе»). Граница стояла только
   внутри шагов; в обзоре темы и визы её не было видно. Теперь обзор говорит
   её прямо: слева — что открыто сейчас, справа — что откроется после оплаты,
   и та же покупка, что в стене шага. На оплаченном устройстве ячейка говорит,
   почему открыто всё. */
export function GuideDose({ place, free, paid: paidText, span }: { place: WallPlace; free: string; paid: string; span: BentoSpan }) {
  const paid = usePaidDevice();
  const wall = useWallPurchase(place, !paidDeviceNow());
  if (paid) return <BentoCell span={span} tone="quiet" icon={LockOpen} data-guide-dose="paid">
    <p className={bento.text}>Всё открыто: на этом устройстве выполнен вход в кабинет.</p>
  </BentoCell>;
  return <BentoCell span={span} data-guide-dose="guest">
    <div className={styles.dose}>
      <div className={styles.doseSide} data-dose="free">
        <p className={styles.doseLabel}><span aria-hidden="true"><LockOpen size={15} strokeWidth={1.9} /></span>Бесплатно</p>
        <p className={styles.doseText}>{free}</p>
      </div>
      <div className={styles.doseSide} data-dose="paid">
        <p className={styles.doseLabel}><span aria-hidden="true"><Lock size={15} strokeWidth={1.9} /></span>С маршрутом</p>
        <p className={styles.doseText}>{paidText}</p>
      </div>
    </div>
    <div className={walls.actions}>
      <button type="button" className={walls.buy} data-wall-buy data-wall-place={place} aria-haspopup="dialog" onClick={wall.open}>{wall.label}</button>
      <a className={walls.link} href="/prices#main-package">Что входит и возврат 7 дней</a>
      <a className={walls.link} href="/portal?view=login">Уже оплачено — войти</a>
    </div>
    {wall.modal}
  </BentoCell>;
}
