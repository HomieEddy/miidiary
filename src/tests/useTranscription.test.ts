import { renderHook, act } from "@testing-library/react-native";
import { useTranscription } from "@/hooks/useTranscription";
import { useRecordingStore } from "@/stores/recordingStore";

const mockStubTranscription = jest.fn();
const mockCleanupTempFile = jest.fn();
const mockGetTempFilePath = jest.fn();
const mockCreateEntry = jest.fn();

jest.mock("@/services/transcriptionStub", () => ({
  stubTranscription: (...args: unknown[]) => mockStubTranscription(...args),
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
    mockStubTranscription.mockResolvedValue("Transcribed text");
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(mockStubTranscription).toHaveBeenCalledWith("file:///test.wav");
    expect(mockCreateEntry).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Transcribed text", category: "note" }),
    );
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
    expect(mockCreateEntry).not.toHaveBeenCalled();
  });

  it("processRecording clears processing on success", async () => {
    mockStubTranscription.mockResolvedValue("Success text");
    mockGetTempFilePath.mockReturnValue(null);
    mockCreateEntry.mockResolvedValue({ id: "entry-1" });
    useRecordingStore.getState().setProcessing(true);

    const { result } = renderHook(() => useTranscription());

    await act(async () => {
      await result.current.processRecording("file:///test.wav");
    });

    expect(useRecordingStore.getState().isProcessing).toBe(false);
  });
});

