const mockFileExists = new Map<string, boolean>();
const mockFileSizes = new Map<string, number>();
const mockFileHeaders = new Map<string, string>();
const mockDownloadFileAsync = jest.fn(async (_url: string, destination: { uri?: string } | string) => {
  const uri = typeof destination === "string" ? destination : destination.uri ?? "";
  if (uri) {
    mockFileExists.set(uri, true);
    mockFileSizes.set(uri, 150_000_000);
    mockFileHeaders.set(uri, "ggml");
  }
  return { uri };
});

let mockModelsDirectoryExists = false;
const mockDirectoryCreate = jest.fn();

jest.mock("expo-file-system", () => ({
  Paths: {
    document: { uri: "file:///docs/" },
  },
  File: class MockFile {
    uri: string;

    static downloadFileAsync(...args: unknown[]) {
      return mockDownloadFileAsync(...(args as [string, { uri?: string } | string])).then(
        (result) => new MockFile(result.uri),
      );
    }

    constructor(uri: string) {
      this.uri = uri;
    }

    get exists() {
      return mockFileExists.get(this.uri) ?? false;
    }

    get size() {
      return mockFileSizes.get(this.uri) ?? 0;
    }

    open() {
      const header = mockFileHeaders.get(this.uri) ?? "";

      return {
        readBytes: jest.fn(() => Uint8Array.from(header.split("").map((char) => char.charCodeAt(0)))),
        close: jest.fn(),
      };
    }

    delete() {
      mockFileExists.set(this.uri, false);
      mockFileSizes.delete(this.uri);
      mockFileHeaders.delete(this.uri);
    }
  },
  Directory: class {
    uri: string;

    constructor(uri: string) {
      this.uri = uri;
    }

    get exists() {
      return mockModelsDirectoryExists;
    }

    create() {
      mockModelsDirectoryExists = true;
      mockDirectoryCreate();
    }
  },
}));

import { modelManager } from "@/services/modelManager";

function markValidModel(uri: string): void {
  mockFileExists.set(uri, true);
  mockFileSizes.set(uri, 150_000_000);
  mockFileHeaders.set(uri, "lmgg");
}

describe("modelManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileExists.clear();
    mockFileSizes.clear();
    mockFileHeaders.clear();
    mockModelsDirectoryExists = false;
    modelManager.resetCache();
  });

  it("resolves local model when candidate exists", async () => {
    markValidModel("file:///docs/models/ggml-tiny.en.bin");

    const result = await modelManager.resolveModel("en");

    expect(result.modelPath).toBe("file:///docs/models/ggml-tiny.en.bin");
    expect(result.fallbackUsed).toBe(false);
  });

  it("accepts GGUF model header", async () => {
    mockFileExists.set("file:///docs/models/ggml-tiny.en.bin", true);
    mockFileSizes.set("file:///docs/models/ggml-tiny.en.bin", 150_000_000);
    mockFileHeaders.set("file:///docs/models/ggml-tiny.en.bin", "GGUF");

    const result = await modelManager.resolveModel("en");

    expect(result.modelPath).toBe("file:///docs/models/ggml-tiny.en.bin");
  });

  it("downloads missing model during background sync", async () => {
    const synced = await modelManager.syncModelsForBackground();

    expect(mockDirectoryCreate).toHaveBeenCalled();
    expect(mockDownloadFileAsync).toHaveBeenCalled();
    expect(synced).toBe(true);
  });

  it("downloads missing model during direct resolve", async () => {
    const result = await modelManager.resolveModel("en");

    expect(mockDirectoryCreate).toHaveBeenCalled();
    expect(mockDownloadFileAsync).toHaveBeenCalledWith(
      "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin",
      expect.objectContaining({ uri: "file:///docs/models/ggml-tiny.en.bin" }),
      { idempotent: true },
    );
    expect(result.modelPath).toBe("file:///docs/models/ggml-tiny.en.bin");
    expect(result.fallbackUsed).toBe(false);
  });

  it("returns false when downloads fail and no local models exist", async () => {
    mockDownloadFileAsync.mockRejectedValue(new Error("network fail"));

    const synced = await modelManager.syncModelsForBackground();

    expect(synced).toBe(false);
  });

  it("surfaces download failure detail for foreground model preparation", async () => {
    mockDownloadFileAsync.mockRejectedValue(new Error("network fail"));

    await expect(modelManager.prepareDefaultModel()).rejects.toThrow(
      "Unable to prepare Whisper model for en: ggml-base.en.bin download failed (network fail)",
    );
  });

  it("deletes corrupt cached model before trying a fallback", async () => {
    mockFileExists.set("file:///docs/models/ggml-tiny.en.bin", true);
    mockFileSizes.set("file:///docs/models/ggml-tiny.en.bin", 150_000_000);
    mockFileHeaders.set("file:///docs/models/ggml-tiny.en.bin", "<htm");
    markValidModel("file:///docs/models/ggml-base.en.bin");

    const result = await modelManager.resolveModel("en");

    expect(result.modelPath).toBe("file:///docs/models/ggml-base.en.bin");
    expect(result.fallbackUsed).toBe(true);
    expect(mockFileExists.get("file:///docs/models/ggml-tiny.en.bin")).toBe(false);
  });

  it("surfaces invalid downloaded content details", async () => {
    mockDownloadFileAsync.mockImplementation(async (_url: string, destination: { uri?: string } | string) => {
      const uri = typeof destination === "string" ? destination : destination.uri ?? "";
      mockFileExists.set(uri, true);
      mockFileSizes.set(uri, 150_000_000);
      mockFileHeaders.set(uri, "<!doctype html>");
      return { uri };
    });

    await expect(modelManager.prepareDefaultModel()).rejects.toThrow(
      "download returned HTML instead of a model",
    );
  });
});
