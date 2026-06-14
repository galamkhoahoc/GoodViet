import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';

type StaticMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  component?: React.ReactNode;
};

const INITIAL_MESSAGES: StaticMessage[] = [
  {
    id: 'e1',
    sender: 'bot',
    text: 'Chào bạn, tôi đã xem qua kết quả đánh giá sơ bộ của bạn.',
  },
  {
    id: 'e2',
    sender: 'user',
    text: 'Dạ, bác sĩ cho em hỏi kết quả như vậy có đáng lo ngại không ạ?'
  },
  {
    id: 'e3',
    sender: 'bot',
    text: 'Hiện tại chưa có gì đáng lo ngại. Chúng ta cần thiết lập một lịch hẹn chi tiết hơn để đánh giá thêm. Bạn có rảnh vào chiều thứ 5 không?',
  }
];

export function ExpertPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine initial contact based on route
  const isChatRoute = location.pathname.includes('/chat');
  const [activeContact, setActiveContact] = useState<'bot' | 'expert'>(isChatRoute ? 'bot' : 'expert');

  // Zustand Store for AI Bot
  const { messages: botMessages, isTyping: botIsTyping, sendMessage: sendBotMessage, loadMessages } = useChatStore();

  // Local state for Expert Chat (Mock)
  const [expertMessages, setExpertMessages] = useState<StaticMessage[]>(INITIAL_MESSAGES);
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If activeContact is bot, load messages
    if (activeContact === 'bot') {
      loadMessages();
    }
  }, [activeContact, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [botMessages, expertMessages, botIsTyping, activeContact]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();
    setInputValue('');
    
    if (activeContact === 'bot') {
      sendBotMessage(text);
    } else {
      // Mock sending to expert
      const newMsg: StaticMessage = { id: Date.now().toString(), sender: 'user', text };
      setExpertMessages(prev => [...prev, newMsg]);

      setTimeout(() => {
        const reply: StaticMessage = { id: (Date.now() + 1).toString(), sender: 'bot', text: 'Chuyên gia hiện đang bận, sẽ phản hồi bạn trong thời gian sớm nhất.' };
        setExpertMessages(prev => [...prev, reply]);
      }, 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <main className="flex-1 ml-nav-rail-width min-h-screen pb-12 pt-0 bg-background h-screen flex flex-col">
      <div className="max-w-[1200px] mx-auto p-6 md:p-12 flex flex-col gap-8 w-full flex-1 min-h-0">
        {/* View Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-display-lg text-display-lg text-on-background font-bold tracking-tight">Tin nhắn & Chuyên gia</h2>
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="relative w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input type="text" placeholder="Tìm kiếm..." className="w-full bg-surface-lowest text-on-surface text-body-md pl-10 pr-4 py-2 rounded-full border border-outline-variant/30 focus:border-primary focus:outline-none transition-colors shadow-sm" />
            </div>
            <button className="w-10 h-10 rounded-full bg-surface-lowest hover:bg-surface-container flex items-center justify-center text-on-surface-variant border border-outline-variant/30 shadow-sm transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden border border-outline-variant/30 shadow-sm flex items-center justify-center text-on-primary-container">
               <span className="material-symbols-outlined">person</span>
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="flex-1 flex overflow-hidden organic-curve shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-outline-variant/20 bg-surface-lowest bg-clip-padding">
          {/* List Pane */}
          <div className="w-full md:w-[320px] bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto">
              
              {/* AI Assistant Section */}
              <div className="p-4 border-b border-outline-variant/10">
                 <h4 className="font-label-md font-bold text-on-surface-variant mb-3 uppercase tracking-wider">Trợ lý AI</h4>
                 <div 
                   onClick={() => { setActiveContact('bot'); navigate('/chat'); }}
                   className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeContact === 'bot' ? 'bg-primary-container/30' : 'hover:bg-surface-container-low'}`}
                 >
                   <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="material-symbols-outlined text-primary text-[24px]">robot_2</span>
                      </div>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-title-md font-bold text-on-surface truncate">GoodBot (Trợ lý AI)</span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant truncate">Sẵn sàng hỗ trợ và lắng nghe...</p>
                   </div>
                 </div>
              </div>

              {/* Experts Section */}
              <div className="p-4">
                 <div className="flex justify-between items-center mb-3">
                    <h4 className="font-label-md font-bold text-on-surface-variant uppercase tracking-wider">Chuyên gia của bạn</h4>
                    <button className="text-primary hover:bg-surface-container rounded-full w-6 h-6 flex items-center justify-center">
                       <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                 </div>
                 
                 <div className="space-y-1">
                    <div 
                      onClick={() => { setActiveContact('expert'); navigate('/experts'); }}
                      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${activeContact === 'expert' ? 'bg-primary-container/30' : 'hover:bg-surface-container-low'}`}
                    >
                       <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-secondary-container text-on-secondary-container relative flex items-center justify-center">
                          <span className="material-symbols-outlined">psychology</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-title-md font-medium text-on-surface truncate">ThS. Lê Trần</span>
                            <span className="text-[10px] text-on-surface-variant flex-shrink-0 ml-1">Hôm qua</span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant truncate">Chào bạn, tôi đã xem qua đánh giá...</p>
                       </div>
                    </div>

                    <div className="flex gap-3 p-3 hover:bg-surface-container-low rounded-xl cursor-pointer transition-colors">
                       <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-tertiary-container text-on-tertiary-container relative flex items-center justify-center">
                          <span className="material-symbols-outlined">health_and_safety</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-title-md font-medium text-on-surface truncate">Bác sĩ Ngọc Phạm</span>
                            <span className="text-[10px] text-on-surface-variant flex-shrink-0 ml-1">Thứ 2</span>
                          </div>
                          <p className="text-body-sm text-on-surface-variant truncate">Lịch hẹn của bạn đã được xác nhận...</p>
                       </div>
                    </div>

                    {/* Pending Request */}
                    <div className="mt-4 p-3 border border-dashed border-outline-variant/60 rounded-xl bg-surface-container-low">
                       <p className="text-body-sm text-on-surface-variant mb-2">Đang chờ quản trị viên duyệt yêu cầu ghép nối với <span className="font-bold">GS. Nguyễn</span>.</p>
                       <div className="w-full bg-surface-lowest h-1.5 rounded-full overflow-hidden">
                          <div className="bg-secondary-fixed-dim w-1/3 h-full rounded-full animate-pulse"></div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Chat Window Pane */}
          <div className="hidden md:flex flex-1 bg-surface-lowest flex-col min-w-0 relative">
            {/* Chat History */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6" id="chat-container">
               <div className="text-center">
                  <span className="inline-block px-3 py-1 bg-surface-container-low text-on-surface-variant text-[11px] rounded-full font-medium">Hôm nay</span>
               </div>

               {activeContact === 'bot' && (
                  <div className="flex gap-4 self-start">
                     <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 relative self-end mb-2">
                        <div className="absolute inset-0 flex items-center justify-center">
                           <span className="material-symbols-outlined text-[16px] text-primary">robot_2</span>
                        </div>
                     </div>
                     <div className="p-5 rounded-2xl shadow-sm text-body-md max-w-[80%] bg-surface-container-lowest border border-outline-variant/20 rounded-bl-sm text-on-surface">
                       <p>Chào bạn! Mình là GoodBot. Hôm nay bạn cảm thấy thế nào? Mình ở đây để lắng nghe và hỗ trợ bạn.</p>
                       <div className="flex gap-2 flex-wrap mt-4">
                         <button className="flex items-center gap-2 px-4 py-2 bg-surface-lowest border border-outline-variant/30 rounded-full hover:bg-surface-container-low transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">light_mode</span> Tôi cảm thấy tuyệt vời
                         </button>
                         <button className="flex items-center gap-2 px-4 py-2 bg-surface-lowest border border-outline-variant/30 rounded-full hover:bg-surface-container-low transition-colors text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">psychology</span> Tôi cần lời khuyên
                         </button>
                       </div>
                     </div>
                  </div>
               )}

               {activeContact === 'bot' ? botMessages.map((msg) => (
                 <div key={msg.messageId} className={`flex gap-4 ${msg.senderType === 'user' ? 'justify-end' : ''}`}>
                    {msg.senderType === 'bot' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 relative self-end mb-2">
                          <div className="absolute inset-0 flex items-center justify-center">
                             <span className="material-symbols-outlined text-[16px] text-primary">robot_2</span>
                          </div>
                      </div>
                    )}
                    <div className={`p-5 rounded-2xl shadow-sm text-body-md max-w-[80%] whitespace-pre-wrap ${msg.senderType === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-lowest border border-outline-variant/20 rounded-bl-sm text-on-surface'}`}>
                      <p>{msg.content}</p>
                    </div>
                 </div>
               )) : expertMessages.map((msg) => (
                 <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-secondary-container text-on-secondary-container relative self-end mb-2 flex items-center justify-center">
                         <span className="material-symbols-outlined text-[16px]">psychology</span>
                      </div>
                    )}
                    <div className={`p-5 rounded-2xl shadow-sm text-body-md max-w-[80%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-lowest border border-outline-variant/20 rounded-bl-sm text-on-surface'}`}>
                      <p className={msg.component ? "mb-4" : ""}>{msg.text}</p>
                      {msg.component}
                    </div>
                 </div>
               ))}
               
               {activeContact === 'bot' && botIsTyping && (
                  <div className="flex gap-4 self-start">
                     <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-primary/10 relative self-end mb-2">
                        <div className="absolute inset-0 flex items-center justify-center">
                           <span className="material-symbols-outlined text-[16px] text-primary">robot_2</span>
                        </div>
                     </div>
                     <div className="p-5 rounded-2xl shadow-sm text-body-md bg-surface-container-lowest border border-outline-variant/20 rounded-bl-sm flex gap-1.5 items-center">
                        <div className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce" style={{ animationDelay: '0.3s' }} />
                     </div>
                  </div>
               )}

               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-outline-variant/20 bg-surface-lowest">
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
                 <button onClick={() => setInputValue('Lên kế hoạch tuần')} className="px-4 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-sm rounded-full transition-colors whitespace-nowrap">Lên kế hoạch tuần</button>
                 <button onClick={() => setInputValue('Kể một câu chuyện vui')} className="px-4 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-sm rounded-full transition-colors whitespace-nowrap">Kể một câu chuyện vui</button>
                 <button onClick={() => setInputValue('Gợi ý nhạc thư giãn')} className="px-4 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface text-sm rounded-full transition-colors whitespace-nowrap">Gợi ý nhạc thư giãn</button>
              </div>
              <div className="flex items-center bg-surface-container-low rounded-full px-2 py-2 border border-transparent focus-within:border-primary transition-colors">
                <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <input 
                  type="text" 
                  placeholder={activeContact === 'bot' ? "Nhắn tin cho GoodBot..." : "Nhắn tin cho chuyên gia..."}
                  className="flex-1 bg-transparent border-none outline-none text-on-surface px-4 py-2"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 shadow-sm disabled:opacity-50"
                >
                   <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
