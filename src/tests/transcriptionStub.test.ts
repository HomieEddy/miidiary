import { stubTranscription } from "@/services/transcriptionStub";

const mockDeleteAsync = jest.fn();
const mockGetInfoAsync = jest.fn();

jest.mock("expo-file-system", () => ({
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
}));

describe("stubTranscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns placeholder transcription text", async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: false });

    const result = await stubTranscription("file:///test.wav");

    expect(result).toBe(
      "This is a simulated transcription. Actual STT arrives in Phase 3.",
    );
  }, 10000);

  it("deletes the audio file when it exists", async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: true });
    mockDeleteAsync.mockResolvedValue(undefined);

    await stubTranscription("file:///test.wav");

    expect(mockDeleteAsync).toHaveBeenCalledWith("file:///test.wav", {
      idempotent: true,
    });
  }, 10000);

  it("does not delete when file does not exist", async () => {
    mockGetInfoAsync.mockResolvedValue({ exists: false });

    await stubTranscription("file:///missing.wav");

    expect(mockDeleteAsync).not.toHaveBeenCalled();
  }, 10000);

  it("handles FileSystem errors gracefully", async () => {
    mockGetInfoAsync.mockRejectedValue(new Error("File error"));

    const result = await stubTranscription("file:///test.wav");

    expect(result).toBe(
      "This is a simulated transcription. Actual STT arrives in Phase 3.",
    );
  }, 10000);
});
