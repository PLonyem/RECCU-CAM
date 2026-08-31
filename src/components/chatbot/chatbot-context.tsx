"use client";

import { createContext, useContext } from "react";

interface ChatbotContextValue {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

export const ChatbotContext = createContext<ChatbotContextValue | null>(null);

export function useChatbotContext() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  }
  return context;
}
