import { Directory, File, Paths } from "expo-file-system";

export type SttLanguage = "en" | "fr-CA";

type ModelSelection = {
  language: SttLanguage;
  modelPath: string;
  fallbackUsed: boolean;
};

const MODEL_CANDIDATES: Record<SttLanguage, string[]> = {
  en: [
    `${Paths.document.uri}models/ggml-base.en.bin`,
    `${Paths.document.uri}models/ggml-tiny.en.bin`,
  ],
  "fr-CA": [
    `${Paths.document.uri}models/ggml-small.bin`,
    `${Paths.document.uri}models/ggml-base.bin`,
  ],
};

const MODEL_DOWNLOAD_SOURCES: Record<string, string> = {
  "ggml-base.en.bin": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin",
  "ggml-tiny.en.bin": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin",
  "ggml-small.bin": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
  "ggml-base.bin": "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
};

const MODELS_DIRECTORY_URI = `${Paths.document.uri}models`;

export class ModelManager {
  private readonly selectionCache = new Map<SttLanguage, ModelSelection>();

  async resolveModel(language: SttLanguage): Promise<ModelSelection> {
    const cached = this.selectionCache.get(language);
    if (cached) {
      return cached;
    }

    const selected = this.pickModelPath(language);
    if (!selected) {
      throw new Error(`No local Whisper model found for ${language}`);
    }

    const result: ModelSelection = {
      language,
      modelPath: selected.path,
      fallbackUsed: selected.index > 0,
    };
    this.selectionCache.set(language, result);

    return result;
  }

  resetCache(): void {
    this.selectionCache.clear();
  }

  async syncModelsForBackground(): Promise<boolean> {
    const requestedLanguages: SttLanguage[] = ["en", "fr-CA"];
    let syncedAny = false;

    for (const language of requestedLanguages) {
      try {
        await this.resolveModel(language);
        syncedAny = true;
      } catch {
        const downloaded = await this.downloadBestCandidate(language);
        syncedAny = syncedAny || downloaded;
        if (downloaded) {
          try {
            await this.resolveModel(language);
          } catch {
            // Best-effort: keep sync resilient even when downloaded file is unusable.
          }
        }
      }
    }

    return syncedAny;
  }

  private pickModelPath(language: SttLanguage): { path: string; index: number } | null {
    const candidates = MODEL_CANDIDATES[language];
    for (let index = 0; index < candidates.length; index += 1) {
      const path = candidates[index];
      try {
        if (new File(path).exists) {
          return { path, index };
        }
      } catch {
        // Keep scanning candidate model files.
      }
    }

    return null;
  }

  private async downloadBestCandidate(language: SttLanguage): Promise<boolean> {
    const candidates = MODEL_CANDIDATES[language];
    const modelsDirectory = new Directory(MODELS_DIRECTORY_URI);

    try {
      if (!modelsDirectory.exists) {
        modelsDirectory.create({ idempotent: true, intermediates: true });
      }
    } catch {
      return false;
    }

    for (const candidatePath of candidates) {
      const candidateFile = new File(candidatePath);
      if (candidateFile.exists) {
        return true;
      }

      const fileName = candidatePath.split("/").pop();
      if (!fileName) {
        continue;
      }

      const sourceUrl = MODEL_DOWNLOAD_SOURCES[fileName];
      if (!sourceUrl) {
        continue;
      }

      try {
        await File.downloadFileAsync(sourceUrl, candidateFile, { idempotent: true });
        return true;
      } catch {
        // Continue trying lower-priority model candidates.
      }
    }

    return false;
  }
}

export const modelManager = new ModelManager();