import { CITY_ICONS, type CityId } from "@/data/italy";

/** Маленький значок города — тот же рисунок, что на карте и в карточке
 * города. Только украшение: название города всегда стоит рядом текстом. */
export function CityGlyph({ city, className }: { city: CityId; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 22 22"
      fill="currentColor"
      className={className}
      data-city-glyph={city}
      dangerouslySetInnerHTML={{ __html: CITY_ICONS[city] }}
    />
  );
}
