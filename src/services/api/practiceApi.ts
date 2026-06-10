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

export const practiceApi = {
  /**
   * Get all available practice pathways
   */
  async getPathways(): Promise<{ pathways: PracticePathway[] }> {
    const response = await apiClient.get<{ success: boolean; pathways: PracticePathway[] }>(
      '/api/practice/pathways'
    );
    return { pathways: response.pathways };
  },

  /**
   * Start a practice pathway
   */
  async startPathway(pathwayId: string): Promise<{
    progressId: string;
    pathwayId: string;
    currentWeek: number;
    currentDay: number;
    message?: string;
  }> {
    const response = await apiClient.post<any>('/api/practice/start', { pathwayId });
    return response;
  },

  /**
   * Get user's practice progress
   */
  async getProgress(): Promise<PracticeProgress & {
    pathway: PracticePathway;
    completedSessions: number;
    completionPercentage: number;
  }> {
    const response = await apiClient.get<any>('/api/practice/progress');
    return response;
  },

  /**
   * Get exercises for a specific day
   */
  async getDayExercises(week: number, day: number): Promise<DayContent> {
    const response = await apiClient.get<DayContent>(`/api/practice/day/${week}/${day}`);
    return response;
  },

  /**
   * Record daily check-in
   */
  async checkin(week: number, day: number, exercisesCompleted: number): Promise<CheckinResponse> {
    const response = await apiClient.post<CheckinResponse>('/api/practice/checkin', {
      week,
      day,
      exercisesCompleted,
    });
    return response;
  },

  /**
   * Upload practice recording
   */
  async uploadPracticeRecording(
    audioBlob: Blob,
    week: number,
    day: number,
    exerciseId: string
  ): Promise<{ recordingId: string }> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'practice-recording.webm');
    formData.append('week', week.toString());
    formData.append('day', day.toString());
    formData.append('exerciseId', exerciseId);

    const response = await apiClient.post<{ recordingId: string }>(
      '/api/practice/recording',
      formData
    );
    return response;
  },
};
