import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { Send, Bot, User } from 'lucide-react';

export function ChatPage() {
  const { messages, isTyping, sendMessage, loadMessages } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">💬 <span className="heading-highlight">GOODVIET Companion</span></h1>
        <p className="page-subtitle">Chatbot đồng hành, động viên và hỗ trợ bạn mỗi ngày</p>
      </div>

      <div className="chat-container">
        {/* Chat Header */}
        <div style={{
          padding: 'var(--gv-space-md) var(--gv-space-lg)',
          borderBottom: '1px solid var(--gv-border)',
          display: 'flex', alignItems: 'center', gap: 'var(--gv-space-md)',
          background: 'var(--gv-bg-surface)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--gv-radius-full)',
            background: 'var(--gv-primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <div className="font-semibold">GOODVIET Bot</div>
            <div className="text-xs" style={{ color: 'var(--gv-success)' }}>● Đang hoạt động</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.messageId} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.senderType === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '70%' }}>
                {msg.senderType === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 'var(--gv-radius-full)', flexShrink: 0,
                    background: 'var(--gv-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bot size={14} color="white" />
                  </div>
                )}
                <div className={`chat-bubble ${msg.senderType}`}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  <div className="chat-bubble-time">{formatTime(msg.timestamp)}</div>
                </div>
                {msg.senderType === 'user' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: 'var(--gv-radius-full)', flexShrink: 0,
                    background: 'var(--gv-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={14} color="white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 'var(--gv-radius-full)',
                background: 'var(--gv-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={14} color="white" />
              </div>
              <div className="chat-bubble bot" style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: '50%', background: 'var(--gv-text-muted)',
                      animation: `wave-bar 1s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-primary btn-icon" onClick={handleSend} disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
