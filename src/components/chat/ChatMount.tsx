"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { isLabelledLauncher, LAUNCHER_ANCHOR, LAUNCHER_FACE, LAUNCHER_TITLE, launcherLabel } from "./launcherFace";
import placement from "./chat-placement.module.css";

const CONTEXT_EVENTS = ["iitaly:portal-context", "iitaly:guide-context"];

type Pending = { context: Map<string, unknown>; open: unknown; refocus: boolean };
const emptyPending = (): Pending => ({ context: new Map(), open: undefined, refocus: false });

/**
 * Чат грузится после страницы, а не вместе с ней (owner, 11–12 Nov:
 * «максимально оптимизируй сайт»; «да, сделай» на предложение отложить
 * загрузку чата и библиотеки анимаций).
 *
 * ChatWidget стоял в корневом layout и поэтому попадал в первые скрипты
 * каждой страницы: 15 КБ своего кода и 36 КБ библиотеки motion, которую
 * вне чата использует одна страница «Изменения 2026/27» (замер по сборке,
 * brotli). Это пятая часть скриптов страницы, а открывает чат меньшинство.
 *
 * Что остаётся как было:
 * - Кнопка чата есть в HTML с первого кадра («кнопка просто есть, без
 *   приветственного поп-ина» — см. ChatLauncher). Пока код чата не пришёл,
 *   это обычная <button> с теми же классами (launcherFace.ts); потом React
 *   заменяет её настоящей в одном кадре.
 * - Код чата запрашивается после события load, когда браузер свободен, либо
 *   сразу, если человек навёл, сфокусировал или нажал кнопку или страница
 *   попросила открыть чат («Задать вопрос» в шапке, помощник в кабинете).
 * - Ничего не теряется по дороге. Страницы сообщают чату контекст событиями
 *   (шаг кабинета, тема гайда) в момент своего появления, то есть раньше,
 *   чем чат загрузится. Здесь запоминается последнее событие каждого вида и
 *   последняя просьба открыть чат; как только ChatWidget повесил свои
 *   обработчики, они отправляются заново в том же порядке.
 *
 * Нажатие на кнопку-заглушку повторяется как iitaly:open-chat с source
 * "fab" — это ровно то, что делает openChat в ChatWidget, включая аналитику.
 */
export function ChatMount() {
  const pathname = usePathname();
  const [Widget, setWidget] = useState<ComponentType | null>(null);
  const pending = useRef<Pending>(emptyPending());
  const request = useRef<() => void>(() => {});
  const stopBuffering = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false, started = false, idle = 0, timer = 0;
    const start = () => {
      if (started) return;
      started = true;
      import("./ChatWidget").then(module => {
        if (cancelled) return;
        pending.current.refocus = document.activeElement?.id === "chat-launcher";
        setWidget(() => module.ChatWidget);
      }).catch(() => { started = false; }); // сеть моргнула — следующая просьба попробует снова
    };
    request.current = start;

    const onContext = (event: Event) => { pending.current.context.set(event.type, (event as CustomEvent).detail); };
    const onOpen = (event: Event) => { pending.current.open = (event as CustomEvent).detail ?? {}; start(); };
    for (const type of CONTEXT_EVENTS) window.addEventListener(type, onContext);
    window.addEventListener("iitaly:open-chat", onOpen);
    stopBuffering.current = () => {
      for (const type of CONTEXT_EVENTS) window.removeEventListener(type, onContext);
      window.removeEventListener("iitaly:open-chat", onOpen);
    };

    const whenFree = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(start, { timeout: 3000 });
      else timer = window.setTimeout(start, 1200); // Safari до 16.4
    };
    if (document.readyState === "complete") whenFree();
    else window.addEventListener("load", whenFree, { once: true });

    return () => {
      cancelled = true;
      stopBuffering.current();
      window.removeEventListener("load", whenFree);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);

  // Эффекты ребёнка выполняются раньше эффектов родителя: к этому моменту
  // ChatWidget уже слушает свои события, и отложенное можно отдать ему.
  useEffect(() => {
    if (!Widget) return;
    stopBuffering.current();
    const { context, open, refocus } = pending.current;
    pending.current = emptyPending();
    for (const [type, detail] of context) window.dispatchEvent(new CustomEvent(type, { detail }));
    if (refocus) document.getElementById("chat-launcher")?.focus({ preventScroll: true });
    if (open !== undefined) window.dispatchEvent(new CustomEvent("iitaly:open-chat", { detail: open }));
  }, [Widget]);

  if (Widget) return <Widget />;
  // В кабинете плавающей кнопки нет: помощник открывается из его шапки.
  if (pathname === "/portal") return null;

  const labelled = isLabelledLauncher(pathname);
  const position = labelled ? LAUNCHER_ANCHOR.replace("size-12", placement.labelledLauncher) : LAUNCHER_ANCHOR;
  return (
    <button
      id="chat-launcher"
      data-launcher-labelled={labelled || undefined}
      data-vespi-launcher-mode="icon"
      type="button"
      onClick={() => { pending.current.open = { source: "fab" }; request.current(); }}
      onPointerEnter={() => request.current()}
      onFocus={() => request.current()}
      aria-label={launcherLabel(labelled)}
      aria-haspopup="dialog"
      aria-expanded={false}
      title={LAUNCHER_TITLE}
      className={`${position} ${placement.aboveBadge} ${LAUNCHER_FACE}`}
    >
      <MessageCircle size={22} strokeWidth={1.8} aria-hidden="true" />
      {labelled && <span className={placement.launcherLabel}>Спросить Веспи</span>}
    </button>
  );
}
