"use client";

import { useEffect, useRef, useState } from "react";
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
import { Vespa } from "@/components/Vespa";
import { VespaReveal } from "@/components/VespaReveal";
import { ChatLauncher } from "./ChatLauncher";
import { useReducedMotion } from "@/components/motion/MotionProvider";

interface Msg {
  who: "user" | "ai";
  text: string;
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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      who: "ai",
      text: "Ciao! Я Веспа, ИИ-консультант IItaly. Спроси про аттестат, документы, визу D или стипендию DSU.",
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
  const reducedMotion = useReducedMotion();

  useDraggableHeader(panelRef, headRef, open);

  // Keeps the mount-only event listener below calling the current render's
  // `send` (which closes over up-to-date `input`/`busy` state) instead of
  // freezing on whatever `send` looked like when the listener was attached.
  const sendRef = useRef<(overrideText?: string) => void>(() => {});

  useEffect(() => {
    function onOpenRequest(e: Event) {
      const detail = (e as CustomEvent<{ prefill?: string; source?: string }>)
        .detail;
      setOpen(true);
      track("chat_open");
      track("ai_assistant_opened", { source: detail?.source ?? "portal" });
      if (detail?.prefill) {
        setTimeout(() => sendRef.current(detail.prefill), 50);
      }
    }
    window.addEventListener("iitaly:open-chat", onOpenRequest);
    return () => window.removeEventListener("iitaly:open-chat", onOpenRequest);
  }, []);

  function scrollDown() {
    requestAnimationFrame(() => {
      if (logRef.current)
        logRef.current.scrollTop = logRef.current.scrollHeight;
    });
  }

  function openChat() {
    setOpen(true);
    track("chat_open");
    track("ai_assistant_opened", { source: "fab" });
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
    bumpAsked();
    track("chat_message_sent", { n: askedCount() });
    setTyping(true);
    scrollDown();

    if (!BACKEND_URL) {
      setTimeout(
        () => {
          setTyping(false);
          setMessages((m) => [...m, { who: "ai", text: demoReply(text) }]);
          scrollDown();
        },
        900 + Math.random() * 600,
      );
      return;
    }

    setBusy(true);
    historyRef.current = [
      ...historyRef.current,
      { role: "user", content: text },
    ];
    try {
      const reply = await sendChatMessage(historyRef.current);
      historyRef.current = [
        ...historyRef.current,
        { role: "assistant", content: reply },
      ];
      setMessages((m) => [...m, { who: "ai", text: reply }]);
      const left = FREE_LIMIT - askedCount();
      if (!leadCaptured() && left > 0 && left <= 3) {
        setMessages((m) => [
          ...m,
          {
            who: "ai",
            text:
              left === 1
                ? "Остался один бесплатный вопрос. Дальше оставь номер — пришлём план и напоминания о дедлайнах."
                : `Бесплатных вопросов осталось: ${left}`,
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          who: "ai",
          text: "Не получилось соединиться с сервером. Проверь интернет и попробуй ещё раз.",
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
      <ChatLauncher hidden={open} onOpen={openChat} />

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-label="ИИ-консультант"
            className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom,0px))] z-[90] flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-float"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4, transition: PANEL_EXIT }}
            transition={reducedMotion ? { duration: 0 } : PANEL_SPRING}
          >
            <div
              ref={headRef}
              className="flex shrink-0 cursor-grab touch-none items-center gap-2 border-b-2 border-ink bg-ink px-4 py-3 text-cream select-none active:cursor-grabbing"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream/10">
                <Vespa pose="avatar" className="h-6 w-6" />
              </span>
              <b className="text-sm">Веспа</b>
              {/* Было «база 2026»: непонятно, что за база и почему 2026.
                 На остальных страницах это называется «правила приёма
                 2026/27» — одна формулировка на весь продукт. */}
              <span className="font-mono text-[10px] tracking-[0.08em] text-cream/55 uppercase">
                правила 2026/27
              </span>
              <button
                type="button"
                aria-label="Закрыть чат"
                onClick={() => setOpen(false)}
                className="chp-close ml-auto -mr-2 flex size-11 items-center justify-center rounded-pill text-cream/70 transition-colors duration-[var(--duration-fast)] hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
              >
                <CloseIcon />
              </button>
            </div>

            <div
              ref={logRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                    m.who === "user"
                      ? "ml-auto bg-ink text-cream"
                      : "bg-cream text-ink"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="flex w-fit items-center gap-2 rounded-lg bg-cream px-3 py-2">
                  <VespaReveal pose="thinking" className="h-7 w-auto shrink-0" />
                  <span className="flex items-center gap-1.5">
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

            <div className="flex shrink-0 gap-2 border-t-2 border-ink p-3">
              <label className="sr-only" htmlFor="chat-input">
                Вопрос ИИ-консультанту
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder="Спроси про поступление…"
                className="h-11 flex-1 rounded-md border-2 border-ink bg-cream px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
              />
              <button
                type="button"
                onClick={() => send()}
                aria-label="Отправить"
                className="flex size-11 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-red text-cream transition-colors duration-[var(--duration-fast)] hover:bg-red-deep hover:border-red-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
    if (!isValidPhone(phone)) {
      setError("Проверь номер телефона.");
      return;
    }
    setSending(true);
    await submitLead({ phone: phone.trim(), from: "chat" });
    markLeadCaptured();
    track("lead_captured", { from: "chat" });
    setSending(false);
    setDone(true);
    setTimeout(onDone, 1400);
  }

  if (done) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg border-2 border-green bg-green/10 p-4 text-sm">
        <VespaReveal pose="success" className="h-10 w-auto shrink-0" />
        <div>
          <b className="block">Записали</b>
          <p className="mt-1 text-ink-soft">
            Напишем в WhatsApp на {phone}. Можешь продолжать спрашивать — лимит
            снят.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-ink bg-cream p-4 text-sm">
      <b className="block">Бесплатные вопросы закончились</b>
      <p className="mt-1 text-ink-soft">
        Оставь номер — пришлём твой план, напоминания о дедлайнах Universitaly и
        DSU и ответим на оставшиеся вопросы. Без спама.
      </p>
      <input
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setError(null);
        }}
        placeholder="+7 ___ ___ __ __"
        inputMode="tel"
        aria-label="Номер телефона для WhatsApp"
        className="mt-3 w-full rounded-md border-2 border-ink bg-paper px-3 py-2.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-bold text-red">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={sending}
        className="mt-2.5 w-full rounded-pill border-2 border-ink bg-red px-4 py-2.5 text-xs font-extrabold text-cream uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {sending ? "Отправляю…" : "Получить план"}
      </button>
    </div>
  );
}
