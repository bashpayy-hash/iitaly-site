import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/home/Hero";
import { Funnel } from "@/components/home/Funnel";
import { BandDuomo } from "@/components/home/BandDuomo";
import { DsuCard } from "@/components/home/DsuCard";
import { BandNight } from "@/components/home/BandNight";
import { TrustFAQ } from "@/components/home/TrustFAQ";
import { PriceBand } from "@/components/home/PriceBand";

/**
 * Ритм главной: свет → тьма → свет → свет → тьма → свет → свет.
 *
 * Небо первого экрана заканчивается обсидианом, и воронка подхватывает
 * ровно этот цвет — шва между ними нет. Дальше две иллюстративные полосы
 * (дневной Дуомо и ночная Мадоннина) разнесены по странице: рядом они
 * читались бы как галерея, а порознь держат её как два кадра одного
 * фильма.
 *
 * Тёмных секций две, и это потолок. Третья (отдельная полоса под кабинет
 * после визы) убрана — её содержание ушло в ночную полосу, иначе низ
 * страницы превращался в сплошной провал.
 */
export default function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <Hero />
        <Funnel />
        <BandDuomo />
        <DsuCard />
        <BandNight />
        <TrustFAQ />
        <PriceBand />
      </main>
      <Footer />
    </>
  );
}
