import { TranscriptionService } from "@/services/transcriptionService";
import { NativeModules, Platform } from "react-native";

const mockResolveModel = jest.fn();
const mockMarkModelUnavailable = jest.fn();
const mockInitWhisper = jest.fn();
const mockTranscribe = jest.fn();
const mockTranscribeData = jest.fn();
const mockDecodeToPcm16Base64 = jest.fn();

jest.mock("@/services/modelManager", () => ({
  modelManager: {
    markModelUnavailable: (...args: unknown[]) => mockMarkModelUnavailable(...args),
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
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    NativeModules.AudioPcmDecoder = {
      decodeToPcm16Base64: (...args: unknown[]) => mockDecodeToPcm16Base64(...args),
    };
    mockDecodeToPcm16Base64.mockResolvedValue("pcm16-base64");

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

    mockTranscribeData.mockReturnValue({
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
      transcribeData: (...args: unknown[]) => mockTranscribeData(...args),
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

  it("transcribes non-wav recordings using Android decoded PCM data", async () => {
    const service = new TranscriptionService();

    const result = await service.transcribeAudio({
      audioUri: "file:///recording.m4a",
      language: "en",
    });

    expect(mockDecodeToPcm16Base64).toHaveBeenCalledWith("file:///recording.m4a");
    expect(mockTranscribeData).toHaveBeenCalledWith(
      "pcm16-base64",
      expect.objectContaining({ language: "en" }),
    );
    expect(mockTranscribe).not.toHaveBeenCalledWith(
      "file:///recording.m4a",
      expect.anything(),
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

  it("uses multilingual auto-detection when no language is requested", async () => {
    const service = new TranscriptionService();

    await service.transcribeAudio({
      audioUri: "file:///recording.wav",
    });

    expect(mockResolveModel).toHaveBeenCalledWith("auto");
    expect(mockTranscribe).toHaveBeenCalledWith(
      "file:///recording.wav",
      expect.objectContaining({ language: "auto", translate: false }),
    );
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

    expect(mockResolveModel).toHaveBeenCalledWith("fr-CA");
    expect(mockTranscribe).toHaveBeenCalledWith(
      "file:///recording.wav",
      expect.objectContaining({ language: "fr", translate: false }),
    );
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
    ).rejects.toThrow("No speech detected");
  });

  it("throws when Whisper returns blank audio token", async () => {
    mockTranscribe.mockReturnValue({
      stop: jest.fn(),
      promise: Promise.resolve({
        result: "[BLANK_AUDIO]",
        language: "en",
        segments: [],
        isAborted: false,
      }),
    });

    const service = new TranscriptionService();

    await expect(
      service.transcribeAudio({ audioUri: "file:///recording.wav" }),
    ).rejects.toThrow("No speech detected");
  });

  it("throws when compressed recording decoding returns empty audio", async () => {
    mockDecodeToPcm16Base64.mockResolvedValue("   ");

    const service = new TranscriptionService();

    await expect(
      service.transcribeAudio({ audioUri: "file:///recording.m4a" }),
    ).rejects.toThrow("Unable to decode recorded audio");
    expect(mockTranscribeData).not.toHaveBeenCalled();
  });

  it("propagates model resolution failures", async () => {
    mockResolveModel.mockRejectedValue(new Error("No local Whisper model found"));

    const service = new TranscriptionService();

    await expect(
      service.transcribeAudio({ audioUri: "file:///recording.wav" }),
    ).rejects.toThrow("No local Whisper model found");
  });

  it("evicts and retries when the native model load fails", async () => {
    mockInitWhisper
      .mockRejectedValueOnce(new Error("Failed to load the model"))
      .mockResolvedValueOnce({
        transcribe: (...args: unknown[]) => mockTranscribe(...args),
        transcribeData: (...args: unknown[]) => mockTranscribeData(...args),
        release: jest.fn(),
      });

    mockResolveModel
      .mockResolvedValueOnce({
        language: "en",
        modelPath: "file:///models/ggml-base.en.bin",
        fallbackUsed: false,
      })
      .mockResolvedValueOnce({
        language: "en",
        modelPath: "file:///models/ggml-tiny.en.bin",
        fallbackUsed: true,
      });

    const service = new TranscriptionService();
    const result = await service.transcribeAudio({ audioUri: "file:///recording.wav" });

    expect(mockMarkModelUnavailable).toHaveBeenCalledWith("file:///models/ggml-base.en.bin");
    expect(mockInitWhisper).toHaveBeenCalledTimes(2);
    expect(result.modelPath).toBe("file:///models/ggml-tiny.en.bin");
    expect(result.usedModelFallback).toBe(true);
  });
});
