import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Search, Plus, MessageCircle, Trash2 } from 'lucide-react';

export function ConversationsPanel() {
  const { sessions, activeSessionId, loadSessions, createSession, switchSession, deleteSession } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async () => {
    await createSession();
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="conversations-panel" style={{ background: 'transparent', borderRight: 'none', padding: '16px 8px 16px 16px' }}>
      
      {/* Header & New Chat Button */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={handleCreateSession}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            background: 'var(--md-sys-color-primary-container)',
            color: 'var(--md-sys-color-on-primary-container)',
            border: 'none',
            borderRadius: '16px',
            fontSize: 'var(--md-sys-typescale-label-large-size)',
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: 'var(--md-sys-elevation-1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-2)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--md-sys-elevation-1)'}
        >
          <Plus size={20} />
          New space
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-container" style={{ marginBottom: '16px' }}>
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search chat and spaces" 
          style={{ 
            background: 'var(--md-sys-color-surface-container)',
            width: '100%'
          }} 
        />
      </div>

      <div style={{ padding: '0 8px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--md-sys-color-on-surface-variant)' }}>
        Chats ({sessions.length})
      </div>

      {/* Conversations List */}
      <div className="conversations-list" style={{ padding: 0 }}>
        {sessions.map(session => (
          <div 
            key={session._id} 
            className={`conversation-item ${activeSessionId === session._id ? 'active' : ''}`}
            onClick={() => switchSession(session._id)}
            style={{ 
              borderRadius: '28px', 
              marginBottom: '2px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'var(--md-sys-color-tertiary-container)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageCircle size={16} color="var(--md-sys-color-on-tertiary-container)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: activeSessionId === session._id ? 600 : 500,
                  color: activeSessionId === session._id ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {session.title}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {formatDate(session.lastMessageAt)}
                </span>
              </div>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteSession(session._id);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--md-sys-color-on-surface-variant)',
                cursor: 'pointer',
                opacity: 0.6,
                padding: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--md-sys-color-error)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {/* Legacy History Item */}
        <div 
            className={`conversation-item ${activeSessionId === null ? 'active' : ''}`}
            onClick={() => switchSession(null)}
            style={{ 
              borderRadius: '28px', 
              marginTop: '16px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'var(--md-sys-color-surface-variant)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageCircle size={16} color="var(--md-sys-color-on-surface-variant)" />
            </div>
            <span style={{ 
                fontSize: '14px', 
                fontWeight: activeSessionId === null ? 600 : 500,
                color: activeSessionId === null ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface)',
            }}>
              Lịch sử cũ
            </span>
          </div>
      </div>
    </div>
  );
}
