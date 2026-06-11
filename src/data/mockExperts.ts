export interface Expert {
  expertId: string;
  name: string;
  credentials: string[];
  specializations: string[];
  bio: string;
  averageRating: number; // Changed from 'rating' to match backend
  totalRatings: number; // Added to match backend
  experience: number; // Added to match backend (years of experience)
  totalSessions: number;
  availability: string[]; // Added to match backend
  totalUsers: number;
  status: 'active' | 'probation' | 'terminated';
  profileImageUrl?: string; // Changed from 'avatar' to match backend
}

export const mockExperts: Expert[] = [
  {
    expertId: 'expert-001',
    name: 'ThS. Trần Thị Minh Ngọc',
    credentials: ['Thạc sĩ Âm ngữ trị liệu - ĐH Y Dược TP.HCM', 'Chứng chỉ hành nghề Bộ Y Tế'],
    specializations: ['Phát âm tiếng Việt', 'Rối loạn lưu loát', 'Giao tiếp người lớn'],
    bio: '10 năm kinh nghiệm trong lĩnh vực âm ngữ trị liệu. Chuyên hỗ trợ người lớn cải thiện phát âm và kỹ năng giao tiếp trong môi trường công sở.',
    averageRating: 4.9,
    totalRatings: 142,
    experience: 10,
    totalSessions: 245,
    availability: ['Mon 9-12', 'Wed 14-17', 'Fri 9-12'],
    totalUsers: 38,
    status: 'active',
    profileImageUrl: 'MN',
  },
  {
    expertId: 'expert-002',
    name: 'TS. Nguyễn Hoàng Long',
    credentials: ['Tiến sĩ Ngôn ngữ học ứng dụng - ĐH KHXH&NV', 'Chuyên gia giọng nói'],
    specializations: ['Phân tích giọng nói', 'Thanh điệu tiếng Việt', 'Kỹ năng thuyết trình'],
    bio: 'Nghiên cứu viên và giảng viên với hơn 15 năm kinh nghiệm. Chuyên sâu về phân tích và cải thiện giọng nói cho người Việt.',
    averageRating: 4.8,
    totalRatings: 98,
    experience: 15,
    totalSessions: 189,
    availability: ['Tue 10-13', 'Thu 14-18', 'Sat 9-12'],
    totalUsers: 27,
    status: 'active',
    profileImageUrl: 'HL',
  },
  {
    expertId: 'expert-003',
    name: 'ThS. Lê Phương Anh',
    credentials: ['Thạc sĩ Tâm lý lâm sàng - ĐH Sư phạm Hà Nội', 'Chuyên viên tư vấn giao tiếp'],
    specializations: ['Tự tin giao tiếp', 'Giảm căng thẳng khi nói', 'Kỹ năng phỏng vấn'],
    bio: '8 năm hỗ trợ người đi làm vượt qua rào cản tâm lý trong giao tiếp. Chuyên giúp xây dựng sự tự tin khi trình bày.',
    averageRating: 4.7,
    totalRatings: 76,
    experience: 8,
    totalSessions: 156,
    availability: ['Mon 14-17', 'Wed 9-12', 'Fri 14-17'],
    totalUsers: 22,
    status: 'active',
    profileImageUrl: 'PA',
  },
  {
    expertId: 'expert-004',
    name: 'BS. CKI. Phạm Văn Đức',
    credentials: ['Chuyên khoa I Tai Mũi Họng - ĐH Y Hà Nội', 'Chuyên gia giọng nói y khoa'],
    specializations: ['Rối loạn giọng nói', 'Vấn đề cấu trúc', 'Khám đánh giá y khoa'],
    bio: '12 năm kinh nghiệm trong lĩnh vực Tai Mũi Họng và giọng nói. Hỗ trợ đánh giá chuyên sâu các vấn đề y khoa liên quan đến lời nói.',
    averageRating: 4.9,
    totalRatings: 187,
    experience: 12,
    totalSessions: 312,
    availability: ['Tue 9-12', 'Thu 9-12', 'Sat 14-17'],
    totalUsers: 45,
    status: 'active',
    profileImageUrl: 'VĐ',
  },
];
