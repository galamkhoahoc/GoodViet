export type AssessmentFocusCategory =
  | 'initial_consonant'
  | 'tone'
  | 'speech_rate'
  | 'connected_speech'
  | 'articulation'
  | 'breath'
  | 'prosody';

export interface AssessmentSentence {
  id: string;
  text: string;
  targetPhonemes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  focus: {
    category: AssessmentFocusCategory;
    label: string;
    targets: string[];
  };
}

/**
 * Phần 1: sàng lọc các cặp phụ âm đầu và thanh điệu thường gặp.
 */
export const phaseISentences: AssessmentSentence[] = [
  {
    id: 'p1-01',
    text: 'Năm nay, năng suất lao động nông nghiệp tăng đáng kể so với cùng kỳ.',
    targetPhonemes: ['l', 'n'],
    difficulty: 'easy',
    focus: { category: 'initial_consonant', label: 'Phân biệt L/N', targets: ['L', 'N'] },
  },
  {
    id: 'p1-02',
    text: 'Lúc lên núi lấy nước, lão nông nói năng lưu loát.',
    targetPhonemes: ['l', 'n'],
    difficulty: 'medium',
    focus: { category: 'initial_consonant', label: 'Phân biệt L/N', targets: ['L', 'N'] },
  },
  {
    id: 'p1-03',
    text: 'Sáng sớm, sương sà xuống sát sườn núi san sát.',
    targetPhonemes: ['s', 'x'],
    difficulty: 'medium',
    focus: { category: 'initial_consonant', label: 'Phân biệt S/X', targets: ['S', 'X'] },
  },
  {
    id: 'p1-04',
    text: 'Xưởng sản xuất xuất xưởng lô xe xích mới xem xét xong.',
    targetPhonemes: ['s', 'x'],
    difficulty: 'hard',
    focus: { category: 'initial_consonant', label: 'Phân biệt S/X', targets: ['S', 'X'] },
  },
  {
    id: 'p1-05',
    text: 'Trưa thứ tư, trưởng trạm trân trọng trao trả toàn bộ số tiền cho chàng trai.',
    targetPhonemes: ['tr', 'ch'],
    difficulty: 'hard',
    focus: { category: 'initial_consonant', label: 'Phân biệt TR/CH', targets: ['TR', 'CH'] },
  },
  {
    id: 'p1-06',
    text: 'Chị Châu cẩn thận che chắn chậu cây chanh trước hiên nhà.',
    targetPhonemes: ['tr', 'ch'],
    difficulty: 'medium',
    focus: { category: 'initial_consonant', label: 'Phân biệt TR/CH', targets: ['TR', 'CH'] },
  },
  {
    id: 'p1-07',
    text: 'Gia đình Giáp vừa giải quyết việc vay vốn doanh nghiệp dịp giữa năm.',
    targetPhonemes: ['v', 'd', 'gi'],
    difficulty: 'hard',
    focus: { category: 'initial_consonant', label: 'Phân biệt V/D/GI', targets: ['V', 'D', 'GI'] },
  },
  {
    id: 'p1-08',
    text: 'Vào vườn dạo quanh, vạn vật dường như vô cùng vui vẻ.',
    targetPhonemes: ['v', 'd', 'gi'],
    difficulty: 'medium',
    focus: { category: 'initial_consonant', label: 'Phân biệt V/D/GI', targets: ['V', 'D', 'GI'] },
  },
  {
    id: 'p1-09',
    text: 'Những băn khoăn trăn trở của tổ trưởng đã được thảo luận kỹ lưỡng.',
    targetPhonemes: ['hỏi', 'ngã'],
    difficulty: 'hard',
    focus: { category: 'tone', label: 'Phân biệt thanh hỏi/ngã', targets: ['Thanh hỏi', 'Thanh ngã'] },
  },
  {
    id: 'p1-10',
    text: 'Mẫu mã sản phẩm lỗi dễ dãi bị loại bỏ tại xưởng mỹ phẩm.',
    targetPhonemes: ['hỏi', 'ngã'],
    difficulty: 'hard',
    focus: { category: 'tone', label: 'Phân biệt thanh hỏi/ngã', targets: ['Thanh hỏi', 'Thanh ngã'] },
  },
];

/**
 * Phần 2: câu dài dùng để đo tốc độ, độ rõ, hơi thở và nhịp điệu.
 */
