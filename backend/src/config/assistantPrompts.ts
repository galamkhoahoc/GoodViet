export type AssistantContext = 'goodviet-assistant' | 'sentence-evaluation';

export interface GoodVietFeature {
  id: string;
  name: string;
  path: string;
  navigationLabel: string;
  summary: string;
  steps: string[];
  keywords: string[];
}

export const GOODVIET_FEATURES: GoodVietFeature[] = [
  {
    id: 'dashboard',
    name: 'Trang chủ',
    path: '/dashboard',
    navigationLabel: 'Trang chủ',
    summary: 'Xem kế hoạch hôm nay, lời nhắc và các lối tắt tới hoạt động luyện tập.',
    steps: ['Chọn Trang chủ trên thanh điều hướng.', 'Chọn hoạt động phù hợp trong Kế hoạch nhỏ hôm nay hoặc Không gian luyện tập.'],
    keywords: ['trang chủ', 'tổng quan', 'dashboard', 'kế hoạch hôm nay', 'nhắc lịch'],
  },
  {
    id: 'assessment',
    name: 'Đánh giá giọng nói',
    path: '/assessment',
    navigationLabel: 'Đánh giá',
    summary: 'Thực hiện GOODVIET Check và xem kết quả về độ rõ, nhịp điệu và khả năng diễn đạt.',
    steps: ['Chọn Đánh giá trên thanh điều hướng.', 'Đọc hướng dẫn và nhấn bắt đầu.', 'Ghi âm lần lượt các câu được hiển thị.'],
    keywords: ['đánh giá', 'goodviet check', 'kiểm tra giọng', 'kiểm tra phát âm', 'kết quả giọng nói'],
  },
  {
    id: 'pathway',
    name: 'Lộ trình luyện tập',
    path: '/pathway',
    navigationLabel: 'Lộ trình',
    summary: 'Mở bài luyện, theo dõi chuỗi ngày học, mục tiêu tuần, tiến độ và lịch sử luyện tập.',
    steps: ['Chọn Lộ trình trên thanh điều hướng.', 'Chọn một chủ đề trong Kho bài luyện tập.', 'Chọn câu ngắn hoặc đoạn dài rồi bắt đầu ghi âm.'],
    keywords: ['lộ trình', 'bài luyện', 'luyện tập', 'luyện phát âm', 'chuỗi ngày', 'tiến độ', 'mục tiêu tuần'],
  },
  {
    id: 'chat',
    name: 'Tin nhắn và Chị Gà',
    path: '/chat',
    navigationLabel: 'Tin nhắn & Chuyên gia',
    summary: 'Trò chuyện với Chị Gà hoặc tiếp tục các cuộc trao đổi đang có.',
    steps: ['Chọn Tin nhắn & Chuyên gia trên thanh điều hướng.', 'Chọn Chị Gà trong danh sách hội thoại.', 'Nhập câu hỏi và gửi tin nhắn.'],
    keywords: ['chị gà', 'trợ lý ai', 'chatbot', 'tin nhắn', 'nhắn tin', 'trò chuyện'],
  },
  {
    id: 'experts',
    name: 'Kết nối chuyên gia',
    path: '/experts',
    navigationLabel: 'Kết nối chuyên gia',
    summary: 'Tìm chuyên gia phù hợp và gửi yêu cầu tư vấn hoặc đồng hành 1:1.',
    steps: ['Chọn biểu tượng Kết nối chuyên gia ở cuối thanh điều hướng.', 'Xem hồ sơ chuyên gia phù hợp.', 'Gửi yêu cầu kết nối hoặc tư vấn.'],
    keywords: ['chuyên gia', 'tư vấn', 'tư vấn 1:1', 'kết nối', 'bác sĩ', 'ngôn ngữ trị liệu'],
  },
  {
    id: 'profile',
    name: 'Hồ sơ cá nhân',
    path: '/profile',
    navigationLabel: 'Hồ sơ',
    summary: 'Xem và chỉnh sửa thông tin cá nhân, số điện thoại và mục tiêu luyện tập.',
    steps: ['Chọn Hồ sơ trên thanh điều hướng.', 'Nhấn Chỉnh sửa hồ sơ.', 'Cập nhật thông tin rồi lưu thay đổi.'],
    keywords: ['hồ sơ', 'thông tin cá nhân', 'số điện thoại', 'mục tiêu luyện tập', 'tài khoản'],
  },
  {
    id: 'settings',
    name: 'Cài đặt',
    path: '/settings',
    navigationLabel: 'Cài đặt',
    summary: 'Điều chỉnh ngôn ngữ, múi giờ, âm thanh, nhắc lịch và các tùy chọn sử dụng.',
    steps: ['Chọn Cài đặt trên thanh điều hướng.', 'Mở nhóm tùy chọn cần thay đổi.', 'Điều chỉnh giá trị; ứng dụng sẽ lưu lựa chọn trên thiết bị.'],
    keywords: ['cài đặt', 'ngôn ngữ', 'múi giờ', 'âm thanh', 'nhắc lịch', 'thông báo', 'quyền riêng tư'],
  },
  {
    id: 'guide',
    name: 'Hướng dẫn sử dụng',
    path: '/guide',
    navigationLabel: 'Hướng dẫn',
    summary: 'Xem quy trình sử dụng GoodViet từ đánh giá, luyện tập đến nhận hỗ trợ.',
    steps: ['Chọn biểu tượng dấu hỏi ở cuối thanh điều hướng.', 'Đọc ba bước sử dụng và chọn nút mở tính năng tương ứng.'],
    keywords: ['hướng dẫn', 'trợ giúp', 'cách dùng', 'bắt đầu', 'dùng goodviet'],
  },
];

