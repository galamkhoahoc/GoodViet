import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  Bell,
  Bot,
  Brain,
  ChevronLeft,
  Cpu,
  Globe2,
  Menu,
  Mic,
  Plus,
  Search,
  Send,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import '../styles/expert-chat.css';

type ContactId = 'bot' | 'expert' | 'doctor';

type LocalMessage = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

type Contact = {
  id: ContactId;
  name: string;
  preview: string;
  time: string;
  avatar?: string;
  role: string;
};

const CONTACTS: Contact[] = [
  {
    id: 'bot',
    name: 'GoodBot (Trợ lý AI)',
    preview: 'Mình có một vài bài tập thư giãn...',
    time: '10:30',
    role: 'Trợ lý sức khỏe tinh thần',
  },
  {
    id: 'expert',
    name: 'ThS. Lê Trần',
    preview: 'Chào bạn, tôi đã xem qua đánh giá...',
    time: 'H.qua',
    avatar: '/images/avatars/expert_2.png',
    role: 'Chuyên gia ngôn ngữ trị liệu',
  },
  {
    id: 'doctor',
    name: 'Bác sĩ Ngọc Phạm',
    preview: 'Lịch hẹn của bạn đã được xác nhận...',
    time: 'T2',
    avatar: '/images/avatars/expert_3.png',
    role: 'Bác sĩ tư vấn phát âm',
  },
];

const INITIAL_EXPERT_MESSAGES: LocalMessage[] = [
  {
    id: 'expert-1',
    sender: 'bot',
    text: 'Chào bạn, tôi đã xem qua kết quả đánh giá sơ bộ của bạn.',
  },
  {
    id: 'expert-2',
    sender: 'user',
    text: 'Dạ, chuyên gia cho em hỏi kết quả như vậy có đáng lo ngại không ạ?',
  },
  {
    id: 'expert-3',
    sender: 'bot',
    text: 'Hiện tại chưa có gì đáng lo ngại. Chúng ta nên có một buổi trao đổi chi tiết hơn để đánh giá thêm. Bạn có rảnh vào chiều thứ Năm không?',
  },
];

const INITIAL_DOCTOR_MESSAGES: LocalMessage[] = [
  {
    id: 'doctor-1',
    sender: 'bot',
    text: 'Chào bạn, lịch tư vấn trực tuyến của chúng ta đã được xác nhận vào 14:30 thứ Hai.',
  },
  {
    id: 'doctor-2',
    sender: 'user',
    text: 'Cảm ơn bác sĩ. Tôi có cần chuẩn bị lại kết quả đánh giá phát âm không ạ?',
  },
  {
    id: 'doctor-3',
    sender: 'bot',
    text: 'Bạn chỉ cần ở một nơi yên tĩnh và chuẩn bị tai nghe. Tôi đã có kết quả đánh giá trong hồ sơ của bạn.',
  },
];

const BOT_SUGGESTIONS = [
  'Lên kế hoạch tuần',
  'Kể một câu chuyện vui',
  'Gợi ý nhạc thư giãn',
];

function BotAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`gv-chat-bot-avatar gv-chat-bot-avatar--${size}`} aria-hidden="true">
      <Bot />
    </span>
  );
}

function ContactAvatar({ contact, size = 'md' }: { contact: Contact; size?: 'sm' | 'md' }) {
  if (contact.id === 'bot') return <BotAvatar size={size === 'sm' ? 'sm' : 'lg'} />;

  return (
    <span className={`gv-chat-contact-avatar gv-chat-contact-avatar--${size}`} aria-hidden="true">
      <img src={contact.avatar} alt="" />
    </span>
  );
}

