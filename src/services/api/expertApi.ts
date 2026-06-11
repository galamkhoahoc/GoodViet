import { apiClient } from './apiClient';

export interface Expert {
  _id: string;
  fullName: string;
  licenseNumber: string;
  specializations: string[];
  bio: string;
  experience: number;
  averageRating: number; // Aligned with backend
  totalRatings: number; // Aligned with backend
  totalSessions: number;
  availability: string[];
  profileImageUrl?: string; // Aligned with backend
}

export interface ExpertConnection {
  _id: string;
  userId: string;
  expertId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ExpertSession {
  _id: string;
  connectionId: string;
  scheduledAt: string;
  duration: number;
  sessionType: 'consultation' | 'therapy' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
}

export const expertApi = {
  /**
   * Get list of all experts
   */
  async getExperts(): Promise<{ experts: Expert[] }> {
    const response = await apiClient.get<{ success: boolean; experts: Expert[] }>('/api/experts');
    return { experts: response.experts };
  },

  /**
   * Get expert details
   */
  async getExpert(expertId: string): Promise<Expert> {
    const response = await apiClient.get<Expert>(`/api/experts/${expertId}`);
    return response;
  },

  /**
   * Request connection with an expert
   */
  async requestConnection(expertId: string): Promise<{ connectionId: string; status: string }> {
    const response = await apiClient.post<{ connectionId: string; status: string }>('/api/expert-connections', {
      expertId,
    });
    return response;
  },

  /**
   * Get user's expert connections
   */
  async getConnections(): Promise<{ connections: ExpertConnection[] }> {
    const response = await apiClient.get<{ success: boolean; connections: ExpertConnection[] }>(
      '/api/expert-connections'
    );
    return response;
  },

  /**
   * Book a session with an expert
   */
  async bookSession(
    connectionId: string, // Changed from expertId to connectionId
    scheduledAt: string,
    duration: number,
    sessionType: 'consultation' | 'therapy' | 'follow-up'
  ): Promise<{ sessionId: string; meetingUrl: string }> {
    const response = await apiClient.post<{ sessionId: string; meetingUrl: string }>('/api/expert-sessions', {
      connectionId, // Fixed parameter name
      scheduledAt,
      duration,
      sessionType,
    });
    return response;
  },

  /**
   * Get user's sessions
   */
  async getSessions(): Promise<{ sessions: ExpertSession[] }> {
    const response = await apiClient.get<{ success: boolean; sessions: ExpertSession[] }>('/api/expert-sessions');
    return response;
  },

  /**
   * Rate a session
   */
  async rateSession(sessionId: string, rating: number, feedback?: string): Promise<{ success: boolean }> {
    const response = await apiClient.patch<{ success: boolean }>(`/api/expert-sessions/${sessionId}/rate`, {
      rating,
      feedback,
    });
    return response;
  },
};
