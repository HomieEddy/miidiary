import { Directory, File, Paths } from "expo-file-system";

export type SttLanguage = "auto" | "en" | "fr-CA";

export type ModelSelection = {
  language: SttLanguage;
  modelPath: string;
  fallbackUsed: boolean;
};

const MIN_MODEL_SIZE_BYTES = 1_000_000;
const VALID_MODEL_HEADERS = new Set([
  "lmgg", // 0x67676d6c, GGML magic as little-endian bytes
  "fmgg", // older GGML variants
  "tjgg",
  "ggml",
  "ggmf",
  "ggjt",
  "GGUF",
  "gguf",
]);
const DEFAULT_LANGUAGE: SttLanguage = "auto";

const MODEL_CANDIDATES: Record<SttLanguage, string[]> = {
  auto: [
    `${Paths.document.uri}models/ggml-small.bin`,
    `${Paths.document.uri}models/ggml-base.bin`,
  ],
  en: [
    `${Paths.document.uri}models/ggml-tiny.en.bin`,
    `${Paths.document.uri}models/ggml-base.en.bin`,
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
  private readonly inFlightResolutions = new Map<SttLanguage, Promise<ModelSelection>>();
  private activeDownloadPath: string | null = null;

  async prepareDefaultModel(): Promise<ModelSelection> {
    return this.resolveModel(DEFAULT_LANGUAGE);
  }

  async resolveModel(language: SttLanguage): Promise<ModelSelection> {
    const cached = this.selectionCache.get(language);
    if (cached) {
      return cached;
    }

    // Deduplicate concurrent resolves (e.g. mount + AppState): a second call
    // while the first is still running shares the in-flight download/promise.
    const inFlight = this.inFlightResolutions.get(language);
    if (inFlight) {
      return inFlight;
    }

    const resolution = this.resolveModelUncached(language);
    this.inFlightResolutions.set(language, resolution);
    resolution.then(
      () => {
        this.inFlightResolutions.delete(language);
      },
      () => {
        this.inFlightResolutions.delete(language);
      },
    );

    return resolution;
  }

  private async resolveModelUncached(language: SttLanguage): Promise<ModelSelection> {
    let selected = this.pickModelPath(language);
    if (!selected) {
      const downloadResult = await this.downloadBestCandidate(language);
      if (downloadResult.downloaded) {
        selected = this.pickModelPath(language);
      }

      if (!selected) {
        throw new Error(
          `Unable to prepare Whisper model for ${language}: ${downloadResult.reason}`,
        );
      }
    }

    if (!selected) {
      throw new Error(`Unable to prepare Whisper model for ${language}: no usable model file found`);
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

  markModelUnavailable(modelPath: string): void {
    for (const [language, selection] of this.selectionCache.entries()) {
      if (selection.modelPath === modelPath) {
        this.selectionCache.delete(language);
      }
    }

    try {
      const file = new File(modelPath);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // Best-effort cleanup; a future resolve can still try lower-priority models.
    }
  }

  async syncModelsForBackground(): Promise<boolean> {
    try {
      await this.prepareDefaultModel();
      return true;
    } catch {
      return false;
    }
  }

  private pickModelPath(language: SttLanguage): { path: string; index: number } | null {
    const candidates = MODEL_CANDIDATES[language];
    for (let index = 0; index < candidates.length; index += 1) {
      const path = candidates[index];
      const file = new File(path);
      try {
        if (this.isUsableModelFile(file)) {
          return { path, index };
        }

        // Never prune the file a concurrent download is currently writing to.
        if (file.exists && path !== this.activeDownloadPath) {
          file.delete();
        }
      } catch {
        // Keep scanning candidate model files.
      }
    }

    return null;
  }

  private async downloadBestCandidate(language: SttLanguage): Promise<{ downloaded: boolean; reason: string }> {
    const candidates = MODEL_CANDIDATES[language];
    const modelsDirectory = new Directory(MODELS_DIRECTORY_URI);
    let lastReason = "model download did not start";

    try {
      if (!modelsDirectory.exists) {
        modelsDirectory.create({ idempotent: true, intermediates: true });
      }
    } catch (error) {
      return {
        downloaded: false,
        reason: `could not create model directory (${this.describeError(error)})`,
      };
    }

    for (const candidatePath of candidates) {
      const fileName = candidatePath.split("/").pop();
      if (!fileName) {
        continue;
      }

      const sourceUrl = MODEL_DOWNLOAD_SOURCES[fileName];
      if (!sourceUrl) {
        lastReason = `no download source configured for ${fileName}`;
        continue;
      }

      const candidateFile = new File(candidatePath);
      this.activeDownloadPath = candidatePath;

      try {
        // Delete any partial/corrupt file before downloading to avoid loading bad data.
        if (candidateFile.exists) {
          candidateFile.delete();
        }
        await File.downloadFileAsync(sourceUrl, candidateFile, {
          idempotent: true,
        });
        if (this.isUsableModelFile(candidateFile)) {
          return { downloaded: true, reason: "downloaded usable model" };
        }

        lastReason = `${fileName} downloaded but was not a valid Whisper model (${this.describeInvalidFile(candidateFile)})`;
        if (candidateFile.exists) {
          candidateFile.delete();
        }
      } catch (error) {
        lastReason = `${fileName} download failed (${this.describeError(error)})`;
        // Continue trying lower-priority model candidates.
      } finally {
        this.activeDownloadPath = null;
      }
    }

    return { downloaded: false, reason: lastReason };
  }

  private isUsableModelFile(file: File): boolean {
    if (!file.exists || file.size <= MIN_MODEL_SIZE_BYTES) {
      return false;
    }

    const fileHandle = file.open();
    try {
      const headerBytes = fileHandle.readBytes(4);
      const header = String.fromCharCode(...headerBytes);

      return VALID_MODEL_HEADERS.has(header);
    } finally {
      fileHandle.close();
    }
  }

  private describeInvalidFile(file: File): string {
    try {
      if (!file.exists) {
        return "file was missing after download";
      }

      if (file.size <= MIN_MODEL_SIZE_BYTES) {
        return `file was too small (${file.size} bytes)`;
      }

      const fileHandle = file.open();
      try {
        const headerBytes = fileHandle.readBytes(16);
        const header = String.fromCharCode(...headerBytes);
        const printableHeader = header.replace(/[^\x20-\x7E]/g, ".");

        if (printableHeader.trim().startsWith("<")) {
          return "download returned HTML instead of a model";
        }

        if (printableHeader.toLowerCase().includes("version")) {
          return "download returned a Git LFS pointer instead of model bytes";
        }

        return `unexpected header '${printableHeader}'`;
      } finally {
        fileHandle.close();
      }
    } catch (error) {
      return `could not inspect downloaded file (${this.describeError(error)})`;
    }
  }

  private describeError(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === "string" && error.trim()) {
      return error.trim();
    }

    return "unknown error";
  }
}

export const modelManager = new ModelManager();
