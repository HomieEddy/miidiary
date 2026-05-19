import { initWhisper, type WhisperContext } from "whisper.rn";
import { modelManager, type SttLanguage } from "@/services/modelManager";

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

type ContextCacheItem = {
  context: WhisperContext;
  modelPath: string;
};

function emitStage(
  onStageChange: ((update: TranscriptionStageUpdate) => void) | undefined,
  stage: TranscriptionStage,
  progress: number,
): void {
  onStageChange?.({ stage, progress });
}

function normalizeLanguage(language: SttLanguage | undefined): SttLanguage {
  return language ?? "en";
}

export class TranscriptionService {
  private readonly contextCache = new Map<string, ContextCacheItem>();

  async transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioResult> {
    const language = normalizeLanguage(input.language);

    emitStage(input.onStageChange, "preparing", 0);
    const selectedModel = await modelManager.resolveModel(language);
    const context = await this.getOrCreateContext(selectedModel.modelPath);

    emitStage(input.onStageChange, "transcribing", 10);
    const task = context.transcribe(input.audioUri, {
      language,
      onProgress: (progress) => {
        const bounded = Math.min(100, Math.max(0, progress));
        emitStage(input.onStageChange, "transcribing", bounded);
      },
    });
    const result = await task.promise;

    emitStage(input.onStageChange, "finalizing", 100);
    const text = result.result.trim();
    if (!text) {
      throw new Error("Transcription produced empty text");
    }

    return {
      text,
      language: result.language || language,
      modelPath: selectedModel.modelPath,
      usedModelFallback: selectedModel.fallbackUsed,
    };
  }

  async resetContexts(): Promise<void> {
    for (const item of this.contextCache.values()) {
      await item.context.release();
    }

    this.contextCache.clear();
    modelManager.resetCache();
  }

  private async getOrCreateContext(modelPath: string): Promise<WhisperContext> {
    const existing = this.contextCache.get(modelPath);
    if (existing) {
      return existing.context;
    }

    const context = await initWhisper({
      filePath: modelPath,
      isBundleAsset: false,
      useGpu: true,
      useCoreMLIos: true,
    });
    this.contextCache.set(modelPath, { context, modelPath });

    return context;
  }
}

export const transcriptionService = new TranscriptionService();