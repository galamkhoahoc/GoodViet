import { apiClient } from './apiClient';

export interface Expert {
  _id: string;
  fullName: string;
  licenseNumber: string;
  specializations: string[];
  bio: string;
  experience: number;
  rating: number;
  totalSessions: number;
  availability: string[];
  profileImage?: string;
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
  async requestConnection(expertId: string): Promise<{ connectionId: string }> {
    const response = await apiClient.post<{ connectionId: string }>('/api/experts/connections', {
      expertId,
    });
    return response;
  },

  /**
   * Get user's expert connections
   */
  async getConnections(): Promise<{ connections: ExpertConnection[] }> {
    const response = await apiClient.get<{ connections: ExpertConnection[] }>(
      '/api/experts/connections'
    );
    return response;
  },

  /**
   * Book a session with an expert
   */
  async bookSession(
    expertId: string,
    scheduledAt: string,
    duration: number,
    sessionType: 'consultation' | 'therapy' | 'follow-up'
  ): Promise<{ sessionId: string }> {
    const response = await apiClient.post<{ sessionId: string }>('/api/experts/sessions', {
      expertId,
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
    const response = await apiClient.get<{ sessions: ExpertSession[] }>('/api/experts/sessions');
    return response;
  },
};
