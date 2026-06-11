export interface User {
  userId: string;
  email: string;
  fullName: string; // Aligned with backend
  age: number;
  phoneNumber?: string; // Aligned with backend
  targetGoals?: string; // Aligned with backend (formerly speechDescription)
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
    fullName: 'Nguyễn Văn A',
    age: 30,
    phoneNumber: '0901234567',
    targetGoals: 'Khó phát âm phụ âm l/n, nói hơi nhanh khi trình bày trước đám đông',
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
  fullName: '',
  age: 30,
  targetGoals: '',
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