export const phaseIISentences: AssessmentSentence[] = [
  {
    id: 'p2-01',
    text: 'Dự án đường sắt đô thị đang được đẩy nhanh tiến độ để đảm bảo hoàn thành đúng thời hạn cam kết với ban quản lý.',
    targetPhonemes: [],
    difficulty: 'hard',
    focus: { category: 'speech_rate', label: 'Tốc độ và hiện tượng nuốt chữ', targets: ['Tốc độ nói', 'Độ đầy đủ của từ'] },
  },
  {
    id: 'p2-02',
    text: 'Nếu nhà đầu tư đồng ý giải ngân, ngân hàng sẽ tiến hành rà soát hàng loạt hồ sơ liên quan đến tài sản thế chấp.',
    targetPhonemes: [],
    difficulty: 'hard',
    focus: { category: 'connected_speech', label: 'Nói liền và dính âm', targets: ['Ranh giới từ', 'Độ liền mạch'] },
  },
  {
    id: 'p2-03',
    text: 'Phân tích báo cáo tài chính quý tư cho thấy doanh thu tăng trưởng bất chấp những biến động khôn lường từ thị trường.',
    targetPhonemes: [],
    difficulty: 'hard',
    focus: { category: 'articulation', label: 'Độ rõ và biên độ khẩu hình', targets: ['Độ rõ', 'Khẩu hình'] },
  },
  {
    id: 'p2-04',
    text: 'Chúng tôi xin chân thành cảm ơn quý khách hàng đã luôn tin tưởng, đồng hành và sử dụng dịch vụ của công ty trong suốt nhiều năm qua.',
    targetPhonemes: [],
    difficulty: 'hard',
    focus: { category: 'breath', label: 'Kiểm soát hơi thở', targets: ['Hơi thở', 'Điểm lấy hơi'] },
  },
  {
    id: 'p2-05',
    text: 'Theo quy định mới nhất của bộ phận nhân sự, nhân viên đi muộn nhiều lần trong một tháng không có lý do chính đáng sẽ bị trừ vào lương cơ bản.',
    targetPhonemes: [],
    difficulty: 'hard',
    focus: { category: 'prosody', label: 'Ngắt nghỉ và nhịp điệu', targets: ['Điểm ngắt', 'Nhịp điệu'] },
  },
];

export const phaseIIIPrompts = [
  'Hãy kể lại một tình huống bạn gặp khó khăn khi phải giải thích một vấn đề phức tạp cho đồng nghiệp hoặc khách hàng, và cách bạn giải quyết nó.',
  'Miêu tả ngắn gọn một dự án, hoặc một công việc bạn cảm thấy tự hào nhất trong năm vừa qua.',
  'Theo bạn, yếu tố quan trọng nhất để duy trì một môi trường làm việc tích cực là gì? Hãy chia sẻ lý do của bạn.',
  'Hãy nhớ lại một lần bạn bị phê bình hoặc gặp phản ứng gay gắt trong công việc. Lúc đó bạn cảm thấy thế nào và đã xử lý ra sao?',
  'Hãy kể về một kỷ niệm vui hoặc đáng nhớ trong những ngày đầu tiên bạn bước chân vào môi trường công sở.',
];

export interface AssessmentResult {
  overallScore: number;
  pronunciationIssues: {
    phoneme: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
  }[];
  speechRate: number;
  clarityScore: number;
  fluencyScore: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  regionalAccent: 'northern' | 'central' | 'southern' | 'mixed';
  recommendedPathway: string;
}

export const mockAssessmentResult: AssessmentResult = {
  overallScore: 74,
  pronunciationIssues: [
    {
      phoneme: 'l/n',
      severity: 'moderate',
      description: 'Đôi lúc nhầm lẫn giữa phụ âm L và N ở đầu từ; nên luyện theo cặp đối chiếu.',
    },
    {
      phoneme: 's/x',
      severity: 'mild',
      description: 'Âm S chưa đủ độ bật hơi nên đôi khi nghe gần với âm X.',
    },
    {
      phoneme: 'hỏi/ngã',
      severity: 'mild',
      description: 'Đường nét thanh hỏi và thanh ngã chưa ổn định ở câu dài.',
    },
  ],
  speechRate: 142,
  clarityScore: 72,
  fluencyScore: 77,
  confidenceLevel: 'medium',
  regionalAccent: 'southern',
  recommendedPathway: 'goodviet-foundation-01',
};
