import { config } from '../../config/env';
import { practiceLessons, practiceSummary } from '../../data/mockPractice';
import { apiClient } from './apiClient';

export interface PracticePathway {
  _id: string;
  name: string;
  description: string;
  targetPhonemes: string[];
  durationDays: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
}

export interface PracticeProgress {
  _id: string;
  userId: string;
  pathwayId: string;
  currentWeek: number;
  currentDay: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: string;
  startedAt: string;
  completedAt?: string;
}

export interface DayExercise {
  exerciseId: string;
  type: 'reading' | 'listening' | 'speaking';
  title: string;
  instructions: string;
  sentences?: string[];
  audioUrl?: string;
}

export interface DayContent {
  week: number;
  day: number;
  isRestDay: boolean;
  exercises: DayExercise[];
  videoTutorial?: {
    title: string;
    description: string;
  };
}

export interface CheckinResponse {
  sessionId: string;
  completedAt: string;
  newStreak: number;
  milestoneAchieved?: {
    type: string;
    message: string;
  };
}

export interface PracticeHistoryEntry {
  sessionId: string;
  lessonId: string;
  lessonTitle: string;
  completedAt: string;
  score: number;
}

const mockPathway: PracticePathway = {
  _id: 'goodviet-foundation-01',
  name: 'GOODVIET — Giao tiếp rõ ràng và tự tin',
  description: '10 chủ đề luyện phát âm, nhịp điệu, độ trôi chảy và khả năng trình bày trong đời sống, học tập và công việc.',
  targetPhonemes: ['l', 'n', 's', 'x', 'tr', 'ch', 'hỏi', 'ngã'],
  durationDays: practiceLessons.length,
  level: 'intermediate',
  isActive: true,
};

let mockProgress: PracticeProgress = {
  _id: 'practice-progress-mock-01',
  userId: 'mock-user-001',
  pathwayId: mockPathway._id,
  currentWeek: 1,
  currentDay: 4,
  currentStreak: practiceSummary.currentStreak,
  longestStreak: practiceSummary.longestStreak,
  lastCheckIn: '2026-07-18T08:30:00.000Z',
  startedAt: '2026-07-05T08:30:00.000Z',
};

const createFreshMockProgress = (): PracticeProgress => ({
  _id: 'practice-progress-mock-01',
  userId: 'mock-user-001',
  pathwayId: mockPathway._id,
  currentWeek: 1,
  currentDay: 1,
  currentStreak: 0,
  longestStreak: 0,
  startedAt: new Date().toISOString(),
});

let mockHistory: PracticeHistoryEntry[] = practiceLessons.slice(0, 3).map((lesson, index) => ({
  sessionId: `mock-history-${index + 1}`,
  lessonId: lesson.id,
  lessonTitle: lesson.title,
  completedAt: new Date(Date.UTC(2026, 6, 17 - index)).toISOString(),
  score: 78 + index * 4,
}));
let mockGeneration = 0;

const wait = (milliseconds = 160) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const getLessonForDay = (week: number, day: number) => {
  const ordinal = Math.max(0, (week - 1) * 7 + day - 1);
  return practiceLessons[ordinal % practiceLessons.length];
};

