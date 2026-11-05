/* Scrolling for a change the person just asked for — the next question, an
   opened step, a chosen city, a found error. Owner, 5 Nov («на телефоне тебя
   перебрасывает слишком резко»): the page glides to the new place instead of
   being thrown there; prefers-reduced-motion keeps the instant jump. A view
   that swaps before paint (the cabinet sections) still resets to the top
   instantly — that is a cut, not a throw — and gets its arrival from
   useViewEntrance. */
export function scrollBehavior(): ScrollBehavior {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function revealElement(element: Element | null | undefined, block: ScrollLogicalPosition = "start") {
  element?.scrollIntoView({ block, behavior: scrollBehavior() });
}
