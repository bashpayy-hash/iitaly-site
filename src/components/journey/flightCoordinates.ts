import type { CityId } from "@/data/italy";

/* Координаты центров городов каталога (WGS84, градусы) для приборной строки
   Flight Plan. Декор маршрута, не фактура поступления: ни один расчёт сайта
   на них не опирается. Без выбранного вуза — общая точка «Италия». */
const CITY_COORDINATES: Record<CityId, readonly [number, number, string]> = {
  torino: [45.0703, 7.6869, "Torino"],
  pavia: [45.1847, 9.1582, "Pavia"],
  milano: [45.4642, 9.19, "Milano"],
  bergamo: [45.6983, 9.6773, "Bergamo"],
  brescia: [45.5416, 10.2118, "Brescia"],
  trento: [46.0748, 11.1217, "Trento"],
  verona: [45.4384, 10.9916, "Verona"],
  padova: [45.4064, 11.8768, "Padova"],
  venezia: [45.4408, 12.3155, "Venezia"],
  udine: [46.0711, 13.2346, "Udine"],
  trieste: [45.6495, 13.7768, "Trieste"],
  genova: [44.4056, 8.9463, "Genova"],
  parma: [44.8015, 10.3279, "Parma"],
  modena: [44.6471, 10.9252, "Modena"],
  ferrara: [44.8381, 11.6198, "Ferrara"],
  bologna: [44.4949, 11.3426, "Bologna"],
  pisa: [43.7228, 10.4017, "Pisa"],
  firenze: [43.7696, 11.2558, "Firenze"],
  siena: [43.3188, 11.3308, "Siena"],
  perugia: [43.1107, 12.3908, "Perugia"],
  camerino: [43.1355, 13.0683, "Camerino"],
  ancona: [43.6158, 13.5189, "Ancona"],
  roma: [41.9028, 12.4964, "Roma"],
  napoli: [40.8518, 14.2681, "Napoli"],
  salerno: [40.6824, 14.7681, "Salerno"],
  bari: [41.1171, 16.8719, "Bari"],
  cagliari: [39.2238, 9.1217, "Cagliari"],
  palermo: [38.1157, 13.3615, "Palermo"],
  messina: [38.1938, 15.554, "Messina"],
  catania: [37.5079, 15.083, "Catania"],
};
const ITALY = [41.8719, 12.5674, "Italia"] as const;

const degrees = (value: number, positive: string, negative: string) => `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;

/** «44.4949° N, 11.3426° E» и латинское имя точки назначения. */
export function flightCoordinates(city?: CityId | null) {
  const [lat, lon, name] = city ? CITY_COORDINATES[city] : ITALY;
  return { label: `${degrees(lat, "N", "S")}, ${degrees(lon, "E", "W")}`, place: name.toUpperCase() };
}

/** Латинское имя города для технических подписей: «PADOVA». */
export const cityLatin = (city: CityId) => CITY_COORDINATES[city][2].toUpperCase();
