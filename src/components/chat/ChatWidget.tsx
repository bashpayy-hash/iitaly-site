"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BACKEND_URL } from "@/lib/backend";
import {
  askedCount,
  bumpAsked,
  FREE_LIMIT,
  leadCaptured,
  markLeadCaptured,
  sendChatMessage,
  type ChatMessage,
} from "@/lib/chat";
import { demoReply } from "@/data/chatDemo";
import { track } from "@/lib/track";
import { isValidPhone, submitLead } from "@/lib/lead";
import { useDraggableHeader } from "@/lib/useDraggableHeader";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { ChatLauncher } from "./ChatLauncher";
import { useReducedMotion } from "@/components/motion/MotionProvider";
import { VESPI_NAME } from "@/components/mascot/Vespi";
import { GUIDE_HELP, isGuideId, type GuideId } from "@/components/guides/guideJourney";
import placement from "./chat-placement.module.css";

interface Msg {
  who: "user" | "ai";
  text: string;
}

interface PortalChatContext {
  portal?: boolean;
  taskId?: string;
  taskTitle?: string;
  taskOwner?: string;
  taskContext?: string;
  guideId?: GuideId;
}

function visibleGuideContext(): PortalChatContext {
  if (window.location.pathname !== "/guides") return {};
  const id = document.querySelector("[data-guide-current]")?.getAttribute("data-guide-current");
  return isGuideId(id) ? { guideId: id } : {};
}

/**
 * Вход панели — пружиной из угла, где стоял лаунчер (origin bottom right):
 * панель растёт из точки, по которой щёлкнули, поэтому причина и следствие
 * связаны. Выход — короткий tween без пружины: решение закрыть уже
 * принято, перелёт на выходе читается задержкой, а не характером.
 */
