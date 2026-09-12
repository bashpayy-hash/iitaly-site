import type { IllustrationAsset } from "@/data/illustrations";

/**
 * Растровая иллюстрация с арт-дирекцией: под узкий экран отдаётся не
 * уменьшенный десктопный кадр, а свой, отдельно скадрированный файл.
 * Поэтому здесь <picture> с media-условиями, а не next/image: тот умеет
 * подбирать размер, но не умеет менять кадр по брейкпоинту, а проект в
 * статическом экспорте всё равно не оптимизирует изображения на сервере.
 *
 * Порядок источников важен: браузер берёт первый подходящий <source>,
 * поэтому кадры с media идут раньше безусловных, а AVIF — раньше WebP.
 * В <img> (последний фолбэк) стоит WebP: его понимают все живые браузеры,
 * а PNG-исходник на 2 МБ в бандл тащить незачем.
 *
 * width/height проставлены всегда — без них блок дёргается при загрузке.
 */
export function Illustration({
  asset,
  className = "",
  priority = false,
  /** ниже этой ширины отдаём мобильный кадр */
  breakpoint = 640,
}: {
  asset: IllustrationAsset;
  className?: string;
  priority?: boolean;
  breakpoint?: number;
}) {
  const { desktop, mobile, alt } = asset;
  const narrow = `(max-width: ${breakpoint - 1}px)`;

  return (
    <picture>
      {mobile && (
        <>
          <source media={narrow} type="image/avif" srcSet={`${mobile.base}.avif`} />
          <source media={narrow} type="image/webp" srcSet={`${mobile.base}.webp`} />
        </>
      )}
      <source type="image/avif" srcSet={`${desktop.base}.avif`} />
      <source type="image/webp" srcSet={`${desktop.base}.webp`} />
      <img
        src={`${desktop.base}.webp`}
        alt={alt}
        width={desktop.width}
        height={desktop.height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        className={`block h-auto w-full ${className}`}
        {...(alt === "" ? { "aria-hidden": true } : {})}
      />
    </picture>
  );
}