export function ExpertPage() {
  const botMessages = useChatStore((state) => state.messages);
  const botIsTyping = useChatStore((state) => state.isTyping);
  const modelStatus = useChatStore((state) => state.modelStatus);
  const modelProgress = useChatStore((state) => state.modelProgress);
  const modelDetail = useChatStore((state) => state.modelDetail);
  const modelError = useChatStore((state) => state.modelError);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const loadSessions = useChatStore((state) => state.loadSessions);
  const createSession = useChatStore((state) => state.createSession);
  const sendBotMessage = useChatStore((state) => state.sendMessage);
  const preloadModel = useChatStore((state) => state.preloadModel);

  const [activeContact, setActiveContact] = useState<ContactId>('bot');
  const [expertMessages, setExpertMessages] = useState<LocalMessage[]>(INITIAL_EXPERT_MESSAGES);
  const [doctorMessages, setDoctorMessages] = useState<LocalMessage[]>(INITIAL_DOCTOR_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactListOpen, setIsContactListOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const replyTimersRef = useRef<number[]>([]);

  const activeContactMeta = CONTACTS.find((contact) => contact.id === activeContact) ?? CONTACTS[0];
  const currentHumanMessages = activeContact === 'doctor' ? doctorMessages : expertMessages;

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('vi');
    if (!query) return CONTACTS;
    return CONTACTS.filter((contact) => (
      `${contact.name} ${contact.role} ${contact.preview}`.toLocaleLowerCase('vi').includes(query)
    ));
  }, [searchQuery]);

  useEffect(() => {
    void loadSessions();
    const skipQaDownload = import.meta.env.DEV && new URLSearchParams(window.location.search).has('__skipModel');
    if (!skipQaDownload) void preloadModel();
  }, [loadSessions, preloadModel]);

  useEffect(() => {
    if (activeContact === 'bot') void loadMessages();
  }, [activeContact, activeSessionId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeContact, botMessages, botIsTyping, doctorMessages, expertMessages]);

  useEffect(() => () => {
    replyTimersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const selectContact = (contactId: ContactId) => {
    setActiveContact(contactId);
    setInputValue('');
    setIsContactListOpen(false);
  };

  const handleNewConversation = async () => {
    if (isCreatingConversation) return;
    setActiveContact('bot');
    setInputValue('');
    setIsContactListOpen(false);
    setIsCreatingConversation(true);
    try {
      await createSession('Cuộc trò chuyện mới');
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue('');

    if (activeContact === 'bot') {
      void sendBotMessage(text);
      return;
    }

    const userMessage: LocalMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
    };
    const addMessage = activeContact === 'doctor' ? setDoctorMessages : setExpertMessages;
    addMessage((messages) => [...messages, userMessage]);

    const target = activeContact;
    const timer = window.setTimeout(() => {
      const reply: LocalMessage = {
        id: `reply-${Date.now()}`,
        sender: 'bot',
        text: target === 'doctor'
          ? 'Tôi đã nhận được tin nhắn. Tôi sẽ xem lại hồ sơ và phản hồi bạn trước buổi hẹn.'
          : 'Chuyên gia đã nhận được tin nhắn và sẽ phản hồi bạn trong thời gian sớm nhất.',
      };
      addMessage((messages) => [...messages, reply]);
    }, 900);
    replyTimersRef.current.push(timer);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const renderBotStarter = botMessages.length === 0;

  return (
    <main className="gv-chat-page">
      <header className="gv-chat-header">
        <div className="gv-chat-heading">
          <button
            type="button"
            className="gv-chat-icon-button gv-chat-mobile-menu"
            aria-label="Mở danh sách cuộc trò chuyện"
            onClick={() => setIsContactListOpen(true)}
          >
            <Menu />
          </button>
          <h1>Tin nhắn &amp; Chuyên gia</h1>
        </div>

        <div className="gv-chat-header-actions">
          <label className="gv-chat-search" aria-label="Tìm kiếm cuộc trò chuyện">
            <Search aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm..."
              type="search"
            />
            {searchQuery && (
              <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setSearchQuery('')}>
                <X />
              </button>
            )}
          </label>
          <button type="button" className="gv-chat-header-icon" aria-label="Thông báo">
            <Bell />
            <span className="gv-chat-notification-dot" />
          </button>
          <button type="button" className="gv-chat-header-icon gv-chat-language" aria-label="Ngôn ngữ">
            <Globe2 />
          </button>
          <button type="button" className="gv-chat-profile-button" aria-label="Mở hồ sơ">
            <img src="/images/avatars/expert_4.png" alt="Ảnh đại diện của bạn" />
          </button>
        </div>
      </header>

      <div className="gv-chat-shell">
        {isContactListOpen && (
          <button
            type="button"
            className="gv-chat-drawer-backdrop"
            aria-label="Đóng danh sách cuộc trò chuyện"
            onClick={() => setIsContactListOpen(false)}
          />
        )}

        <aside className={`gv-chat-sidebar ${isContactListOpen ? 'gv-chat-sidebar--open' : ''}`}>
          <div className="gv-chat-sidebar-top">
            <button
              type="button"
              className="gv-chat-new-button"
              onClick={() => void handleNewConversation()}
              disabled={isCreatingConversation}
            >
              <Plus aria-hidden="true" />
              <span>{isCreatingConversation ? 'Đang tạo cuộc trò chuyện...' : 'Bắt đầu cuộc hội thoại mới'}</span>
            </button>
            <button
              type="button"
              className="gv-chat-sidebar-close"
              aria-label="Đóng danh sách"
              onClick={() => setIsContactListOpen(false)}
            >
              <X />
            </button>
          </div>

          <div className="gv-chat-mobile-search">
            <Search aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm kiếm..."
              type="search"
            />
          </div>

          <div className="gv-chat-contact-list">
            {filteredContacts.map((contact) => (
              <button
                type="button"
                key={contact.id}
                className={`gv-chat-contact-row ${activeContact === contact.id ? 'gv-chat-contact-row--active' : ''}`}
                onClick={() => selectContact(contact.id)}
              >
                <ContactAvatar contact={contact} />
                <span className="gv-chat-contact-copy">
                  <span className="gv-chat-contact-title-line">
                    <strong>{contact.name}</strong>
                    <small>{contact.time}</small>
                  </span>
                  <span className="gv-chat-contact-preview">{contact.preview}</span>
                </span>
              </button>
            ))}

            {filteredContacts.length === 0 && (
              <div className="gv-chat-empty-search">
                <Search aria-hidden="true" />
                <p>Không tìm thấy cuộc trò chuyện phù hợp.</p>
              </div>
            )}
          </div>
        </aside>

        <section className="gv-chat-conversation" aria-label={`Cuộc trò chuyện với ${activeContactMeta.name}`}>
          <div className="gv-chat-mobile-contact-bar">
            <button type="button" aria-label="Quay lại danh sách" onClick={() => setIsContactListOpen(true)}>
              <ChevronLeft />
            </button>
            <ContactAvatar contact={activeContactMeta} size="sm" />
            <span>
              <strong>{activeContactMeta.name}</strong>
              <small>{activeContactMeta.role}</small>
            </span>
          </div>

          <div className="gv-chat-message-scroll" id="chat-container">
            <div className="gv-chat-day-label">Hôm nay</div>

            {activeContact === 'bot' ? (
              <>
                {renderBotStarter && (
                  <>
                    <div className="gv-chat-message-row gv-chat-message-row--incoming">
                      <BotAvatar />
                      <div className="gv-chat-bubble gv-chat-bubble--incoming gv-chat-bubble--welcome">
                        <p>Chào bạn! Mình là GoodBot. Hôm nay bạn cảm thấy thế nào? Mình ở đây để lắng nghe và hỗ trợ bạn.</p>
                        <div className="gv-chat-mood-actions">
                          <button type="button" onClick={() => setInputValue('Hôm nay tôi cảm thấy rất tuyệt vời')}>
                            <Sparkles aria-hidden="true" />
                            Tôi cảm thấy tuyệt vời
                          </button>
                          <button type="button" onClick={() => setInputValue('Hôm nay tôi cần một lời khuyên')}>
                            <Brain aria-hidden="true" />
                            Tôi cần lời khuyên
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="gv-chat-message-row gv-chat-message-row--outgoing">
                      <div className="gv-chat-bubble gv-chat-bubble--outgoing">
                        Hôm nay tôi hơi căng thẳng vì công việc. Có nhiều deadline quá.
                      </div>
                    </div>

                    <div className="gv-chat-message-row gv-chat-message-row--incoming">
                      <BotAvatar />
                      <div className="gv-chat-bubble gv-chat-bubble--incoming gv-chat-bubble--exercise">
                        <p>Mình hiểu cảm giác đó. Áp lực công việc đôi khi khiến ta quá tải. Hãy thử dành 5 phút để hít thở sâu nhé. Mình có một bài tập thư giãn nhỏ, bạn có muốn thử không?</p>
                        <div className="gv-chat-exercise-card">
                          <span className="gv-chat-exercise-icon" aria-hidden="true"><Wind /></span>
                          <span className="gv-chat-exercise-copy">
                            <strong>Hít thở Box Breathing</strong>
                            <small>4 giây hít vào, 4 giây giữ, 4 giây thở ra, 4 giây giữ.</small>
                            <button type="button" onClick={() => setInputValue('Hướng dẫn tôi thực hiện bài tập Box Breathing')}>Bắt đầu ngay</button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {botMessages.map((message, index) => (
                  <div
                    key={message.messageId ?? message._id ?? `${message.timestamp}-${index}`}
                    className={`gv-chat-message-row ${message.senderType === 'user' ? 'gv-chat-message-row--outgoing' : 'gv-chat-message-row--incoming'}`}
                  >
                    {message.senderType === 'bot' && <BotAvatar />}
                    <div className={`gv-chat-bubble ${message.senderType === 'user' ? 'gv-chat-bubble--outgoing' : 'gv-chat-bubble--incoming'}`}>
                      {message.content}
                    </div>
                  </div>
                ))}

                {botIsTyping && (
                  <div className="gv-chat-message-row gv-chat-message-row--incoming">
                    <BotAvatar />
                    <div className="gv-chat-typing" aria-label="GoodBot đang nhập">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </>
            ) : (
              currentHumanMessages.map((message) => (
                <div
                  key={message.id}
                  className={`gv-chat-message-row ${message.sender === 'user' ? 'gv-chat-message-row--outgoing' : 'gv-chat-message-row--incoming'}`}
                >
                  {message.sender === 'bot' && <ContactAvatar contact={activeContactMeta} size="sm" />}
                  <div className={`gv-chat-bubble ${message.sender === 'user' ? 'gv-chat-bubble--outgoing' : 'gv-chat-bubble--incoming'}`}>
                    {message.text}
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          <footer className="gv-chat-composer-wrap">
            {activeContact === 'bot' && (
              <div className={`gv-chat-local-model is-${modelStatus}`} aria-live="polite">
                <Cpu aria-hidden="true" />
                <span>
                  <strong>
                    Trợ lý AI cục bộ · {modelStatus === 'ready' ? 'Sẵn sàng' : modelStatus === 'generating' ? 'Đang trả lời' : modelStatus === 'error' || modelStatus === 'unsupported' ? 'Cần kiểm tra' : 'Đang chuẩn bị'}
                  </strong>
                  <small>{modelError || modelDetail}</small>
                </span>
                {['checking', 'downloading', 'loading'].includes(modelStatus) && (
                  <b>{Math.round(modelProgress * 100)}%</b>
                )}
              </div>
            )}
            <div className="gv-chat-suggestions" aria-label="Gợi ý tin nhắn">
              {(activeContact === 'bot' ? BOT_SUGGESTIONS : ['Đặt lịch hẹn', 'Gửi kết quả đánh giá', 'Hỏi về bài luyện tập']).map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => setInputValue(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="gv-chat-composer">
              <button type="button" className="gv-chat-composer-icon" aria-label="Đính kèm nội dung">
                <Plus />
              </button>
              <button type="button" className="gv-chat-composer-icon" aria-label="Gửi tin nhắn thoại">
                <Mic />
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activeContact === 'bot' ? 'Nhắn tin cho GoodBot...' : `Nhắn tin cho ${activeContactMeta.name}...`}
                aria-label="Nội dung tin nhắn"
              />
              <button
                type="button"
                className="gv-chat-send-button"
                aria-label="Gửi tin nhắn"
                disabled={!inputValue.trim()}
                onClick={handleSendMessage}
              >
                <Send />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
