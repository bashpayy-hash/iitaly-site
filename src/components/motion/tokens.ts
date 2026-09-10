/**
 * Числовые зеркала CSS motion-токенов из globals.css — Motion/react
 * принимает transition.duration в секундах, а не CSS var(), поэтому
 * значения здесь и там держим синхронно вручную (--duration-fast: 160ms
 * ↔ FAST: 0.16 и т.д.). Меняешь один — проверь другой.
 */
export const DURATION = {
  fast: 0.16,
  normal: 0.32,
  slow: 0.56,
  reveal: 0.75,
  narrative: 1.3,
} as const;

export const EASE = {
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  reveal: [0.22, 1, 0.36, 1] as [number, number, number, number],
};
