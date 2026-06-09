export interface ChatMessage {
  messageId: string;
  senderType: 'user' | 'bot';
  content: string;
  timestamp: string;
}

export const mockChatHistory: ChatMessage[] = [
  {
    messageId: 'msg-001',
    senderType: 'bot',
    content: 'Chào bạn! Mình là GOODVIET Companion 🌟 Mình sẽ đồng hành cùng bạn trong hành trình cải thiện giọng nói nhé. Hôm nay bạn cảm thấy thế nào?',
    timestamp: '2026-06-09T08:00:00Z',
  },
  {
    messageId: 'msg-002',
    senderType: 'user',
    content: 'Chào bot, hôm nay mình cảm thấy khá tốt!',
    timestamp: '2026-06-09T08:01:00Z',
  },
  {
    messageId: 'msg-003',
    senderType: 'bot',
    content: 'Tuyệt vời! 🎉 Mình thấy bạn đã luyện tập 7 ngày liên tiếp rồi đấy. Streak đang rất tốt! Hôm nay bạn có 2 bài luyện phát âm L/N. Bạn muốn bắt đầu ngay không?',
    timestamp: '2026-06-09T08:01:30Z',
  },
  {
    messageId: 'msg-004',
    senderType: 'user',
    content: 'Ừ, mình muốn hỏi là phát âm chữ L sao cho đúng?',
    timestamp: '2026-06-09T08:02:00Z',
  },
  {
    messageId: 'msg-005',
    senderType: 'bot',
    content: 'Câu hỏi rất hay! 👍 Để phát âm chữ L đúng:\n\n1. **Đặt đầu lưỡi** chạm vào nướu trên (phía sau răng cửa trên)\n2. **Luồng hơi** đi ra hai bên lưỡi\n3. **Dây thanh rung** khi phát âm\n\nKhác với âm N, khi phát âm L luồng hơi đi qua miệng, còn âm N luồng hơi đi qua mũi.\n\nBạn hãy thử luyện: "La - Le - Li - Lo - Lu" nhé! 🗣️',
    timestamp: '2026-06-09T08:02:30Z',
  },
];

export const botResponses: Record<string, string[]> = {
  greeting: [
    'Chào bạn! Mình rất vui được gặp bạn hôm nay 🌟',
    'Xin chào! Hôm nay bạn có khỏe không? 😊',
    'Chào bạn! Sẵn sàng cho buổi luyện tập hôm nay chưa? 💪',
  ],
  encouragement: [
    'Bạn đang làm rất tốt! Tiếp tục phát huy nhé 🎉',
    'Mỗi ngày một tiến bộ, bạn giỏi lắm! ⭐',
    'Đừng lo lắng, luyện tập đều đặn sẽ thấy kết quả thôi 💪',
    'Streak của bạn đang rất ấn tượng! Cố gắng duy trì nhé 🔥',
  ],
  practice: [
    'Hôm nay bạn có bài luyện phát âm. Hãy vào mục Lộ trình để bắt đầu nhé!',
    'Mình nhắc bạn đã đến giờ luyện tập rồi đó! Chỉ 10 phút thôi 🕐',
    'Video hướng dẫn tuần này đã sẵn sàng. Xem trước khi luyện nhé!',
  ],
  emotion: [
    'Mình hiểu bạn đang cảm thấy vậy. Cứ từ từ, không ai hoàn hảo ngay được 🤗',
    'Cảm ơn bạn đã chia sẻ. Mình luôn ở đây đồng hành cùng bạn nhé!',
    'Sự kiên trì của bạn thật đáng ngưỡng mộ. Mình tin bạn sẽ cải thiện! 🌈',
  ],
  default: [
    'Mình hiểu rồi! Bạn có muốn mình giúp gì thêm không?',
    'Cảm ơn bạn đã chia sẻ. Nếu cần hỗ trợ thêm, cứ hỏi mình nhé!',
    'Thú vị đấy! Bạn muốn trao đổi thêm về vấn đề gì?',
  ],
};

export function generateBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('chào') || msg.includes('xin chào') || msg.includes('hello')) {
    return botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)];
  }
  if (msg.includes('luyện') || msg.includes('tập') || msg.includes('bài')) {
    return botResponses.practice[Math.floor(Math.random() * botResponses.practice.length)];
  }
  if (msg.includes('buồn') || msg.includes('mệt') || msg.includes('khó') || msg.includes('nản')) {
    return botResponses.emotion[Math.floor(Math.random() * botResponses.emotion.length)];
  }
  if (msg.includes('tốt') || msg.includes('vui') || msg.includes('giỏi') || msg.includes('tiến bộ')) {
    return botResponses.encouragement[Math.floor(Math.random() * botResponses.encouragement.length)];
  }
  return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
}
