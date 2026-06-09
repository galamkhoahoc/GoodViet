import { create } from 'zustand';
import type { ChatMessage } from '../data/mockChat';
import { mockChatHistory, generateBotResponse } from '../data/mockChat';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => void;
  loadMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,

  loadMessages: () => {
    try {
      const saved = localStorage.getItem('goodviet_chat');
      if (saved) {
        set({ messages: JSON.parse(saved) });
      } else {
        set({ messages: mockChatHistory });
      }
    } catch {
      set({ messages: mockChatHistory });
    }
  },

  sendMessage: (content: string) => {
    const userMsg: ChatMessage = {
      messageId: 'msg-' + Date.now(),
      senderType: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const { messages } = get();
    const updated = [...messages, userMsg];
    set({ messages: updated, isTyping: true });

    // Simulate bot typing delay
    setTimeout(() => {
      const botMsg: ChatMessage = {
        messageId: 'msg-' + (Date.now() + 1),
        senderType: 'bot',
        content: generateBotResponse(content),
        timestamp: new Date().toISOString(),
      };
      const allMsgs = [...updated, botMsg];
      set({ messages: allMsgs, isTyping: false });
      localStorage.setItem('goodviet_chat', JSON.stringify(allMsgs));
    }, 800 + Math.random() * 1200);
  },
}));
