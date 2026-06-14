import { useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { Plus } from 'lucide-react';

export function ConversationsPanel() {
  const { sessions, activeSessionId, loadSessions, createSession, switchSession, deleteSession } = useChatStore();

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
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVCgl7W-tWs83qNjAlhYXc4TcdUDWwtDbndOFChbcbxm3xLf6AWqAQ4DjVQpElT5JgoLvSdq8pnIfg84TKii5jwtiWiGAVvJHvh7-UfvCXmyS9bZGyuysHsTfnyFhixF8__5GOhostBEXHtvhGznTTLBnuysybTQBYd6fWVnboMGg15YrJvk-cnko56q1cZ-7gLfG-O3ixaSu3-sV85nDpFONyU-5nTgZba45-bB8XX6ZCJuTfQfscJExyjQ9sYxB-v661e8Qt9Kc'
    },
    {
      _id: 'mock_2',
      title: 'Bác sĩ Ngọc Phạm (Chuyên gia)',
      lastMessage: 'Lịch hẹn của bạn đã được xác nhận...',
      time: 'Thứ 2',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4_NRzcjKqYTdRKCLFclqWgDugKc1BWqQYAC2ofwB1kODE9rMUHybaxXKr0qH4xhQeadHX1vWZNEbWm9cUdZNuvXBEEkBdNoaH4hKEL1K7pe3IpTDBEWgZi2252T622J_hO-36JW8O9B3uMrmY9FJh6mI7RMJoToWKPdqOyq_V4zGOn51U9htmKusMjABDtJg1h88jgmhmW0aOR05R6IMj526XDp2OmtDv6Et5moKRV-rX46P63mgMBnJEdbtyox49FWwqUvQPnCM'
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
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgQLzkmVyq3xF3VWcGrPE-e86rF0g6L0PxeTZzShIo4cZPEBoQ8n6CjGMah-4pDglRtytU-HDhmgWXAHXMH1rT-qgTOdo8zgTigk-AOAjOk6Gc6A6KxR_mabNhjGsH6yLM2EKZ-qwM9EtGzHQ2c_gPI3Y2FLSScUZv1RxNoNTG52uW0pudHwfbXFTPysy9wUk7huYnwuT-62-X3yzpGTYaW1ydQYxDf737mlCxqCmBgCAcFpgi3FkFTsQVCViBhQDBnf4NQBrwf9s" 
                  alt="GoodBot Avatar" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-[16px] font-bold truncate">GoodBot (Trợ lý AI)</h3>
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
