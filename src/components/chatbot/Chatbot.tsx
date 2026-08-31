"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle, X, Send, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import type { LocalizedText } from "@/lib/i18n";
import {
  matchKnowledgeBase,
  WELCOME,
  FALLBACK,
  ACTION_HREFS,
  type Chip,
  type KBAction,
} from "@/lib/chatbot-kb";
import { ChatbotContext } from "./chatbot-context";
import logo from "../../../public/logo.jpg";

// `text` carries both languages and is resolved at render time (not when
// the message is created) so every message — not just the standing welcome
// — flips instantly when the visitor toggles the site language. Free-typed
// user input has no French counterpart to translate to, so it's stored as
// the same string in both slots.
interface ChatMessage {
  id: number;
  role: "bot" | "user";
  text: LocalizedText;
  chips?: Chip[];
  action?: KBAction;
}

const FOCUSABLE_SELECTOR = 'input, button, [href], [tabindex]:not([tabindex="-1"])';
// Bumped whenever the persisted message shape changes, so a stale session
// saved under an older schema is ignored instead of crashing the render.
const SESSION_KEY = "camccul-chatbot-session-v2";

// Offsets both the closed bubble and the open window the same amount from
// the corner, but adds env(safe-area-inset-*) on top so it clears the home
// indicator / rounded corners on notched phones instead of hiding under them.
const FAB_POSITION_CLASS =
  "print:hidden fixed z-[60] bottom-[calc(1.5rem_+_env(safe-area-inset-bottom))] right-[calc(1.5rem_+_env(safe-area-inset-right))]";

function welcomeMessage(): ChatMessage {
  return { id: 0, role: "bot", text: WELCOME.reply, chips: WELCOME.chips };
}

// Cosmetic delay proportional to reply length — makes the bot read as
// "considering" the question rather than firing back instantly.
function replyDelay(text: string) {
  return 600 + Math.min(text.length * 8, 1800);
}

function MsgText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
    </>
  );
}

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const { language, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  // Cami is a public-site assistant — hide the floating widget on
  // admin/dashboard pages, but keep rendering `children` and the context
  // itself, since this provider wraps the entire app from the root layout.
  const hideWidget = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcomeMessage()]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const msgIdRef = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Next.js SSRs this client component too, where `document` doesn't exist —
  // the portal can only mount once we know we're actually in the browser.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore a prior conversation for this tab session, if any. Deliberately
  // an effect, not a lazy useState initializer, for the same hydration
  // reason as LanguageContext's localStorage read: sessionStorage isn't
  // available during SSR, so the first client render must match the
  // server's default (a fresh welcome message) before swapping it in.
  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { messages?: ChatMessage[]; isOpen?: boolean };
      if (Array.isArray(saved.messages) && saved.messages.length > 0) {
        setMessages(saved.messages);
        msgIdRef.current = Math.max(...saved.messages.map((m) => m.id)) + 1;
      }
      if (typeof saved.isOpen === "boolean") setIsOpen(saved.isOpen);
    } catch {
      // Malformed or legacy session data — fall back to the default welcome.
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ messages, isOpen }));
  }, [messages, isOpen]);

  // Warm the router cache for every page a KB reply might deep-link to, as
  // soon as the visitor actually opens the widget — so a CTA click navigates
  // instantly instead of waiting on an on-demand route fetch.
  useEffect(() => {
    if (!isOpen) return;
    ACTION_HREFS.forEach((href) => router.prefetch(href));
  }, [isOpen, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (e.key !== "Tab" || !windowRef.current) return;

      const focusable = Array.from(windowRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function nextId() {
    const id = msgIdRef.current;
    msgIdRef.current += 1;
    return id;
  }

  function respondTo(queryText: string) {
    const entry = matchKnowledgeBase(queryText) ?? FALLBACK;
    setIsTyping(true);
    window.setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", text: entry.reply, chips: entry.chips, action: entry.action },
      ]);
    }, replyDelay(entry.reply[language]));
  }

  function sendText(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: { en: trimmed, fr: trimmed } }]);
    respondTo(trimmed);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    setInput("");
    sendText(trimmed);
  }

  function handleChipClick(chip: Chip) {
    if (isTyping) return;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: chip.label }]);
    respondTo(chip.query[language]);
  }

  const contextValue = useMemo(
    () => ({
      isOpen,
      openChat: () => setIsOpen(true),
      closeChat: () => setIsOpen(false),
    }),
    [isOpen]
  );

  const canSend = input.trim().length > 0 && !isTyping;

  const fab = (
    <div className={cn(FAB_POSITION_CLASS, "animate-chatbot-float")}>
      <span className="absolute inset-0 rounded-full bg-primary-500 animate-chatbot-pulse" />
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t("chatbot_open_aria")}
        className="relative w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );

  const panel = (
    <div
      ref={windowRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("chatbot_assistant_name")}
      className={cn(
        FAB_POSITION_CLASS,
        "origin-bottom-right animate-fade-in",
        "w-80 sm:w-96 max-[400px]:w-[calc(100vw-2rem)] h-[min(30rem,80dvh)]",
        "bg-white rounded-2xl shadow-2xl border border-gray-200",
        "flex flex-col overflow-hidden"
      )}
    >
      <div className="bg-primary-500 text-white px-4 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 p-1">
            <Image src={logo} alt="" className="h-full w-full object-contain" />
          </div>
          <span className="font-semibold text-sm">{t("chatbot_assistant_name")}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label={t("chatbot_close_aria")}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div key={message.id} className={message.role === "bot" ? "mr-auto max-w-[90%]" : "ml-auto max-w-[85%]"}>
            <div
              className={cn(
                "px-4 py-3 text-sm animate-fade-in",
                message.role === "bot"
                  ? "bg-white rounded-2xl rounded-bl-md text-gray-800 shadow-sm"
                  : "bg-primary-500 text-white rounded-2xl rounded-br-md"
              )}
            >
              <MsgText text={message.text[language]} />
            </div>

            {message.role === "bot" && message.action && (
              <Link
                href={message.action.href}
                onClick={() => setIsOpen(false)}
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                {message.action.label[language]}
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            {message.role === "bot" && message.chips && message.chips.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {message.chips.map((chip) => (
                  <button
                    key={chip.label.en}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    disabled={isTyping}
                    className="rounded-full border border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700 px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {chip.label[language]}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-400 shadow-sm max-w-[85%] mr-auto animate-fade-in">
            {t("chatbot_typing")}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex gap-2 bg-white shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chatbot_placeholder")}
          aria-label={t("chatbot_input_aria")}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={t("chatbot_send_aria")}
          className="bg-primary-500 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-primary-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      <p className="text-center text-[10px] uppercase tracking-wide text-gray-400 py-2 bg-white border-t border-gray-100 shrink-0">
        {t("chatbot_disclaimer")}
      </p>
    </div>
  );

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
      {!hideWidget && mounted && createPortal(isOpen ? panel : fab, document.body)}
    </ChatbotContext.Provider>
  );
}
