import { create } from 'zustand';

export type RecordingStatus = 'idle' | 'recording' | 'processing' | 'call-paused' | 'error';
export type ProcessingStage =
  | 'idle'
  | 'preparing'
  | 'transcribing'
  | 'classifying'
  | 'persisting'
  | 'finalizing';

interface RecordingState {
  /** Monotonic session id; bumped on every startRecording so late async
   *  completions from a previous session can be detected and ignored. */
  sessionId: number;
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  processingStage: ProcessingStage;
  duration: number;
  metering: number;
  status: RecordingStatus;
  errorMessage: string | null;
  interruptionMarkers: number[];

  setRecording: (val: boolean) => void;
  setPaused: (val: boolean) => void;
  setProcessing: (val: boolean) => void;
  setProcessingStage: (stage: ProcessingStage) => void;
  setDuration: (ms: number) => void;
  setMetering: (val: number) => void;
  setStatus: (s: RecordingStatus) => void;
  setError: (msg: string | null) => void;
  resume: () => void;
  addInterruptionMarker: (timestampMs: number) => void;
  reset: () => void;
}

const initialState = {
  sessionId: 0,
  isRecording: false,
  isPaused: false,
  isProcessing: false,
  processingStage: 'idle' as ProcessingStage,
  duration: 0,
  metering: 0,
  status: 'idle' as RecordingStatus,
  errorMessage: null,
  interruptionMarkers: [],
};

export const useRecordingStore = create<RecordingState>((set, get) => ({
  ...initialState,

  setRecording: (val) => set((state) => (val
    ? {
        isRecording: true,
        status: 'recording',
        isPaused: false,
        duration: 0,
        errorMessage: null,
        sessionId: state.sessionId + 1,
      }
    : { isRecording: false, status: 'idle' })),

  setPaused: (val) => set((state) => ({
    isPaused: val,
    status: val ? 'call-paused' : state.isRecording ? 'recording' : 'idle',
  })),

  setProcessing: (val) => set({
    isProcessing: val,
    processingStage: val ? get().processingStage === 'idle' ? 'preparing' : get().processingStage : 'idle',
    status: val ? 'processing' : 'idle',
  }),

  setProcessingStage: (stage) => set({ processingStage: stage }),

  setDuration: (ms) => set({ duration: ms }),

  setMetering: (val) => set({ metering: val }),

  setStatus: (s) => set({ status: s }),

  setError: (msg) => set({
    errorMessage: msg,
    status: msg ? 'error' : get().status === 'error' ? 'idle' : get().status,
  }),

  resume: () => set({
    isPaused: false,
    status: 'recording',
  }),

  addInterruptionMarker: (timestampMs) => set((state) => ({
    interruptionMarkers: [...state.interruptionMarkers, timestampMs],
  })),

  reset: () => set(initialState),
}));
