import type { CSSProperties } from "react";
import { Illustration } from "./Illustration";
import type { IllustrationAsset } from "@/data/illustrations";

/**
 * Иллюстрация как фоновый слой секции.
 *
 * Приём, который не работает в виде вклейки, но работает здесь:
 * mix-blend-multiply. На полной непрозрачности умножение даёт заплатку
 * темнее и желтее бумаги — у каждого кадра свой кремовый фон, и он
 * перекрашивает всё под собой. На 12–17% умножение на почти-белое — почти
 * ничего: фон кадра исчезает, остаётся только штрих, лежащий прямо на
 * нашей бумаге. Поэтому в этот слой годится только штриховая графика на
 * светлом; тёмный кадр дал бы на кремовой базе грязное пятно.
 *
 * Две маски, пересечением:
 *   по горизонтали — кадр проявляется у своего края и полностью
 *     растворяется к колонке с текстом, поэтому текст всегда лежит на
 *     чистой бумаге, а не «поверх картинки»;
 *   по вертикали — растворяется у верхнего и нижнего краёв, чтобы слой не
 *     обрывался прямой линией по границе секции.
 * mask-composite: intersect — стандартный синтаксис, -webkit-mask-composite
 * source-in — старый для Safari. Там, где composite не поддержан, слои
 * складываются: маска слабее, но это по-прежнему растворение, а не обрыв.
 *
 * Слой декоративный целиком: aria-hidden на обёртке, alt у кадра пустой.
 * Текста и кнопок внутри растра нет и быть не может — они остаются HTML.
 */

function maskFor(side: "right" | "left"): CSSProperties {
  const horizontal =
    side === "right"
      ? "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 36%, #000 78%)"
      : "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.2) 36%, #000 78%)";
  const vertical = "linear-gradient(to bottom, transparent 0%, #000 24%, #000 74%, transparent 100%)";
  const mask = `${horizontal}, ${vertical}`;
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}

export function IllustrationBackdrop({
  asset,
  side = "right",
  /** классы размера и положения слоя: ширина, привязка к краю, прозрачность */
  className = "",
  priority = false,
}: {
  asset: IllustrationAsset;
  side?: "right" | "left";
  className?: string;
  priority?: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={`absolute mix-blend-multiply ${className}`} style={maskFor(side)}>
        <Illustration asset={asset} priority={priority} />
      </div>
    </div>
  );
}
