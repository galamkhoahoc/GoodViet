import { config } from '../../config/env';
import {
  mockAssessmentResult,
  phaseIISentences,
  phaseIIIPrompts,
  phaseISentences,
} from '../../data/mockAssessment';
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
  speechRate?: number;
  confidenceLevel?: 'low' | 'medium' | 'high';
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

export interface CompletePhaseResponse {
  nextPhase?: 'phase_2' | 'phase_3' | 'restart';
  completed: boolean;
  sentences?: AssessmentSentence[];
  message?: string;
  estimatedTime?: number;
}

export interface AssessmentStatusResponse {
  status: 'in_progress' | 'processing' | 'completed' | 'failed';
}

const MOCK_ASSESSMENT_ID = 'assessment-mock-goodviet-01';

const wait = (milliseconds = 180) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const toApiSentences = (
  sentences: Array<{ id: string; text: string; targetPhonemes: string[] }>
): AssessmentSentence[] =>
  sentences.map((sentence) => ({
    sentenceId: sentence.id,
    text: sentence.text,
    targetPhonemes: sentence.targetPhonemes,
  }));

const promptSentences: AssessmentSentence[] = phaseIIIPrompts.map((text, index) => ({
  sentenceId: `p3-${String(index + 1).padStart(2, '0')}`,
  text,
}));

const createMockAssessment = (): Assessment => {
  const now = new Date().toISOString();

  return {
    _id: MOCK_ASSESSMENT_ID,
    userId: 'mock-user-001',
    phase: 'phase_1',
    phaseIData: {
      sentences: phaseISentences.map((sentence) => sentence.id),
      recordings: [],
    },
    phaseIIData: {
      sentences: phaseIISentences.map((sentence) => sentence.id),
      recordings: [],
    },
    status: 'in_progress',
    createdAt: now,
    updatedAt: now,
  };
};

let mockAssessment = createMockAssessment();

const getMockResult = (): Assessment => ({
  ...mockAssessment,
  phase: 'phase_3',
  status: 'completed',
  overallScore: mockAssessmentResult.overallScore,
  clarityScore: mockAssessmentResult.clarityScore,
  fluencyScore: mockAssessmentResult.fluencyScore,
  speechRate: mockAssessmentResult.speechRate,
  confidenceLevel: mockAssessmentResult.confidenceLevel,
  pronunciationIssues: mockAssessmentResult.pronunciationIssues,
  recommendedPathwayId: mockAssessmentResult.recommendedPathway,
  completedAt: mockAssessment.completedAt ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const assessmentApi = {
  resetMockState(): void {
    mockAssessment = createMockAssessment();
  },

  /** Start a new assessment (Phase I). */
  async startAssessment(): Promise<StartAssessmentResponse> {
    if (config.useMockApi) {
      await wait();
      mockAssessment = createMockAssessment();
      return {
        assessmentId: mockAssessment._id,
        phase: 'phase_1',
        sentences: toApiSentences(phaseISentences),
      };
    }

    return apiClient.post<StartAssessmentResponse>('/api/assessments/start');
  },

  /** Get the current assessment. */
  async getAssessment(assessmentId: string): Promise<Assessment> {
    if (config.useMockApi) {
      await wait(80);
      return assessmentId === MOCK_ASSESSMENT_ID ? mockAssessment : getMockResult();
    }

    return apiClient.get<Assessment>(`/api/assessments/${assessmentId}`);
  },

  /** Get the most recent result after completion. */
  async getResult(): Promise<Assessment> {
    if (config.useMockApi) {
      await wait();
      mockAssessment = getMockResult();
      return mockAssessment;
    }

    return apiClient.get<Assessment>('/api/assessments/result');
  },

  /** Upload audio for a specific sentence. */
  async uploadRecording(
    audioBlob: Blob,
    assessmentId: string,
    phase: string,
    sentenceId: string,
    metadata?: { duration: number; format: string; sampleRate?: number }
  ): Promise<UploadRecordingResponse> {
    if (config.useMockApi) {
      await wait(120);
      return {
        recordingId: `mock-recording-${phase}-${sentenceId}-${audioBlob.size}`,
        assessmentId,
        phase,
        sentenceId,
      };
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('assessmentId', assessmentId);
    formData.append('phase', phase);
    formData.append('sentenceId', sentenceId);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return apiClient.post<UploadRecordingResponse>('/api/audio/upload', formData);
  },

  /** Complete a phase and return the data for the next phase. */
  async completePhase(assessmentId: string, phase: string): Promise<CompletePhaseResponse> {
    if (config.useMockApi) {
      await wait();

      if (phase === 'phase_1') {
        mockAssessment = {
          ...mockAssessment,
          phase: 'phase_2',
          updatedAt: new Date().toISOString(),
        };
        return {
          nextPhase: 'phase_2',
          completed: false,
          sentences: toApiSentences(phaseIISentences),
        };
      }

      if (phase === 'phase_2') {
        mockAssessment = {
          ...mockAssessment,
          phase: 'phase_3',
          updatedAt: new Date().toISOString(),
        };
        return {
          nextPhase: 'phase_3',
          completed: false,
          sentences: promptSentences,
        };
      }

      mockAssessment = {
        ...mockAssessment,
        phase: 'phase_3',
        status: 'processing',
        updatedAt: new Date().toISOString(),
      };
      return {
        completed: false,
        message: 'Analysis started',
        estimatedTime: 3,
      };
    }

    return apiClient.post<CompletePhaseResponse>(
      `/api/assessments/${assessmentId}/complete-phase`,
      { phase }
    );
  },

  /** Poll assessment processing status. */
  async getStatus(assessmentId: string): Promise<AssessmentStatusResponse> {
    if (config.useMockApi) {
      await wait(100);
      if (assessmentId !== MOCK_ASSESSMENT_ID) return { status: 'failed' };
      mockAssessment = getMockResult();
      return { status: 'completed' };
    }

    return apiClient.get<AssessmentStatusResponse>(
      `/api/assessments/${assessmentId}/status`
    );
  },
};
