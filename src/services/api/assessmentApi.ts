import { apiClient } from './apiClient';

export interface Assessment {
  _id: string;
  userId: string;
  phase: 'phase_1' | 'phase_2' | 'phase_3';
  phaseIData?: {
    sentences: string[];
    recordings: string[];
  };
  phaseIIData?: {
    sentences: string[];
    recordings: string[];
  };
  phaseIIIData?: {
    recordingId: string;
    duration: number;
  };
  status: 'in_progress' | 'completed' | 'processing';
  overallScore?: number;
  clarityScore?: number;
  fluencyScore?: number;
  pronunciationIssues?: Array<{
    phoneme: string;
    severity: 'mild' | 'moderate' | 'severe';
    description: string;
  }>;
  recommendedPathwayId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  audioUrl?: string;
}

export interface AssessmentSentence {
  sentenceId: string;
  text: string;
  targetPhonemes?: string[];
}

export interface StartAssessmentResponse {
  assessmentId: string;
  phase: 'phase_1';
  sentences: AssessmentSentence[];
}

export interface UploadRecordingResponse {
  recordingId: string;
  assessmentId: string;
  phase: string;
  sentenceId: string;
}

export const assessmentApi = {
  /**
   * Start a new assessment (Phase I)
   */
  async startAssessment(): Promise<StartAssessmentResponse> {
    const response = await apiClient.post<StartAssessmentResponse>('/api/assessments/start');
    return response;
  },

  /**
   * Get current assessment
   */
  async getAssessment(assessmentId: string): Promise<Assessment> {
    const response = await apiClient.get<Assessment>(`/api/assessments/${assessmentId}`);
    return response;
  },

  /**
   * Get assessment result (after completion)
   */
  async getResult(): Promise<Assessment> {
    const response = await apiClient.get<Assessment>('/api/assessments/result');
    return response;
  },

  /**
   * Upload audio recording for a specific phase
   */
  async uploadRecording(
    audioBlob: Blob,
    assessmentId: string,
    phase: string,
    sentenceId: string,
    metadata?: { duration: number; format: string; sampleRate?: number }
  ): Promise<UploadRecordingResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('assessmentId', assessmentId);
    formData.append('phase', phase);
    formData.append('sentenceId', sentenceId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await apiClient.post<UploadRecordingResponse>(
      '/api/audio/upload',
      formData
    );
    return response;
  },

  /**
   * Complete a phase and move to next
   */
  async completePhase(assessmentId: string, phase: string): Promise<{ nextPhase?: string; completed: boolean }> {
    const response = await apiClient.post(`/api/assessments/${assessmentId}/complete-phase`, { phase });
    return response as { nextPhase?: string; completed: boolean };
  },
};
