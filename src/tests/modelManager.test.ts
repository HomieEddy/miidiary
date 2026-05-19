const mockFileExists = new Map<string, boolean>();
const mockDownloadFileAsync = jest.fn(async (_url: string, destination: { uri?: string } | string) => {
  const uri = typeof destination === "string" ? destination : destination.uri ?? "";
  if (uri) {
    mockFileExists.set(uri, true);
  }
  return { uri };
});

let mockModelsDirectoryExists = false;
const mockDirectoryCreate = jest.fn();

jest.mock("expo-file-system", () => ({
  Paths: {
    document: { uri: "file:///docs/" },
  },
  File: class {
    uri: string;

    static downloadFileAsync(...args: unknown[]) {
      return mockDownloadFileAsync(...(args as [string, { uri?: string } | string]));
    }

    constructor(uri: string) {
      this.uri = uri;
    }

    get exists() {
      return mockFileExists.get(this.uri) ?? false;
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

describe("modelManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileExists.clear();
    mockModelsDirectoryExists = false;
    modelManager.resetCache();
  });

  it("resolves local model when candidate exists", async () => {
    mockFileExists.set("file:///docs/models/ggml-base.en.bin", true);

    const result = await modelManager.resolveModel("en");

    expect(result.modelPath).toBe("file:///docs/models/ggml-base.en.bin");
    expect(result.fallbackUsed).toBe(false);
  });

  it("downloads missing model during background sync", async () => {
    const synced = await modelManager.syncModelsForBackground();

    expect(mockDirectoryCreate).toHaveBeenCalled();
    expect(mockDownloadFileAsync).toHaveBeenCalled();
    expect(synced).toBe(true);
  });

  it("returns false when downloads fail and no local models exist", async () => {
    mockDownloadFileAsync.mockRejectedValue(new Error("network fail"));

    const synced = await modelManager.syncModelsForBackground();

    expect(synced).toBe(false);
  });
});
