import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Plus } from 'lucide-react';

export function ConversationsPanel() {
  const { sessions, activeSessionId, loadSessions, createSession, switchSession } = useChatStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async () => {
    await createSession();
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  // Mock expert sessions to match the Figma design
  const mockExperts = [
    {
      _id: 'mock_1',
      title: 'ThS. Lê Trần (Chuyên gia)',
      lastMessage: 'Chào bạn, tôi đã xem qua đánh giá...',
      time: 'Hôm qua',
      avatarUrl: '/images/avatars/expert_2_new.jpg'
    },
    {
      _id: 'mock_2',
      title: 'Bác sĩ Ngọc Phạm (Chuyên gia)',
      lastMessage: 'Lịch hẹn của bạn đã được xác nhận...',
      time: 'Thứ 2',
      avatarUrl: '/images/avatars/expert_3_new.jpg'
    }
  ];

  return (
    <div className="flex flex-col h-full bg-[#f2f5eb] border-r border-[#C3C8BC]/20">
      
      {/* New Chat Button */}
      <div className="p-4 border-b border-[#C3C8BC]/20 shrink-0">
        <button 
          onClick={handleCreateSession}
          className="w-full py-3 px-4 bg-[#205107] text-white rounded-full text-[14px] font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus size={20} />
          Bắt đầu cuộc hội thoại mới
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {/* Real Bot Sessions */}
        {sessions.map((session, index) => {
          const isActive = activeSessionId === session._id || (index === 0 && activeSessionId === null);
          return (
            <div 
              key={session._id} 
              className={`p-4 flex gap-3 cursor-pointer border-b border-[#C3C8BC]/10 transition-colors ${
                isActive ? 'bg-[#D8E7CB] text-[#596750]' : 'hover:bg-[#e0e4da] text-[#191d17]'
              }`}
              onClick={() => switchSession(session._id)}
            >
              <div className="w-12 h-12 rounded-full bg-[#BDF59B] shrink-0 flex items-center justify-center overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="/images/avatars/chiga.jpg?v=2" 
                  alt="Chị Gà Avatar" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[16px] font-bold truncate">Chị Gà (Trợ lý AI)</h3>
                  <span className="text-[12px] font-medium opacity-70">
                    {formatTime(session.lastMessageAt)}
                  </span>
                </div>
                <p className={`text-[14px] truncate mt-0.5 ${isActive ? 'opacity-80' : 'text-[#42493c] opacity-60'}`}>
                  {session.title || 'Mình có một vài bài tập thư giãn...'}
                </p>
              </div>
            </div>
          );
        })}

        {/* Mock Expert Sessions for Design Parity */}
        {mockExperts.map(expert => (
          <div 
            key={expert._id} 
            className="p-4 hover:bg-[#e0e4da] transition-colors flex gap-3 cursor-pointer border-b border-[#C3C8BC]/10"
          >
            <div className="w-12 h-12 rounded-full bg-[#C3C8BC] shrink-0 flex items-center justify-center overflow-hidden">
              <img className="w-full h-full object-cover" src={expert.avatarUrl} alt={expert.title} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-[16px] font-bold text-[#191d17] truncate">{expert.title}</h3>
                <span className="text-[12px] font-medium text-[#191d17] opacity-70">{expert.time}</span>
              </div>
              <p className="text-[14px] text-[#42493c] truncate mt-0.5 opacity-60">
                {expert.lastMessage}
              </p>
            </div>
          </div>
        ))}
        
      </div>
    </div>
  );
}
