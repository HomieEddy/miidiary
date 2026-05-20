import { initWhisper, type WhisperContext } from "whisper.rn";
import { NativeModules, Platform } from "react-native";
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

type AudioPcmDecoderModule = {
  decodeToPcm16Base64: (audioUri: string) => Promise<string>;
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

function isWavUri(audioUri: string): boolean {
  return audioUri.trim().toLowerCase().endsWith(".wav");
}

function isBlankTranscription(text: string): boolean {
  const normalized = text.trim().toLowerCase();

  return (
    normalized.length === 0 ||
    normalized === "[blank_audio]" ||
    normalized === "[silence]" ||
    normalized === "(silence)"
  );
}

function getAudioPcmDecoder(): AudioPcmDecoderModule {
  const decoder = NativeModules.AudioPcmDecoder as AudioPcmDecoderModule | undefined;
  if (!decoder) {
    throw new Error("Android audio decoder is unavailable in this build.");
  }

  return decoder;
}

export class TranscriptionService {
  private readonly contextCache = new Map<string, ContextCacheItem>();

  async transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioResult> {
    const language = normalizeLanguage(input.language);

    emitStage(input.onStageChange, "preparing", 0);
    const selectedModel = await modelManager.resolveModel(language);
    let context: WhisperContext;
    let activeModel = selectedModel;
    try {
      context = await this.getOrCreateContext(activeModel.modelPath);
    } catch {
      modelManager.markModelUnavailable(activeModel.modelPath);
      activeModel = await modelManager.resolveModel(language);
      context = await this.getOrCreateContext(activeModel.modelPath);
    }

    emitStage(input.onStageChange, "transcribing", 10);
    const onProgress = (progress: number) => {
      const bounded = Math.min(100, Math.max(0, progress));
      emitStage(input.onStageChange, "transcribing", bounded);
    };

    const task = isWavUri(input.audioUri)
      ? context.transcribe(input.audioUri, {
          language,
          onProgress,
        })
      : context.transcribeData(await this.decodeCompressedAudio(input.audioUri), {
          language,
          onProgress,
        });
    const result = await task.promise;

    emitStage(input.onStageChange, "finalizing", 100);
    const text = result.result.trim();
    if (isBlankTranscription(text)) {
      throw new Error("No speech detected. Try speaking closer to the microphone.");
    }

    return {
      text,
      language: result.language || language,
      modelPath: activeModel.modelPath,
      usedModelFallback: activeModel.fallbackUsed,
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

  private async decodeCompressedAudio(audioUri: string): Promise<string> {
    if (Platform.OS !== "android") {
      throw new Error("Compressed recording transcription is only supported on Android.");
    }

    const pcmBase64 = await getAudioPcmDecoder().decodeToPcm16Base64(audioUri);
    if (!pcmBase64.trim()) {
      throw new Error("Unable to decode recorded audio for transcription.");
    }

    return pcmBase64;
  }
}

export const transcriptionService = new TranscriptionService();