export const practiceApi = {
  resetMockState(): void {
    mockGeneration += 1;
    mockProgress = createFreshMockProgress();
    mockHistory = [];
  },

  async getPathways(): Promise<{ pathways: PracticePathway[] }> {
    if (config.useMockApi) {
      await wait();
      return { pathways: [mockPathway] };
    }

    const response = await apiClient.get<{ success: boolean; pathways: PracticePathway[] }>(
      '/api/practice/pathways'
    );
    return { pathways: response.pathways };
  },

  async startPathway(pathwayId: string): Promise<{
    progressId: string;
    pathwayId: string;
    currentWeek: number;
    currentDay: number;
    message?: string;
  }> {
    if (config.useMockApi) {
      const requestGeneration = mockGeneration;
      await wait();
      if (requestGeneration === mockGeneration) {
        mockProgress = {
          ...mockProgress,
          pathwayId,
          currentWeek: 1,
          currentDay: 1,
          startedAt: new Date().toISOString(),
        };
      }
      return {
        progressId: mockProgress._id,
        pathwayId,
        currentWeek: 1,
        currentDay: 1,
        message: 'Đã bắt đầu lộ trình luyện tập.',
      };
    }

    return apiClient.post('/api/practice/start', { pathwayId });
  },

  async getProgress(): Promise<PracticeProgress & {
    pathway: PracticePathway;
    completedSessions: number;
    completionPercentage: number;
  }> {
    if (config.useMockApi) {
      await wait();
      const completedSessions = mockHistory.length;
      return {
        ...mockProgress,
        pathway: mockPathway,
        completedSessions,
        completionPercentage: Math.round(
          (completedSessions / practiceSummary.totalLessons) * 100
        ),
      };
    }

    return apiClient.get('/api/practice/progress');
  },

  async getDayExercises(week: number, day: number): Promise<DayContent> {
    if (config.useMockApi) {
      await wait();
      const lesson = getLessonForDay(week, day);
      return {
        week,
        day,
        isRestDay: false,
        videoTutorial: {
          title: lesson.title,
          description: lesson.goal,
        },
        exercises: [
          {
            exerciseId: `${lesson.id}-short`,
            type: 'reading',
            title: 'Khởi động với câu ngắn',
            instructions: 'Đọc chậm từng câu, chú ý phát âm trọn vẹn và ngắt nghỉ tự nhiên.',
            sentences: lesson.shortSentences,
          },
          {
            exerciseId: `${lesson.id}-long`,
            type: 'speaking',
            title: 'Luyện đọc đoạn dài',
            instructions: lesson.goal,
            sentences: lesson.longPassages,
          },
        ],
      };
    }

    return apiClient.get<DayContent>(`/api/practice/day/${week}/${day}`);
  },

  async checkin(week: number, day: number, exercisesCompleted: number): Promise<CheckinResponse> {
    if (config.useMockApi) {
      const requestGeneration = mockGeneration;
      await wait();
      const completedAt = new Date().toISOString();
      const lesson = getLessonForDay(week, day);
      if (requestGeneration === mockGeneration) {
        mockProgress = {
          ...mockProgress,
          currentWeek: week,
          currentDay: day,
          currentStreak: mockProgress.currentStreak + 1,
          lastCheckIn: completedAt,
        };
        mockHistory = [{
          sessionId: `mock-session-w${week}-d${day}`,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          completedAt,
          score: exercisesCompleted >= 2 ? 100 : 70,
        }, ...mockHistory];
      }
      return {
        sessionId: `mock-session-w${week}-d${day}`,
        completedAt,
        newStreak: mockProgress.currentStreak,
        milestoneAchieved:
          exercisesCompleted >= 2
            ? { type: 'daily_goal', message: 'Bạn đã hoàn thành mục tiêu luyện tập hôm nay!' }
            : undefined,
      };
    }

    return apiClient.post<CheckinResponse>('/api/practice/checkin', {
      week,
      day,
      exercisesCompleted,
    });
  },

  async uploadPracticeRecording(
    audioBlob: Blob,
    week: number,
    day: number,
    exerciseId: string
  ): Promise<{ recordingId: string }> {
    if (config.useMockApi) {
      await wait(100);
      return { recordingId: `mock-practice-${week}-${day}-${exerciseId}-${audioBlob.size}` };
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'practice-recording.webm');
    formData.append('week', week.toString());
    formData.append('day', day.toString());
    formData.append('exerciseId', exerciseId);

    return apiClient.post<{ recordingId: string }>('/api/practice/recording', formData);
  },

  async getHistory(): Promise<{ history: PracticeHistoryEntry[] }> {
    if (config.useMockApi) {
      await wait();
      return { history: [...mockHistory] };
    }

    const response = await apiClient.get<{
      success: boolean;
      history: PracticeHistoryEntry[];
    }>('/api/practice/history');
    return { history: response.history };
  },
};
