import { renderHook, act } from "@testing-library/react-native";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecordingStore } from "@/stores/recordingStore";

const mockTranscribeAudio = jest.fn();
const mockCleanupTempFile = jest.fn();
const mockGetTempFilePath = jest.fn();
const mockCreateEntry = jest.fn();

jest.mock("@/services/transcriptionService", () => ({
  transcriptionService: {
    transcribeAudio: (...args: unknown[]) => mockTranscribeAudio(...args),
  },
}));

jest.mock("@/services/audioCaptureService", () => ({
  audioCaptureService: {
    getTempFilePath: (...args: unknown[]) => mockGetTempFilePath(...args),
    cleanupTempFile: (...args: unknown[]) => mockCleanupTempFile(...args),
  },
}));

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    createEntry: (...args: unknown[]) => mockCreateEntry(...args),
  },
}));

describe("useTranscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecordingStore.getState().reset();
  });

  it("processRecording persists entry on successful transcription", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Transcribed text" });
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(mockTranscribeAudio).toHaveBeenCalledWith(
      expect.objectContaining({ audioUri: "file:///test.wav" }),
    );
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Transcribed text", category: "note" }),
    );
  });

  it("processRecording sets error state on transcription failure", async () => {
    mockTranscribeAudio.mockRejectedValue(new Error("STT failed"));

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Transcription failed: STT failed",
    );
    expect(useRecordingStore.getState().isProcessing).toBe(false);
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it("processRecording uses fallback detail for non-informative errors", async () => {
    mockTranscribeAudio.mockRejectedValue(new Error("!"));

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Transcription failed: Unknown error",
    );
    expect(useRecordingStore.getState().isProcessing).toBe(false);
  });

  it("processRecording clears processing on success", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Success text" });
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });
    useRecordingStore.getState().setProcessing(true);

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().isProcessing).toBe(false);
  });

  it("updates processing stage from transcription callbacks", async () => {
    mockTranscribeAudio.mockImplementation(async (input: { onStageChange?: (update: { stage: "preparing" | "transcribing" | "finalizing"; progress: number }) => void }) => {
      input.onStageChange?.({ stage: "preparing", progress: 0 });
      input.onStageChange?.({ stage: "transcribing", progress: 55 });
      input.onStageChange?.({ stage: "finalizing", progress: 100 });
      return { text: "Stage text" };
    });
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().processingStage).toBe("idle");
  });
});

