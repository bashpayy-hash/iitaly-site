"use client";

import { useWallPurchase, type WallPlace } from "@/components/access/useWallPurchase";
import { paidDeviceNow } from "@/components/access/usePaidDevice";
import { GUIDE_WALL_NOTE } from "./guideAccess";
import styles from "./guide-wall.module.css";

/* Стена в гайдах, визе и тренажёре (owner, 9 Nov). Та же покупка, что на
   /plan и в кабинете: кнопка с ценой открывает форму с /prices. Рядом —
   что входит и вход для тех, кто уже оплатил на другом устройстве: после
   входа в кабинет разборы открываются и здесь. note={null} оставляет одни
   действия, когда фразу о стене уже сказал сам пункт; flat убирает рамку
   внутри карточки, у которой своя рамка (тренажёр, «Перед почтой»). */
export function GuideWall({ place, note = GUIDE_WALL_NOTE, flat = false }: { place: WallPlace; note?: string | null; flat?: boolean }) {
  const wall = useWallPurchase(place, !paidDeviceNow());
  return <div className={`${styles.wall} ${flat ? styles.flat : ""}`} data-guide-wall={place}>
    {note && <p className={styles.note} data-guide-locked-note>{note}</p>}
    <div className={styles.actions}>
      <button type="button" className={styles.buy} data-wall-buy data-wall-place={place} aria-haspopup="dialog" onClick={wall.open}>{wall.label}</button>
      <a className={styles.link} href="/prices#main-package">Что входит и возврат 7 дней</a>
      <a className={styles.link} href="/portal?view=login" data-guide-wall-login>Уже оплачено — войти</a>
    </div>
    {wall.modal}
  </div>;
}
