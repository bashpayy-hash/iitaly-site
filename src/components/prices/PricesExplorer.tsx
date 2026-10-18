"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { BuyModal,type BuyProduct } from "./BuyModal";
import { GalleryTitle,Hexagon } from "@/components/gallery/GalleryPrimitives";
import { FEATURES,PRICE_EXPRESS_CHECK,PRICE_MAIN,priceLabel } from "@/data/pricing";
import { STRIPE_ENABLED } from "@/lib/paymentMode";
import { track } from "@/lib/track";
export function PricesExplorer(){
 const [buy,setBuy]=useState<BuyProduct|null>(null);
 useEffect(()=>{track("pricing_viewed");},[]);
 function openBuy(name:string,price:number){setBuy({name,price});track("buy_open",{product:name});track("checkout_started",{product:name});}
 return <><header className="gallery-page-header" data-section="prices-header"><p className="gallery-eyebrow">Доступ к iItaly</p><GalleryTitle as="h1">Понятная цена.<br/><em>Никакой подписки.</em></GalleryTitle><p>Сначала составь бесплатный план. Подключи кабинет, когда будешь готов вести поступление и проверять документы.</p><Link href="/plan" className="gallery-link">Начать с бесплатной анкеты ↗</Link></header>
 <section id="main-package" className="gallery-pricing-package" data-gallery-room="ink"><div><GalleryTitle>Весь цикл<br/><em>поступления.</em></GalleryTitle><div className="gallery-stats"><span>ТАРИФ: {priceLabel(PRICE_MAIN)}</span><span>ОДИН ПЛАТЁЖ</span></div><p className="gallery-pricing-term">От выбора программы до первых документов в Италии. Без ограничения по времени и доплат за этапы.</p></div><div><ul className="gallery-feature-list">{FEATURES.map(f=><li key={f}><Hexagon/>{f}</li>)}</ul><button className="gallery-button" onClick={()=>openBuy("Поступление под ключ",PRICE_MAIN)} data-fab-yield><span>Оформить доступ · {priceLabel(PRICE_MAIN)}</span></button><p className="gallery-small">{STRIPE_ENABLED?"Оплата через Stripe. Код доступа появится на странице подтверждения после успешной оплаты.":"Кабинет активируется после подтверждения оплаты."}</p></div></section>
 <section id="terms-and-refund" className="gallery-price-terms"><GalleryTitle>Условия<br/><em>без мелкого шрифта.</em></GalleryTitle><div><details open><summary>Возврат</summary><p>В течение 7 календарных дней с оплаты вернём деньги полностью, если ты ещё не использовал платные функции кабинета: не загружал документы на проверку и не отмечал шаги маршрута выполненными.</p></details><details><summary>Кто принимает решения</summary><p>Поступление, визу и стипендию одобряют университет, консульство и региональный орган. Кабинет помогает подготовиться; он не гарантирует положительное решение.</p></details><details><summary>Если вуз отказал</summary><p>Доступ к кабинету сохраняется. Можно пересмотреть список программ и подготовить маршрут для следующего набора.</p></details><details><summary>Границы цифрового сервиса</summary><p>Система помогает с подбором, сроками, чек-листами, черновиками и проверкой файлов. Документы подаёшь ты. Нестандартные случаи требуют сверки с вузом или консульством.</p></details></div></section>
 <section id="expert-review" className="gallery-expert-review"><div><h2>Если нужен взгляд эксперта</h2><p>Дополнительная услуга по желанию: один документ, ответ человека в течение 24 часов.</p></div><button className="gallery-link" onClick={()=>openBuy("Срочная проверка · 1 документ",PRICE_EXPRESS_CHECK)}>Заказать · {priceLabel(PRICE_EXPRESS_CHECK)} ↗</button></section>
 <BuyModal product={buy} onClose={()=>setBuy(null)}/></>;
}
