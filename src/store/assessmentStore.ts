import { create } from 'zustand';
import { assessmentApi } from '../services/api/assessmentApi';
import type { Assessment, AssessmentSentence } from '../services/api/assessmentApi';

export type AssessmentPhase = 'not_started' | 'intro' | 'phase_1' | 'phase_2' | 'phase_3' | 'processing' | 'results';

interface RecordingEntry {
  sentenceId: string;
  blob?: Blob;
  duration: number;
  timestamp: string;
  indexedDBId?: string;
}

interface AssessmentState {
  assessmentId: string | null;
  phase: AssessmentPhase;
  sentences: AssessmentSentence[];
  recordings: RecordingEntry[];
  result: Assessment | null;
  completed: boolean;
  isLoading: boolean;
  
  startAssessment: () => Promise<void>;
  completeCurrentPhase: () => Promise<void>;
  checkStatus: () => Promise<void>;
  loadResult: () => Promise<void>;
  
  setPhase: (phase: AssessmentPhase) => void;
  addRecording: (entry: RecordingEntry) => void;
  reset: () => void;
  getRecordingForSentence: (sentenceId: string) => RecordingEntry | undefined;
}

let assessmentGeneration = 0;

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessmentId: null,
  phase: 'not_started',
  sentences: [],
  recordings: [],
  result: null,
  completed: false,
  isLoading: false,

  startAssessment: async () => {
    const requestGeneration = assessmentGeneration;
    set({ isLoading: true });
    try {
      const response = await assessmentApi.startAssessment();
      if (requestGeneration !== assessmentGeneration) return;
      set({ 
        assessmentId: response.assessmentId, 
        phase: response.phase as AssessmentPhase,
        sentences: response.sentences,
        isLoading: false 
      });
    } catch (err) {
      console.error('Failed to start assessment:', err);
      if (requestGeneration === assessmentGeneration) set({ isLoading: false });
    }
  },

  completeCurrentPhase: async () => {
    const requestGeneration = assessmentGeneration;
    const { assessmentId, phase } = get();
    if (!assessmentId) return;
    
    set({ isLoading: true });
    try {
      if (phase === 'phase_1' || phase === 'phase_2' || phase === 'phase_3') {
        // Ensure all offline recordings are uploaded before completing phase
        const { useSyncStore } = await import('../services/storage/syncManager');
        await useSyncStore.getState().syncNow();
        if (requestGeneration !== assessmentGeneration) return;

        const response = await assessmentApi.completePhase(assessmentId, phase);
        if (requestGeneration !== assessmentGeneration) return;
        
        if (response.nextPhase === 'restart') {
          // Trigger restart
          alert(response.message || 'Cần làm lại bài test từ đầu do có mâu thuẫn trong kết quả đánh giá.');
          get().reset();
          return;
        } else if (response.nextPhase) {
          set({ 
            phase: response.nextPhase as AssessmentPhase,
            sentences: response.sentences || [],
            isLoading: false
          });
        } else if (response.message === 'Analysis started' || response.estimatedTime) {
          // It moved to processing
          set({ phase: 'processing', isLoading: false });
        }
      }
    } catch (err) {
      console.error('Failed to complete phase:', err);
      if (requestGeneration === assessmentGeneration) set({ isLoading: false });
    }
  },

  checkStatus: async () => {
    const requestGeneration = assessmentGeneration;
    const { assessmentId } = get();
    if (!assessmentId) return;
    
    try {
      const res = await assessmentApi.getStatus(assessmentId);
      if (requestGeneration !== assessmentGeneration) return;
      if (res.status === 'completed') {
        set({ phase: 'results', completed: true });
        await get().loadResult();
      } else if (res.status === 'failed') {
        console.error('Analysis failed');
      }
    } catch (err) {
      console.error('Failed to check status:', err);
    }
  },

  loadResult: async () => {
    const requestGeneration = assessmentGeneration;
    try {
      set({ isLoading: true });
      const result = await assessmentApi.getResult();
      if (requestGeneration !== assessmentGeneration) return;
      set({ result, completed: true, phase: 'results', isLoading: false });
    } catch (err) {
      console.error('Failed to load result:', err);
      if (requestGeneration === assessmentGeneration) set({ isLoading: false });
    }
  },

  setPhase: (phase) => set({ phase }),

  addRecording: (entry) => {
    set(state => ({
      recordings: [
        ...state.recordings.filter(r => r.sentenceId !== entry.sentenceId),
        entry,
      ],
    }));
  },

  reset: () => {
    assessmentGeneration += 1;
    set({
      assessmentId: null,
      phase: 'not_started',
      sentences: [],
      recordings: [],
      result: null,
      completed: false,
      isLoading: false,
    });
  },

  getRecordingForSentence: (sentenceId: string) => {
    return get().recordings.find(r => r.sentenceId === sentenceId);
  },
}));
