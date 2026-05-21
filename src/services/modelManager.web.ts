export type SttLanguage = "auto" | "en" | "fr-CA";

export type ModelSelection = {
  language: SttLanguage;
  modelPath: string;
  fallbackUsed: boolean;
};

const DEFAULT_LANGUAGE: SttLanguage = "auto";

export class ModelManager {
  async prepareDefaultModel(): Promise<ModelSelection> {
    return this.resolveModel(DEFAULT_LANGUAGE);
  }

  async resolveModel(language: SttLanguage): Promise<ModelSelection> {
    return {
      language,
      modelPath: "web-unsupported-model",
      fallbackUsed: false,
    };
  }

  resetCache(): void {
    // No-op on web.
  }

  markModelUnavailable(_modelPath: string): void {
    // No-op on web.
  }

  async syncModelsForBackground(): Promise<boolean> {
    return true;
  }
}

export const modelManager = new ModelManager();
