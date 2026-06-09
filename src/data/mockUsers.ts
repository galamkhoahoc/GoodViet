export interface User {
  userId: string;
  email: string;
  name: string;
  age: number;
  phone?: string;
  speechDescription: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
  verifiedEmail: boolean;
  assessmentCompleted: boolean;
  currentPathwayId?: string;
  totalRecordings: number;
  totalPracticeTime: number;
  currentStreak: number;
  longestStreak: number;
}

export const mockUsers: User[] = [
  {
    userId: 'user-001',
    email: 'nguyenvana@gmail.com',
    name: 'Nguyễn Văn A',
    age: 30,
    phone: '0901234567',
    speechDescription: 'Khó phát âm phụ âm l/n, nói hơi nhanh khi trình bày trước đám đông',
    createdAt: '2026-05-01T08:00:00Z',
    lastLoginAt: '2026-06-09T08:00:00Z',
    isActive: true,
    verifiedEmail: true,
    assessmentCompleted: true,
    currentPathwayId: 'pathway-001',
    totalRecordings: 45,
    totalPracticeTime: 320,
    currentStreak: 7,
    longestStreak: 14,
  },
];

export const defaultUser: User = {
  userId: '',
  email: '',
  name: '',
  age: 30,
  speechDescription: '',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  isActive: true,
  verifiedEmail: false,
  assessmentCompleted: false,
  totalRecordings: 0,
  totalPracticeTime: 0,
  currentStreak: 0,
  longestStreak: 0,
};
