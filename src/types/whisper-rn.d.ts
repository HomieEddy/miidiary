declare module "whisper.rn" {
  export type TranscribeResult = {
    isAborted: boolean;
    language: string;
    result: string;
    segments: unknown[];
  };

  export type TranscribeOptions = {
    language?: string;
    translate?: boolean;
    beamSize?: number;
    prompt?: string;
    temperature?: number;
    onProgress?: (progress: number) => void;
  };

  export class WhisperContext {
    release(): Promise<void>;
    transcribe(
      filePathOrBase64: string | number,
      options?: TranscribeOptions,
    ): {
      promise: Promise<TranscribeResult>;
      stop: () => Promise<void>;
    };
    transcribeData(
      data: string | ArrayBuffer,
      options?: TranscribeOptions,
    ): {
      promise: Promise<TranscribeResult>;
      stop: () => Promise<void>;
    };
  }

  export function initWhisper(options: {
    filePath: string | number;
    isBundleAsset?: boolean;
    useCoreMLIos?: boolean;
    useGpu?: boolean;
  }): Promise<WhisperContext>;
}
