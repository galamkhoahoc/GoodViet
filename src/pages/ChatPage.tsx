import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { Send, Bot, User } from 'lucide-react';
import { ConversationsPanel } from '../components/chat/ConversationsPanel';

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
    <div style={{ display: 'flex', flex: 1, height: '100%', width: '100%' }}>
      <ConversationsPanel />
      
      <div className="chat-content-card">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-title">
            <h2>💬 GOODVIET Companion</h2>
            <span className="chat-header-subtitle">Chatbot đồng hành, động viên và hỗ trợ bạn mỗi ngày</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bot size={40} />
              </div>
              <h2>Xin chào!</h2>
              <p>Hãy bắt đầu cuộc trò chuyện với GOODVIET Bot</p>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <div key={msg.messageId} className={`message ${msg.senderType}`}>
                  <div className="message-bubble">
                    {msg.content}
                    <div className="message-time" style={{ marginTop: '4px', fontSize: '11px', opacity: 0.7 }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message bot">
                  <div className="message-bubble" style={{ display: 'flex', gap: '4px', padding: '12px 20px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--md-sys-color-on-surface-variant)',
                        animation: `pulse ${1 + i * 0.2}s ease-in-out infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-area">
            <textarea
              placeholder="Nhập tin nhắn của bạn..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
              <Send size={20} />
            </button>
          </div>
          <p style={{
            fontSize: '12px',
            color: 'var(--md-sys-color-on-surface-variant)',
            textAlign: 'center',
            marginTop: '8px',
            opacity: 0.7
          }}>
            Thông tin chỉ mang tính hỗ trợ cảm xúc, không thay thế chẩn đoán hoặc điều trị y khoa.
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    </div>
  );
}
