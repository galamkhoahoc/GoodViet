import { create } from 'zustand';

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

interface StoredChat {
  sessions: ChatSession[];
  messagesBySession: Record<string, ChatMessage[]>;
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
  reset: () => void;
}

const STORAGE_KEY = 'goodviet:local-gemma-chat:v1';
let chatGeneration = 0;

function newId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredChat(): StoredChat {
  if (typeof localStorage === 'undefined') return { sessions: [], messagesBySession: {} };
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<StoredChat>;
    return {
      sessions: Array.isArray(value.sessions) ? value.sessions : [],
      messagesBySession: value.messagesBySession && typeof value.messagesBySession === 'object'
        ? value.messagesBySession
        : {},
    };
  } catch {
    return { sessions: [], messagesBySession: {} };
  }
}

function writeStoredChat(value: StoredChat) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function sessionTitle(content: string) {
  const compact = content.replace(/\s+/g, ' ').trim();
  return compact.length > 34 ? `${compact.slice(0, 34)}…` : compact || 'Cuộc trò chuyện mới';
}

function persistState(state: Pick<ChatState, 'sessions' | 'activeSessionId' | 'messages'>) {
  const stored = readStoredChat();
  if (state.activeSessionId) stored.messagesBySession[state.activeSessionId] = state.messages;
  stored.sessions = state.sessions;
  writeStoredChat(stored);
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isTyping: false,

  loadSessions: async () => {
    const stored = readStoredChat();
    const current = get().activeSessionId;
    const activeSessionId = current && stored.sessions.some(session => session._id === current)
      ? current
      : stored.sessions[0]?._id ?? null;
    set({
      sessions: stored.sessions,
      activeSessionId,
      messages: activeSessionId ? stored.messagesBySession[activeSessionId] ?? [] : [],
    });
  },

  createSession: async (title = 'Cuộc trò chuyện mới') => {
    const now = new Date().toISOString();
    const session: ChatSession = { _id: newId('local-chat'), title, lastMessageAt: now };
    set(state => ({
      sessions: [session, ...state.sessions],
      activeSessionId: session._id,
      messages: [],
    }));
    const state = get();
    persistState(state);
    return session._id;
  },

  switchSession: (sessionId) => {
    const stored = readStoredChat();
    set({ activeSessionId: sessionId, messages: sessionId ? stored.messagesBySession[sessionId] ?? [] : [] });
  },

  deleteSession: async (sessionId) => {
    const stored = readStoredChat();
    delete stored.messagesBySession[sessionId];
    stored.sessions = stored.sessions.filter(session => session._id !== sessionId);
    writeStoredChat(stored);
    const nextActiveId = get().activeSessionId === sessionId
      ? stored.sessions[0]?._id ?? null
      : get().activeSessionId;
    set({
      sessions: stored.sessions,
      activeSessionId: nextActiveId,
      messages: nextActiveId ? stored.messagesBySession[nextActiveId] ?? [] : [],
    });
  },

  loadMessages: async () => {
    const { activeSessionId } = get();
    const stored = readStoredChat();
    set({ messages: activeSessionId ? stored.messagesBySession[activeSessionId] ?? [] : [] });
  },



  reset: () => {
    chatGeneration += 1;
    if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    set({
      sessions: [],
      activeSessionId: null,
      messages: [],
      isTyping: false,
    });
  },

  sendMessage: async (content) => {
    const text = content.trim();
    if (!text || get().isTyping) return;

    let activeSessionId = get().activeSessionId;
    if (!activeSessionId) activeSessionId = await get().createSession(sessionTitle(text));
    if (!activeSessionId) return;

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      messageId: newId('user'),
      senderType: 'user',
      content: text,
      timestamp: now,
    };
    set(state => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
      sessions: state.sessions.map(session => session._id === activeSessionId
        ? { ...session, title: state.messages.length === 0 ? sessionTitle(text) : session.title, lastMessageAt: now }
        : session),
    }));
    persistState(get());

    const requestGeneration = chatGeneration;
    const replyId = newId('gemma');
    let replyAdded = false;
    const updateReply = (reply: string) => {
      if (requestGeneration !== chatGeneration) return;
      set(state => {
        if (!replyAdded) {
          replyAdded = true;
          return {
            messages: [...state.messages, {
              messageId: replyId,
              senderType: 'bot',
              content: reply,
              timestamp: new Date().toISOString(),
            }],
          };
        }
        return {
          messages: state.messages.map(message => message.messageId === replyId ? { ...message, content: reply } : message),
        };
      });
    };

    try {
      const history = get().messages.slice(-14).map(message => ({
        role: message.senderType === 'user' ? 'user' as const : 'assistant' as const,
        content: message.content,
      }));
      const { apiClient } = await import('../services/api/apiClient');
      const apiResponse = await apiClient.post<any>('/api/chat/evaluate', {
        prompt: text,
        history: [
          {
            role: 'user',
            content: 'Bạn là GoodBot của GOODVIET, một trợ lý thân thiện hỗ trợ người Việt luyện phát âm. Trả lời bằng tiếng Việt, rõ ràng, ngắn gọn; không tự chẩn đoán y khoa và khuyên gặp chuyên gia khi phù hợp.',
          },
          {
            role: 'assistant',
            content: 'Mình là GoodBot. Mình sẽ hỗ trợ bằng tiếng Việt, ưu tiên hướng dẫn thực tế và an toàn.',
          },
          ...history,
        ]
      });
      const response = apiResponse.result;
      
      if (requestGeneration !== chatGeneration) return;
      updateReply(response || 'Mình chưa tạo được câu trả lời rõ ràng. Bạn thử diễn đạt lại câu hỏi nhé.');
      set({ isTyping: false });
      persistState(get());
    } catch (error) {
      if (requestGeneration !== chatGeneration) return;
      set({ isTyping: false });
      persistState(get());
    }
  },
}));
