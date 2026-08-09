import { renderHook, act } from "@testing-library/react-native";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecordingStore } from "@/stores/recordingStore";

const mockTranscribeAudio = jest.fn();
const mockClassifyEntry = jest.fn();
const mockCleanupTempFile = jest.fn();
const mockGetTempFilePath = jest.fn();
const mockGetPendingProcessingUris = jest.fn();
const mockGetRecordingSessionId = jest.fn();
const mockMarkProcessingComplete = jest.fn();
const mockCreateEntry = jest.fn();

jest.mock("@/services/transcriptionService", () => ({
  transcriptionService: {
    transcribeAudio: (...args: unknown[]) => mockTranscribeAudio(...args),
  },
}));

jest.mock("@/services/classificationService", () => ({
  classificationService: {
    classifyEntry: (...args: unknown[]) => mockClassifyEntry(...args),
  },
}));

jest.mock("@/services/audioCaptureService", () => ({
  audioCaptureService: {
    getTempFilePath: (...args: unknown[]) => mockGetTempFilePath(...args),
    getPendingProcessingUris: (...args: unknown[]) => mockGetPendingProcessingUris(...args),
    getRecordingSessionId: (...args: unknown[]) => mockGetRecordingSessionId(...args),
    cleanupTempFile: (...args: unknown[]) => mockCleanupTempFile(...args),
    markProcessingComplete: (...args: unknown[]) => mockMarkProcessingComplete(...args),
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
    mockGetPendingProcessingUris.mockReturnValue([]);
    mockGetRecordingSessionId.mockReturnValue(undefined);
    useRecordingStore.getState().reset();
  });

  it("processRecording persists entry on successful transcription", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Transcribed text" });
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
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
      expect.objectContaining({
        text: "Transcribed text",
        category: "note",
        classification: expect.objectContaining({ source: "model" }),
      }),
    );
    expect(mockCleanupTempFile).toHaveBeenCalledWith("file:///test.wav");
    expect(mockMarkProcessingComplete).toHaveBeenCalledWith("file:///test.wav");
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
    // Failure keeps the URI pending so a later replay can retry it.
    expect(mockMarkProcessingComplete).not.toHaveBeenCalled();
  });

  it("processRecording surfaces actionable install error guidance", async () => {
    mockTranscribeAudio.mockRejectedValue(new Error("Cannot read property 'install' of undefined"));

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Transcription failed: Whisper runtime unavailable. Rebuild the dev client and retry.",
    );
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

  it("processRecording surfaces message from object-shaped rejections", async () => {
    mockTranscribeAudio.mockRejectedValue({ message: "Native STT init failed" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Transcription failed: Native STT init failed",
    );
  });

  it("processRecording sets explicit classification error", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Needs category" });
    mockClassifyEntry.mockRejectedValue(new Error("classifier offline"));

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Classification failed: classifier offline",
    );
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it("processRecording sets explicit save error", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Save me" });
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
    mockCreateEntry.mockRejectedValue(new Error("Realm write failed"));

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Save failed: Realm write failed",
    );
  });

  it("processRecording clears processing on success", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Success text" });
    mockClassifyEntry.mockResolvedValue({
      category: "task",
      confidence: 0.61,
      rationale: "Heuristic matched action-oriented keywords.",
      source: "heuristic",
    });
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });
    useRecordingStore.getState().setProcessing(true);

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().isProcessing).toBe(false);
  });

  it("cleans up only the recording's own URI, never the shared temp path", async () => {
    mockTranscribeAudio.mockResolvedValue({ text: "Cleanup text" });
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
    mockGetTempFilePath.mockReturnValue("file:///temp.wav");
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    // The shared temp path may already belong to a NEWER recording —
    // cleanup must never touch it (that would delete a live recording).
    expect(mockCleanupTempFile).toHaveBeenCalledTimes(1);
    expect(mockCleanupTempFile).toHaveBeenCalledWith("file:///test.wav");
  });

  it("updates processing stage from transcription callbacks", async () => {
    mockTranscribeAudio.mockImplementation(async (input: { onStageChange?: (update: { stage: "preparing" | "transcribing" | "finalizing"; progress: number }) => void }) => {
      input.onStageChange?.({ stage: "preparing", progress: 0 });
      input.onStageChange?.({ stage: "transcribing", progress: 55 });
      input.onStageChange?.({ stage: "finalizing", progress: 100 });
      return { text: "Stage text" };
    });
    mockGetTempFilePath.mockReturnValue(null);
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().processingStage).toBe("idle");
  });

  it("replays pending recordings on demand", async () => {
    mockGetPendingProcessingUris.mockReturnValue([
      "file:///pending-1.wav",
      "file:///pending-2.wav",
    ]);
    mockTranscribeAudio.mockResolvedValue({ text: "Recovered text" });
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processPendingRecordings();
    });

    expect(mockTranscribeAudio).toHaveBeenCalledTimes(2);
    expect(mockMarkProcessingComplete).toHaveBeenCalledWith("file:///pending-1.wav");
    expect(mockMarkProcessingComplete).toHaveBeenCalledWith("file:///pending-2.wav");
  });

  it("does not clobber the live session when a stale recording completes", async () => {
    // Session 1's recording finishes while session 2 is live.
    mockGetRecordingSessionId.mockReturnValue(1);
    useRecordingStore.getState().setRecording(true); // session 1
    useRecordingStore.getState().setRecording(true); // session 2
    useRecordingStore.getState().setProcessing(true); // live processing state
    mockTranscribeAudio.mockResolvedValue({ text: "Old text" });
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///stale.wav");
    });

    // The stale completion must still persist (the audio was recorded),
    // but it must not rewrite the live session's UI state.
    expect(mockCreateEntry).toHaveBeenCalledTimes(1);
    expect(useRecordingStore.getState().isProcessing).toBe(true);
    expect(useRecordingStore.getState().errorMessage).toBeNull();
    expect(useRecordingStore.getState().processingStage).toBe("preparing");
  });

  it("dedupes concurrent pending replays of the same URI", async () => {
    mockGetPendingProcessingUris.mockReturnValue(["file:///dup.wav"]);
    mockTranscribeAudio.mockResolvedValue({ text: "Once only" });
    mockClassifyEntry.mockResolvedValue({
      category: "note",
      confidence: 0.72,
      rationale: "Model matched 2 weighted feature(s) for note.",
      source: "model",
    });
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      // Simulate mount trigger + AppState-active trigger firing together.
      await Promise.all([
        result.current.processPendingRecordings(),
        result.current.processPendingRecordings(),
      ]);
    });

    expect(mockTranscribeAudio).toHaveBeenCalledTimes(1);
    expect(mockCreateEntry).toHaveBeenCalledTimes(1);
    expect(mockMarkProcessingComplete).toHaveBeenCalledWith("file:///dup.wav");
  });
});

