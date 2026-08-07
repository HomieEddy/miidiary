export type SttLanguage = "auto" | "en" | "fr-CA";

export type TranscriptionStage = "preparing" | "transcribing" | "finalizing";

export type TranscriptionStageUpdate = {
  stage: TranscriptionStage;
  progress: number;
};

export type TranscribeAudioInput = {
  audioUri: string;
  language?: SttLanguage;
  onStageChange?: (update: TranscriptionStageUpdate) => void;
};

export type TranscribeAudioResult = {
  text: string;
  language: string;
  modelPath: string;
  usedModelFallback: boolean;
};

export class TranscriptionService {
  async transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioResult> {
    input.onStageChange?.({ stage: "preparing", progress: 0 });
    throw new Error("Transcription is not supported on web builds.");
  }

  async resetContexts(): Promise<void> {
    // No-op on web.
  }
}

export const transcriptionService = new TranscriptionService();
