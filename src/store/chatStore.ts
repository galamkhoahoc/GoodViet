import { create } from 'zustand';
import { apiClient } from '../services/api/apiClient';

export interface ChatMessage {
  _id?: string;
  messageId?: string;
  senderType: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  _id: string;
  title: string;
  lastMessageAt: string;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messages: ChatMessage[];
  isTyping: boolean;
  loadSessions: () => Promise<void>;
  createSession: (title?: string) => Promise<string | null>;
  switchSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isTyping: false,

  loadSessions: async () => {
    try {
      const response: any = await apiClient.get('/api/chat/sessions');
      if (response && response.sessions) {
        set({ sessions: response.sessions });
        
        // If no active session and we have sessions, maybe auto-select the first one?
        // Or if there are legacy messages, we might want to stay on the "legacy" view (null session).
        const currentActive = get().activeSessionId;
        if (!currentActive && response.sessions.length > 0 && !response.hasLegacyMessages) {
          set({ activeSessionId: response.sessions[0]._id });
          get().loadMessages();
        }
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    }
  },

  createSession: async (title?: string) => {
    try {
      const response: any = await apiClient.post('/api/chat/sessions', { title });
      if (response && response.session) {
        set(state => ({
          sessions: [response.session, ...state.sessions],
          activeSessionId: response.session._id,
          messages: [] // Clear messages for new session
        }));
        return response.session._id;
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
    return null;
  },

  switchSession: (sessionId: string | null) => {
    set({ activeSessionId: sessionId });
    get().loadMessages();
  },

  deleteSession: async (sessionId: string) => {
    try {
      await apiClient.delete(`/api/chat/sessions/${sessionId}`);
      set(state => {
        const newSessions = state.sessions.filter(s => s._id !== sessionId);
        const newActiveId = state.activeSessionId === sessionId 
          ? (newSessions.length > 0 ? newSessions[0]._id : null) 
          : state.activeSessionId;
        
        return {
          sessions: newSessions,
          activeSessionId: newActiveId,
          messages: state.activeSessionId === sessionId ? [] : state.messages
        };
      });
      
      if (get().activeSessionId) {
        get().loadMessages();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  },

  loadMessages: async () => {
    try {
      const { activeSessionId } = get();
      const url = activeSessionId 
        ? `/api/chat/history?sessionId=${activeSessionId}` 
        : '/api/chat/history';
        
      const response: any = await apiClient.get(url);
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
    let { activeSessionId } = get();
    
    // If no active session, create one first before sending message
    if (!activeSessionId) {
      // Create a session using the first few words of the message as title
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      activeSessionId = await get().createSession(title);
      if (!activeSessionId) {
        console.error('Failed to auto-create session');
        return;
      }
    }

    const userMsg: ChatMessage = {
      messageId: 'temp-' + Date.now(),
      senderType: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    const { messages } = get();
    set({ messages: [...messages, userMsg], isTyping: true });

    try {
      const response: any = await apiClient.post('/api/chat/messages', { 
        content, 
        sessionId: activeSessionId 
      });
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
        
        // Refresh sessions to update lastMessageAt
        get().loadSessions();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      set({ isTyping: false });
    }
  },
}));
