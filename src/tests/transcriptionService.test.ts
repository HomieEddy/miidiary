import { TranscriptionService } from "@/services/transcriptionService";

const mockResolveModel = jest.fn();
const mockInitWhisper = jest.fn();
const mockTranscribe = jest.fn();

jest.mock("@/services/modelManager", () => ({
  modelManager: {
    resolveModel: (...args: unknown[]) => mockResolveModel(...args),
    resetCache: jest.fn(),
  },
}));

jest.mock("whisper.rn", () => ({
  initWhisper: (...args: unknown[]) => mockInitWhisper(...args),
}));

describe("transcriptionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockResolveModel.mockResolvedValue({
      language: "en",
      modelPath: "file:///models/ggml-base.en.bin",
      fallbackUsed: false,
    });

    mockTranscribe.mockReturnValue({
      stop: jest.fn(),
      promise: Promise.resolve({
        result: "hello world",
        language: "en",
        segments: [],
        isAborted: false,
      }),
    });

    mockInitWhisper.mockResolvedValue({
      transcribe: (...args: unknown[]) => mockTranscribe(...args),
      release: jest.fn(),
    });
  });

  it("transcribes with resolved language model", async () => {
    const service = new TranscriptionService();

    const result = await service.transcribeAudio({
      audioUri: "file:///recording.wav",
      language: "en",
    });

    expect(mockResolveModel).toHaveBeenCalledWith("en");
    expect(mockInitWhisper).toHaveBeenCalledWith(
      expect.objectContaining({ filePath: "file:///models/ggml-base.en.bin" }),
    );
    expect(mockTranscribe).toHaveBeenCalledWith(
      "file:///recording.wav",
      expect.objectContaining({ language: "en" }),
    );
    expect(result.text).toBe("hello world");
  });

  it("emits staged progress updates in order", async () => {
    const service = new TranscriptionService();
    const events: string[] = [];

    await service.transcribeAudio({
      audioUri: "file:///recording.wav",
      onStageChange: ({ stage }) => {
        events.push(stage);
      },
    });

    expect(events[0]).toBe("preparing");
    expect(events).toContain("transcribing");
    expect(events[events.length - 1]).toBe("finalizing");
  });

  it("uses fallback model metadata when model manager indicates fallback", async () => {
    mockResolveModel.mockResolvedValue({
      language: "fr-CA",
      modelPath: "file:///models/ggml-base.bin",
      fallbackUsed: true,
    });

    const service = new TranscriptionService();
    const result = await service.transcribeAudio({
      audioUri: "file:///recording.wav",
      language: "fr-CA",
    });

    expect(result.language).toBe("en");
    expect(result.usedModelFallback).toBe(true);
    expect(result.modelPath).toBe("file:///models/ggml-base.bin");
  });

  it("throws when transcription output is empty", async () => {
    mockTranscribe.mockReturnValue({
      stop: jest.fn(),
      promise: Promise.resolve({
        result: "   ",
        language: "en",
        segments: [],
        isAborted: false,
      }),
    });

    const service = new TranscriptionService();

    await expect(
      service.transcribeAudio({ audioUri: "file:///recording.wav" }),
    ).rejects.toThrow("Transcription produced empty text");
  });

  it("propagates model resolution failures", async () => {
    mockResolveModel.mockRejectedValue(new Error("No local Whisper model found"));

    const service = new TranscriptionService();

    await expect(
      service.transcribeAudio({ audioUri: "file:///recording.wav" }),
    ).rejects.toThrow("No local Whisper model found");
  });
});
