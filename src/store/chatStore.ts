import { create } from 'zustand';
import { apiClient } from '../services/api/apiClient';

export interface ChatMessage {
  _id?: string;
  messageId?: string;
  senderType: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,

  loadMessages: async () => {
    try {
      const response: any = await apiClient.get('/api/chat/history');
      if (response && response.messages) {
        // Map backend history to frontend format
        const msgs = response.messages.map((m: any) => ({
          messageId: m._id,
          senderType: m.senderType,
          content: m.content,
          timestamp: m.timestamp,
        })).reverse(); // show oldest first
        set({ messages: msgs });
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  },

  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      messageId: 'temp-' + Date.now(),
      senderType: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const { messages } = get();
    set({ messages: [...messages, userMsg], isTyping: true });

    try {
      const response: any = await apiClient.post('/api/chat/messages', { content });
      if (response && response.botMessage) {
        const botMsg: ChatMessage = {
          messageId: response.botMessage._id,
          senderType: 'bot',
          content: response.botMessage.content,
          timestamp: response.botMessage.timestamp,
        };
        // Update temporary user message with real ID if needed, and add bot message
        const allMsgs = [...get().messages];
        // Replace temp msg with real one if you want, but for now just add bot msg
        allMsgs.push(botMsg);
        set({ messages: allMsgs, isTyping: false });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      set({ isTyping: false });
    }
  },
}));
