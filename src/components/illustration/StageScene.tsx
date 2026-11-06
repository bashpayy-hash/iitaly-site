/* eslint-disable @next/next/no-img-element -- Local pre-sized WebP renders for the static export. */
import styles from "./stage-scene.module.css";

/* Сцена с Веспи (owner, 6 Nov: «добавь иллюстрации, где Веспи что-то
   делает, с анимациями — это добавляет сайту relatability»). Фото-сцены из
   design/illustrations/scenes-2026-11-04.json: Веспи выбирает программы,
   держит диплом, ставит штамп, запечатывает конверт, копит монеты, ждёт с
   паспортом, держит ключи, пишет в блокноте. Кадр медленно «дышит»: камера
   на 20 секунд плывёт к Веспи и обратно, по стеклу проходит тёплый блик —
   только transform и opacity, без пересчёта макета; при reduced motion
   кадр стоит. Картинка декоративная (alt=""): смысл несёт текст рядом. */
export type StageSceneName = "choose" | "diploma" | "stamp" | "envelope" | "coins" | "passport" | "keys" | "notebook";

export function StageScene({ name, className, priority = false }: { name: StageSceneName; className?: string; priority?: boolean }) {
  return <figure className={`${styles.scene}${className ? ` ${className}` : ""}`} data-stage-scene={name} aria-hidden="true">
    <img className={styles.photo} src={`/illustrations/scenes/${name}-1024.webp`} srcSet={`/illustrations/scenes/${name}-640.webp 640w, /illustrations/scenes/${name}-1024.webp 1024w, /illustrations/scenes/${name}-1600.webp 1600w`}
      sizes="(max-width: 700px) 100vw, 720px" width={1024} height={688} alt="" decoding="async" loading={priority ? "eager" : "lazy"} draggable={false} />
    <span className={styles.light} />
  </figure>;
}
