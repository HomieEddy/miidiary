import { File, Paths } from "expo-file-system";

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
}

export const modelManager = new ModelManager();