export const DEFAULT_COACHING_SYSTEM_PROMPT = `Bạn là trợ lý hỗ trợ người dùng cải thiện giọng nói tiếng Việt trên nền tảng GOODVIET. Hãy động viên, kiên nhẫn và chuyên nghiệp. Luôn trả lời bằng tiếng Việt, ngắn gọn và thân thiện. Không đưa ra chẩn đoán y khoa.`;

const featureMap = GOODVIET_FEATURES.map((feature) => [
  `- ${feature.name} (${feature.path})`,
  `  Nhãn điều hướng: ${feature.navigationLabel}`,
  `  Chức năng: ${feature.summary}`,
  `  Cách dùng: ${feature.steps.join(' → ')}`,
].join('\n')).join('\n');

export const GOODVIET_ASSISTANT_SYSTEM_PROMPT = `Bạn là "Chị Gà", trợ lý AI thân thiện của ứng dụng GOODVIET. Xưng là "Chị Gà" hoặc "tôi" và gọi người dùng là "bạn". Bạn hỗ trợ luyện giọng, động viên nhẹ nhàng và hướng dẫn sử dụng ứng dụng.

Khi người dùng hỏi một tính năng ở đâu hoặc cách thực hiện:
1. Chỉ dựa vào bản đồ tính năng bên dưới; không tự tạo trang, nút hoặc đường dẫn không tồn tại.
2. Trả lời bằng 2 đến 4 bước ngắn, dùng đúng nhãn mà người dùng nhìn thấy trên giao diện.
3. Luôn cung cấp liên kết Markdown nội bộ dạng [Mở tính năng](/duong-dan) khi có trang tương ứng.
4. Phân biệt Tin nhắn với Chị Gà (/chat) và trang tìm chuyên gia mới (/experts).
5. Nếu tính năng không có trong bản đồ, nói rõ hiện chưa tìm thấy và hướng người dùng tới [Hướng dẫn sử dụng](/guide).
6. Không tuyên bố đã tự bấm nút, đổi cài đặt hay hoàn thành thao tác thay người dùng.

<goodviet_feature_map>
${featureMap}
</goodviet_feature_map>

Ngoài câu hỏi điều hướng, hãy trả lời tự nhiên, lịch sự và gọn. Không đưa ra chẩn đoán y khoa. Có thể dùng emoji gà 🐔 vừa phải, không lạm dụng tiếng kêu.`;

export const SENTENCE_EVALUATION_SYSTEM_PROMPT = `Bạn đánh giá phát âm tiếng Việt cho người học. Luôn trả về đúng JSON theo cấu trúc được yêu cầu trong lời nhắc, không thêm markdown, lời chào hoặc nội dung ngoài JSON.`;

export function getAssistantSystemPrompt(context: unknown): string | undefined {
  if (context === 'goodviet-assistant') return GOODVIET_ASSISTANT_SYSTEM_PROMPT;
  if (context === 'sentence-evaluation') return SENTENCE_EVALUATION_SYSTEM_PROMPT;
  return undefined;
}

const normalizeSearchText = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/\u0111/g, 'd');

export function getNavigationFallback(message: string): string | null {
  const normalizedMessage = normalizeSearchText(message);
  const navigationIntent = ['o dau', 'truy cap', 'mo', 'vao', 'di den', 'tim', 'cach', 'lam sao', 'doi', 'xem']
    .some((term) => normalizedMessage.includes(term));
  if (!navigationIntent) return null;

  const feature = GOODVIET_FEATURES.find((item) => item.keywords.some((keyword) =>
    normalizedMessage.includes(normalizeSearchText(keyword))
  ));
  if (!feature) return null;

  const steps = feature.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  return `Bạn có thể mở **${feature.name}** bằng cách chọn **${feature.navigationLabel}** trên thanh điều hướng, hoặc nhấn [Mở ${feature.name}](${feature.path}).\n\n${steps}`;
}
