/* A dialog leaves instead of vanishing.

   Both dialog shells stop rendering the moment they close, so the panel and
   its backdrop disappeared in one frame (motion audit, 23 Nov). Keeping the
   real dialog mounted while it fades would delay everything that waits for
   it to be gone: focus returning to the button that opened it, the page
   scrolling again, the next dialog. So the dialog still closes at once, and
   what fades is a picture of it: a copy of its markup, left for 160ms in the
   place the dialog stood (so it keeps the colours of that part of the page),
   that nothing can focus, click or read. */
const LEAVE_MS = 160;
// What would let the copy be found, named or focused as if it were the dialog.
const IDENTITY = new Set(["id", "role", "for", "name", "tabindex", "aria-label", "aria-labelledby", "aria-describedby", "aria-live", "aria-modal", "aria-controls"]);

/** `host` is the element the dialog was rendered in, read while it was open. */
export function leaveBehind(node: HTMLElement | null, host: Element | null, scrollTop = 0) {
  if (!node || !host?.isConnected || typeof node.animate !== "function") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ghost = node.cloneNode(true) as HTMLElement;
  for (const element of [ghost, ...ghost.querySelectorAll<HTMLElement>("*")]) {
    for (const { name } of [...element.attributes]) {
      if (IDENTITY.has(name) || name.startsWith("data-")) element.removeAttribute(name);
    }
    // The copy does not replay the entrance it was cloned with.
    if (element.style) element.style.animation = "none";
  }
  ghost.setAttribute("aria-hidden", "true");
  ghost.setAttribute("inert", "");
  ghost.style.pointerEvents = "none";
  host.appendChild(ghost);
  const panel = ghost.firstElementChild;
  if (panel && scrollTop) panel.scrollTop = scrollTop;
  const done = () => ghost.remove();
  const fade = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LEAVE_MS, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" });
  fade.finished.then(done, done);
}
