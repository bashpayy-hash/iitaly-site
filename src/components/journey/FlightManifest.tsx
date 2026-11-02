"use client";

import { useEffect, useState } from "react";
import type { CityId } from "@/data/italy";
import { cityLatin, flightCoordinates } from "./flightCoordinates";
import styles from "./flight-cabin.module.css";

const clock = (timeZone: string) => new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone });

/* Бортовой манифест в левом верхнем углу, как у mikes.cv: имя, маршрут,
   координаты точки назначения и местное время обоих концов. Время считается
   в браузере; до гидрации вместо цифр стоят прочерки. */
export function FlightManifest({ passenger, origin = "Казахстан", destination, city, className = "" }: { passenger: string; origin?: string; destination: string; city?: CityId | null; className?: string }) {
  const [times, setTimes] = useState<[string, string] | null>(null);
  useEffect(() => {
    const home = clock("Asia/Almaty"), away = clock("Europe/Rome");
    const tick = () => { const now = new Date(); setTimes([home.format(now), away.format(now)]); };
    const first = window.setTimeout(tick, 0), timer = window.setInterval(tick, 30000);
    return () => { window.clearTimeout(first); window.clearInterval(timer); };
  }, []);
  const coordinates = flightCoordinates(city);
  return <div className={`${styles.manifest} ${className}`} data-flight-manifest>
    <p className={styles.passenger}>{passenger}</p>
    <p>{origin} <span aria-hidden="true">→</span> {destination}</p>
    <p data-flight-coordinates>{coordinates.label}</p>
    <p data-flight-clocks><span>Almaty {times?.[0] || "––:––"}</span> <span aria-hidden="true">·</span> <span>{city ? cityLatin(city) : "Roma"} {times?.[1] || "––:––"}</span></p>
  </div>;
}