const PANEL_SPRING = {
  type: "spring",
  stiffness: 340,
  damping: 30,
  mass: 0.9,
} as const;
const PANEL_EXIT = { duration: 0.14, ease: [0.4, 0, 0.2, 1] } as const;

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4">
      <path
        d="M3.5 3.5l9 9m0-9l-9 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4">
      <path
        d="M8 13.5V3m0 0L3.5 7.5M8 3l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ChatWidget() {
  const pathname = usePathname();
  const portalMode = pathname === "/portal";
  const guidesMode = pathname === "/guides";
  const calmMode = portalMode || guidesMode;
  const stepContext = useRef<PortalChatContext>({});
  const [displayContext, setDisplayContext] = useState<PortalChatContext>({});
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      who: "ai",
      text: `Ciao! Я ${VESPI_NAME}, ИИ-консультант IITALY. Спроси про аттестат, документы, визу D или стипендию DSU.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const hasConversation = messages.some(message => message.who === "user");
  const guide = displayContext.guideId ? GUIDE_HELP[displayContext.guideId] : null;
  const questions = guidesMode
    ? guide ? [guide.question, "Что уточнить в моём случае?"] : ["С чего начать поступление?", "Как найти нужную тему в справочнике?"]
    : displayContext.taskId === "shortlist"
    ? ["Как выбрать программы?", "Что сравнить у программ?"]
    : displayContext.taskId
      ? /родител/i.test(displayContext.taskOwner || "")
        ? ["Что попросить у родителей?", "Что подготовить вместе?"]
        : ["С чего начать этот шаг?", "Что нужно подготовить?"]
      : ["С чего начать поступление?", "Как пользоваться маршрутом?"];
  const portalHint = displayContext.taskId === "shortlist"
    ? "Помогу разобраться, что сравнить при выборе программ."
    : displayContext.taskId
      ? /родител/i.test(displayContext.taskOwner || "")
        ? "Разберём, что подготовить вместе с родителями."
        : "Разберём, с чего начать и что подготовить для этого шага."
      : "Открой шаг, чтобы обсудить его детали. Или спроси про поступление здесь.";
  const helperHint = guidesMode ? "Выбери вопрос или напиши свой. Отправлю его только по твоему нажатию." : portalHint;

  useDraggableHeader(panelRef, headRef, open);

  // Keeps the mount-only event listener below calling the current render's
  // `send` (which closes over up-to-date `input`/`busy` state) instead of
  // freezing on whatever `send` looked like when the listener was attached.
  const sendRef = useRef<(overrideText?: string) => void>(() => {});

  function rememberTrigger() {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || panelRef.current?.contains(active)) return;
    triggerRef.current = active;
    menuTriggerRef.current = active.closest("details")?.querySelector("summary") ?? null;
  }

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(frame);
      requestAnimationFrame(() => {
        const initiator = triggerRef.current;
        const menuTrigger = menuTriggerRef.current;
        const visible = (element: HTMLElement | null): element is HTMLElement => {
          if (!element?.isConnected || !element.getClientRects().length || element.closest('[aria-hidden="true"]')) return false;
          const closedMenu = element.closest("details:not([open])");
          return !closedMenu || Boolean(closedMenu.querySelector("summary")?.contains(element));
        };
        const target = visible(initiator) ? initiator : visible(menuTrigger) ? menuTrigger : document.getElementById("chat-launcher");
        if (target instanceof HTMLElement && visible(target)) target.focus({ preventScroll: true });
      });
    };
  }, [open]);

  useEffect(() => {
    function onOpenRequest(e: Event) {
      const detail = (e as CustomEvent<{ prefill?: string; source?: string; taskId?: string; taskTitle?: string; taskOwner?: string; taskContext?: string; guideId?: string }>)
        .detail;
      const nextContext: PortalChatContext = detail?.source === "portal-header" ? {
        portal: true, taskId: detail.taskId, taskTitle: detail.taskTitle, taskOwner: detail.taskOwner, taskContext: detail.taskContext,
      } : detail?.source === "guides"
        ? isGuideId(detail.guideId) ? { guideId: detail.guideId } : {}
        : visibleGuideContext();
      stepContext.current = nextContext;
      setDisplayContext(nextContext);
      rememberTrigger();
      setOpen(true);
      track("chat_open");
      track("ai_assistant_opened", { source: detail?.source ?? "portal" });
      if (detail?.prefill && (nextContext.portal || detail.source === "guides")) {
        setInput(current => current.trim() ? current : detail.prefill || "");
      } else if (detail?.prefill) {
        setTimeout(() => sendRef.current(detail.prefill), 50);
      }
    }
    function onPortalContext(event: Event) {
      const nextContext = (event as CustomEvent<PortalChatContext>).detail || {};
      stepContext.current = nextContext;
      setDisplayContext(nextContext);
    }
    function onGuideContext(event: Event) {
      const id = (event as CustomEvent<{ guideId?: string }>).detail?.guideId;
      if (!isGuideId(id) && !stepContext.current.guideId) return;
      const nextContext = isGuideId(id) ? { guideId: id } : {};
      stepContext.current = nextContext;
      setDisplayContext(nextContext);
    }
    window.addEventListener("iitaly:open-chat", onOpenRequest);
    window.addEventListener("iitaly:portal-context", onPortalContext);
    window.addEventListener("iitaly:guide-context", onGuideContext);
    return () => {
      window.removeEventListener("iitaly:open-chat", onOpenRequest);
      window.removeEventListener("iitaly:portal-context", onPortalContext);
      window.removeEventListener("iitaly:guide-context", onGuideContext);
    };
  }, []);

  function scrollDown() {
    requestAnimationFrame(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }

  function openChat() {
    const context = visibleGuideContext();
    stepContext.current = context;
    setDisplayContext(context);
    rememberTrigger();
    setOpen(true);
    track("chat_open");
    track("ai_assistant_opened", { source: "fab" });
  }

  function prepareQuestion(question: string) {
    // Suggestions help compose a question; only Send can spend a chat request.
    // A draft belongs to the user and is never replaced by a suggestion.
    setInput(current => current.trim() ? current : question);
    inputRef.current?.focus({ preventScroll: true });
  }

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || busy) return;

    if (askedCount() >= FREE_LIMIT && !leadCaptured()) {
      setInput("");
      setShowLead(true);
      track("chat_limit_reached");
      return;
    }

    setInput("");
    setMessages((m) => [...m, { who: "user", text }]);
    track("chat_message_sent", { n: askedCount() + 1 });
    setBusy(true);
    setTyping(true);
    scrollDown();

    if (!BACKEND_URL) {
      setTimeout(
        () => {
          bumpAsked();
          setTyping(false);
          setBusy(false);
          setMessages((m) => [...m, { who: "ai", text: demoReply(text) }]);
          scrollDown();
        },
        900 + Math.random() * 600,
      );
      return;
    }

    const context = stepContext.current;
    const scopedText = context.taskId
      ? `[Открытый шаг IITALY: ${context.taskId}; название: ${context.taskTitle || ""}; кто делает: ${context.taskOwner || "Ты"}. ${context.taskContext || ""}]\n${text}`
      : context.portal ? `[Личный кабинет IITALY: шаг сейчас не открыт.]\n${text}`
      : context.guideId ? `[Открытая тема справочника IITALY: ${context.guideId}; название: ${GUIDE_HELP[context.guideId].title}. Чтение темы не подтверждает образование, выбранную программу или требования к документу пользователя.]\n${text}` : text;
    const nextHistory: ChatMessage[] = [
      ...historyRef.current,
      { role: "user", content: scopedText },
    ];
    try {
      const reply = await sendChatMessage(nextHistory);
      historyRef.current = [
        ...nextHistory,
        { role: "assistant", content: reply },
      ];
      bumpAsked();
      setMessages((m) => [...m, { who: "ai", text: reply }]);
      const left = FREE_LIMIT - askedCount();
      if (!leadCaptured() && left > 0 && left <= 3) {
        setMessages((m) => [
          ...m,
          {
            who: "ai",
            text:
              left === 1
                ? "Остался один бесплатный вопрос. Дальше оставь номер — свяжемся по твоему поступлению. Напоминания о дедлайнах подключаются отдельно в Telegram из кабинета."
                : `Бесплатных вопросов осталось: ${left}`,
          },
        ]);
      }
    } catch {
      setInput((current) => current.trim() ? current : text);
      setMessages((m) => [
        ...m,
        {
          who: "ai",
          text: "Не удалось получить ответ. Вопрос не списан — попробуй отправить его ещё раз.",
        },
      ]);
    } finally {
      setTyping(false);
      setBusy(false);
      scrollDown();
    }
  }
  useEffect(() => {
    sendRef.current = send;
  });

  return (
    <>
      {/* Лаунчер смонтирован всегда: при открытии панели он уезжает за
         край той же пружиной, которой уступает место кнопкам. Иначе
         пришлось бы гонять его через AnimatePresence, а он рендерит
         фрагмент (якорь + кнопка) — у фрагмента нет узла, за выход
         которого AnimatePresence могла бы отвечать. */}
      {!portalMode && <ChatLauncher hidden={open} onOpen={openChat} />}

      <AnimatePresence>
        {open && (
          <motion.div
            id="iitaly-chat"
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="ИИ-консультант"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
              }
            }}
            className={`fixed right-4 ${placement.aboveBadge} ${placement.panel} ${calmMode ? `${portalMode ? "bottom-[calc(68px+env(safe-area-inset-bottom,0px))] min-[901px]:bottom-4" : "bottom-[max(1rem,env(safe-area-inset-bottom,0px))]"} rounded-[24px] border border-[#e7e4df] bg-white font-[family-name:var(--font-apple-text)] text-[#141413] shadow-[0_12px_36px_rgba(33, 29, 23,0.12)]` : "bottom-[max(1rem,env(safe-area-inset-bottom,0px))] rounded-xl border-2 border-ink bg-paper shadow-float"} z-[90] flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4, transition: reducedMotion ? { duration: 0 } : PANEL_EXIT }}
            transition={reducedMotion ? { duration: 0 } : PANEL_SPRING}
          >
            <div
              ref={headRef}
              className={`flex shrink-0 cursor-grab touch-none items-center gap-2 px-4 py-3 select-none active:cursor-grabbing ${calmMode ? "border-b border-[#e7e4df] bg-white text-[#141413]" : "border-b-2 border-ink bg-ink text-cream"}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                <MessageCircle size={22} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block text-[14px] leading-tight">{VESPI_NAME}</b>
                <span className={`block mt-1 text-[13px] leading-tight ${calmMode ? "text-[#6c6862]" : "text-cream/75"}`}>ИИ-помощник · правила 2026/27</span>
              </div>
              {portalMode ? (
              <a
                href="#main"
                aria-label="Закрыть чат"
                onClick={event => { event.preventDefault(); setOpen(false); }}
                className="chp-close ml-auto -mr-2 flex size-11 shrink-0 items-center justify-center rounded-pill text-[#6c6862] hover:text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413]"
              >
                <CloseIcon />
              </a>
              ) : (
              <button
                type="button"
                aria-label="Закрыть чат"
                onClick={() => setOpen(false)}
                className={`chp-close ml-auto -mr-2 flex size-11 items-center justify-center rounded-pill transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 ${guidesMode ? "text-[#6c6862] hover:text-[#141413] focus-visible:outline-[#141413]" : "text-cream/70 hover:text-cream focus-visible:outline-cream"}`}
              >
                <CloseIcon />
              </button>
              )}
            </div>

            {calmMode && (
              <div
                data-chat-step-context={displayContext.taskId || ""}
                data-chat-guide-context={displayContext.guideId || ""}
                aria-live="polite"
                className="shrink-0 border-b border-[#e7e4df] bg-[#faf8f5] px-4 py-3"
              >
                <p className="text-[13px] leading-5 text-[#6c6862]">
                  {guidesMode ? "Тема справочника" : displayContext.taskId ? "Открыт шаг" : "Помощь по кабинету"}
                </p>
                {displayContext.taskId && displayContext.taskTitle && (
                  <p className="mt-1 text-sm leading-5 font-semibold [overflow-wrap:anywhere]">{displayContext.taskTitle}</p>
                )}
                {guidesMode && guide && <p className="mt-1 text-sm leading-5 font-semibold">{guide.title}</p>}
              </div>
            )}

            <div
              ref={logRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {calmMode && !hasConversation && !showLead && (
                <div className="text-sm leading-6">
                  <p>{helperHint}</p>
                  <div className="mt-3 flex flex-col items-start">
                    {questions.map(question => (
                      <a
                        key={question}
                        href="#chat-input"
                        onClick={event => { event.preventDefault(); prepareQuestion(question); }}
                        className="flex min-h-11 items-center py-2 text-[#141413] underline decoration-[#bebab4] underline-offset-4 hover:decoration-current focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#141413]"
                      >
                        {question}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {(calmMode ? messages.slice(1) : messages).map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                    calmMode
                      ? m.who === "user" ? "ml-auto bg-[#f5f1eb] text-[#141413]" : "bg-[#faf8f5] text-[#141413]"
                      : m.who === "user"
                      ? "ml-auto bg-ink text-cream"
                      : "bg-cream text-ink"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className={`flex w-fit items-center gap-2 rounded-lg px-3 py-2 ${calmMode ? "bg-[#faf8f5]" : "bg-cream"}`}>
                  <span className="sr-only" role="status">Веспи готовит ответ</span>
                  <span className="flex items-center gap-1.5" aria-hidden="true">
                    <span
                      className="chp-dot h-1.5 w-1.5 rounded-full bg-ink-soft"
                      style={{ animationDelay: "0s" }}
                    />
                    <span
                      className="chp-dot h-1.5 w-1.5 rounded-full bg-ink-soft"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="chp-dot h-1.5 w-1.5 rounded-full bg-ink-soft"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </span>
                </div>
              )}
              {showLead && <LeadForm onDone={() => setShowLead(false)} />}
            </div>

            <div className={`flex shrink-0 gap-2 p-3 ${calmMode ? "border-t border-[#e7e4df]" : "border-t-2 border-ink"}`}>
              <label className="sr-only" htmlFor="chat-input">
                Вопрос ИИ-консультанту
              </label>
              <input
                ref={inputRef}
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder={guidesMode ? "Спроси про эту тему…" : portalMode && displayContext.taskId ? "Спроси про этот шаг…" : "Спроси про поступление…"}
                className={`h-11 min-w-0 flex-1 px-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 ${calmMode ? "rounded-xl border border-[#e7e4df] bg-white focus-visible:outline-[#141413]" : "rounded-md border-2 border-ink bg-cream focus-visible:outline-red"}`}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={busy || !input.trim()}
                aria-label={busy ? "Ожидаем ответ" : "Отправить"}
                className={`flex size-11 shrink-0 items-center justify-center ${calmMode ? "rounded-full border border-[#e7e4df] bg-transparent text-[#141413] hover:bg-[#faf8f5]" : "rounded-md border-2 border-ink bg-ink text-white hover:bg-ink hover:border-ink"} transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LeadForm({ onDone }: { onDone: () => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (sending) return;
    if (!isValidPhone(phone)) {
      setError("Проверь номер телефона.");
      return;
    }
    setSending(true);
    setError(null);
    const result = await submitLead({ phone: phone.trim(), from: "chat" });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    markLeadCaptured();
    track("lead_captured", { from: "chat" });
    setDone(true);
    setTimeout(onDone, 1400);
  }

  if (done) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-green bg-green/10 p-4 text-sm">
        <CheckCircle2 size={22} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
        <div>
          <b className="block">Записали</b>
          <p className="mt-1 text-ink-soft">
            Свяжемся по WhatsApp на {phone}. Напоминания о дедлайнах подключаются
            отдельно в Telegram из личного кабинета.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-ink bg-cream p-4 text-sm">
      <b className="block">Бесплатные вопросы закончились</b>
      <p className="mt-1 text-ink-soft">
        Оставь номер — свяжемся по твоему поступлению и ответим на оставшиеся
        вопросы. Напоминания о дедлайнах включаются отдельно в Telegram. Без спама.
      </p>
      <input
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setError(null);
        }}
        placeholder="+7 ___ ___ __ __"
        inputMode="tel"
        type="tel"
        autoComplete="tel"
        disabled={sending}
        aria-label="Номер телефона для WhatsApp"
        aria-invalid={(error && !isValidPhone(phone)) ? true : undefined}
        aria-describedby={error ? "chat-phone-error" : undefined}
        className="mt-3 min-h-11 w-full rounded-md border-2 border-ink bg-paper px-3 py-2.5 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
      />
      {error && (
        <p id="chat-phone-error" role="alert" className="mt-1.5 text-xs font-bold text-red">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="mt-2.5 min-h-11 w-full rounded-pill border-2 border-ink bg-ink px-4 py-2.5 text-xs font-extrabold text-cream uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? "Отправляю…" : "Отправить номер"}
      </button>
    </div>
  );
}
