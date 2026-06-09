import { create } from 'zustand';

export type AssessmentPhase = 'not_started' | 'intro' | 'phase_1' | 'phase_2' | 'phase_3' | 'processing' | 'results';

interface RecordingEntry {
  sentenceId: string;
  blob?: Blob;
  duration: number;
  timestamp: string;
  indexedDBId?: string; // Reference to IndexedDB stored recording
}

interface AssessmentState {
  phase: AssessmentPhase;
  recordings: RecordingEntry[];
  phaseIErrors: string[];
  restartCount: number;
  completed: boolean;
  setPhase: (phase: AssessmentPhase) => void;
  addRecording: (entry: RecordingEntry) => void;
  setPhaseIErrors: (errors: string[]) => void;
  restart: () => void;
  completeAssessment: () => void;
  reset: () => void;
  loadFromStorage: (userId: string) => void;
  saveToStorage: (userId: string) => void;
  getRecordingForSentence: (sentenceId: string) => RecordingEntry | undefined;
}

const ASSESSMENT_KEY = 'goodviet_assessment_';

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  phase: 'not_started',
  recordings: [],
  phaseIErrors: [],
  restartCount: 0,
  completed: false,

  setPhase: (phase) => {
    set({ phase });
    // Auto-save phase transitions
  },

  addRecording: (entry) => {
    set(state => ({
      // Replace existing recording for same sentence (re-recording)
      recordings: [
        ...state.recordings.filter(r => r.sentenceId !== entry.sentenceId),
        entry,
      ],
    }));
  },

  setPhaseIErrors: (errors) => {
    set({ phaseIErrors: errors });
  },

  restart: () => {
    const { restartCount } = get();
    if (restartCount >= 3) return;
    set({
      phase: 'phase_1',
      recordings: [],
      phaseIErrors: [],
      restartCount: restartCount + 1,
    });
  },

  completeAssessment: () => {
    set({ completed: true, phase: 'results' });
  },

  reset: () => {
    set({
      phase: 'not_started',
      recordings: [],
      phaseIErrors: [],
      restartCount: 0,
      completed: false,
    });
  },

  loadFromStorage: (userId: string) => {
    try {
      const saved = localStorage.getItem(ASSESSMENT_KEY + userId);
      if (saved) {
        const data = JSON.parse(saved);
        set({
          phase: data.phase || 'not_started',
          phaseIErrors: data.phaseIErrors || [],
          restartCount: data.restartCount || 0,
          completed: data.completed || false,
        });
      }
    } catch { /* ignore */ }
  },

  saveToStorage: (userId: string) => {
    const { phase, phaseIErrors, restartCount, completed } = get();
    localStorage.setItem(ASSESSMENT_KEY + userId, JSON.stringify({
      phase, phaseIErrors, restartCount, completed,
    }));
  },

  getRecordingForSentence: (sentenceId: string) => {
    return get().recordings.find(r => r.sentenceId === sentenceId);
  },
}));
