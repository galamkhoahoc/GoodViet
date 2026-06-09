export interface AssessmentSentence {
  id: string;
  text: string;
  targetPhonemes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const phaseISentences: AssessmentSentence[] = [
  { id: 'p1-01', text: 'Lúa nếp lên lộc non ngoài nương lúa.', targetPhonemes: ['l', 'n'], difficulty: 'easy' },
  { id: 'p1-02', text: 'Nắng nóng nên người nông dân nghỉ ngơi.', targetPhonemes: ['n', 'ng'], difficulty: 'easy' },
  { id: 'p1-03', text: 'Con chim sẻ sà xuống sân sáng sớm.', targetPhonemes: ['s', 'x'], difficulty: 'easy' },
  { id: 'p1-04', text: 'Trời trong trẻo, tre trúc trên triền dốc.', targetPhonemes: ['tr'], difficulty: 'medium' },
  { id: 'p1-05', text: 'Chú chó chạy chơi ở chân cầu thang.', targetPhonemes: ['ch'], difficulty: 'easy' },
  { id: 'p1-06', text: 'Đường đi đến đỉnh đèo dài dằng dặc.', targetPhonemes: ['đ', 'd'], difficulty: 'medium' },
  { id: 'p1-07', text: 'Giáo viên giảng giải giúp các em hiểu bài.', targetPhonemes: ['gi'], difficulty: 'medium' },
  { id: 'p1-08', text: 'Rừng rậm rạp, rắn rết rình rập khắp nơi.', targetPhonemes: ['r'], difficulty: 'hard' },
  { id: 'p1-09', text: 'Khúc khuỷu khó khăn nhưng không khuất phục.', targetPhonemes: ['kh', 'k'], difficulty: 'hard' },
  { id: 'p1-10', text: 'Phố phường phấn khởi phất phới cờ hoa.', targetPhonemes: ['ph'], difficulty: 'medium' },
  { id: 'p1-11', text: 'Thuỷ thủ thả thuyền theo thủy triều.', targetPhonemes: ['th'], difficulty: 'hard' },
  { id: 'p1-12', text: 'Hoa huệ hương thơm hít hà hạnh phúc.', targetPhonemes: ['h'], difficulty: 'easy' },
];

export const phaseIISentences: AssessmentSentence[] = [
  { id: 'p2-01', text: 'Lan lanh lẹ lên lầu lấy lọ nước.', targetPhonemes: ['l'], difficulty: 'medium' },
  { id: 'p2-02', text: 'Nam nấu nước nóng ngoài nhà ngang.', targetPhonemes: ['n'], difficulty: 'medium' },
  { id: 'p2-03', text: 'Sáng sớm sương sa sà sát sông.', targetPhonemes: ['s'], difficulty: 'hard' },
  { id: 'p2-04', text: 'Trẻ trung trèo trên tràm trắng trụi.', targetPhonemes: ['tr'], difficulty: 'hard' },
  { id: 'p2-05', text: 'Rừng rộn ràng, rộ lên rực rỡ.', targetPhonemes: ['r'], difficulty: 'hard' },
];

export const phaseIIIPrompts = [
  'Hãy kể cho chúng tôi về một ngày làm việc bình thường của bạn.',
  'Bạn thường làm gì vào buổi sáng trước khi đi làm?',
  'Hãy chia sẻ về một kỷ niệm đáng nhớ gần đây.',
  'Bạn có thể mô tả công việc hàng ngày của mình không?',
  'Điều gì khiến bạn muốn cải thiện khả năng giao tiếp?',
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
  overallScore: 72,
  pronunciationIssues: [
    { phoneme: 'l/n', severity: 'moderate', description: 'Nhầm lẫn giữa phụ âm L và N, đặc biệt ở đầu từ' },
    { phoneme: 'tr/ch', severity: 'mild', description: 'Đôi khi phát âm TR thành CH' },
    { phoneme: 's/x', severity: 'mild', description: 'Chưa phân biệt rõ giữa S và X' },
  ],
  speechRate: 145,
  clarityScore: 68,
  fluencyScore: 75,
  confidenceLevel: 'medium',
  regionalAccent: 'southern',
  recommendedPathway: 'pathway-001',
};
