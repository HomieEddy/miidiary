import { stubTranscription } from "@/services/transcriptionStub";

const mockDelete = jest.fn();
const mockFileExistsByUri = new Map<string, boolean>();
const mockFileShouldThrowByUri = new Map<string, boolean>();

jest.mock("expo-file-system", () => ({
  File: class {
    uri: string;

    constructor(uri: string) {
      this.uri = uri;
      if (mockFileShouldThrowByUri.get(uri)) {
        throw new Error("File error");
      }
    }

    get exists() {
      return mockFileExistsByUri.get(this.uri) ?? false;
    }

    delete() {
      mockDelete(this.uri);
    }
  },
}));

describe("stubTranscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFileExistsByUri.clear();
    mockFileShouldThrowByUri.clear();
  });

  it("returns placeholder transcription text", async () => {
    mockFileExistsByUri.set("file:///test.wav", false);

    const result = await stubTranscription("file:///test.wav");

    expect(result).toBe(
      "This is a simulated transcription. Actual STT arrives in Phase 3.",
    );
  }, 10000);

  it("deletes the audio file when it exists", async () => {
    mockFileExistsByUri.set("file:///test.wav", true);

    await stubTranscription("file:///test.wav");

    expect(mockDelete).toHaveBeenCalledWith("file:///test.wav");
  }, 10000);

  it("does not delete when file does not exist", async () => {
    mockFileExistsByUri.set("file:///missing.wav", false);

    await stubTranscription("file:///missing.wav");

    expect(mockDelete).not.toHaveBeenCalled();
  }, 10000);

  it("handles FileSystem errors gracefully", async () => {
    mockFileShouldThrowByUri.set("file:///test.wav", true);

    const result = await stubTranscription("file:///test.wav");

    expect(result).toBe(
      "This is a simulated transcription. Actual STT arrives in Phase 3.",
    );
  }, 10000);
});
