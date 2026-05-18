import { renderHook, act } from "@testing-library/react-native";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecordingStore } from "@/stores/recordingStore";
import { useEntriesStore } from "@/stores/entriesStore";

const mockStubTranscription = jest.fn();
const mockCleanupTempFile = jest.fn();
const mockGetTempFilePath = jest.fn();

jest.mock("@/services/transcriptionStub", () => ({
  stubTranscription: (...args: unknown[]) => mockStubTranscription(...args),
}));

jest.mock("@/services/audioCaptureService", () => ({
  audioCaptureService: {
    getTempFilePath: (...args: unknown[]) => mockGetTempFilePath(...args),
    cleanupTempFile: (...args: unknown[]) => mockCleanupTempFile(...args),
  },
}));

describe("useTranscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRecordingStore.getState().reset();
    useEntriesStore.getState().clearAll();
  });

  it("processRecording adds entry on successful transcription", async () => {
    mockStubTranscription.mockResolvedValue("Transcribed text");
    mockGetTempFilePath.mockReturnValue(null);

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(mockStubTranscription).toHaveBeenCalledWith("file:///test.wav");
    const entries = useEntriesStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe("Transcribed text");
    expect(entries[0].category).toBe("note");
  });

  it("processRecording sets error state on transcription failure", async () => {
    mockStubTranscription.mockRejectedValue(new Error("STT failed"));

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().errorMessage).toBe(
      "Transcription failed",
    );
    expect(useRecordingStore.getState().isProcessing).toBe(false);
    expect(useEntriesStore.getState().entries).toHaveLength(0);
  });

  it("processRecording clears processing on success", async () => {
    mockStubTranscription.mockResolvedValue("Success text");
    mockGetTempFilePath.mockReturnValue(null);
    useRecordingStore.getState().setProcessing(true);

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().isProcessing).toBe(false);
  });
});
