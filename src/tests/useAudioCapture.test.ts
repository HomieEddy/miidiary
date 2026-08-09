import { renderHook, act } from "@testing-library/react-native";
import { useAudioCapture } from "@/hooks/useAudioCapture";
import { useRecordingStore } from "@/stores/recordingStore";

const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn();
const mockOnMetering = jest.fn();
const mockMarkPendingProcessing = jest.fn();
const mockGetLastError = jest.fn();
const mockNotificationAsync = jest.fn();

jest.mock("@/services/audioCaptureService", () => ({
  audioCaptureService: {
    startRecording: (...args: unknown[]) => mockStartRecording(...args),
    stopRecording: (...args: unknown[]) => mockStopRecording(...args),
    onMetering: (...args: unknown[]) => mockOnMetering(...args),
    markPendingProcessing: (...args: unknown[]) => mockMarkPendingProcessing(...args),
    getLastError: (...args: unknown[]) => mockGetLastError(...args),
  },
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
  NotificationFeedbackType: { Warning: "Warning" },
}));

jest.mock("react-native-reanimated", () => ({
  useSharedValue: (initial: unknown) => ({ value: initial }),
  useDerivedValue: (fn: () => unknown) => fn(),
  useAnimatedStyle: (fn: () => unknown) => fn(),
  useAnimatedProps: (fn: () => unknown) => fn(),
  useFrameCallback: () => ({}),
  useReducedMotion: () => false,
  withDelay: (_ms: number, value: unknown) => value,
  withTiming: (val: number) => val,
  withSpring: (val: number) => val,
  withRepeat: (val: unknown) => val,
  withSequence: (...vals: unknown[]) => vals[vals.length - 1],
  Easing: { inOut: () => "", sin: "", out: () => "", in: () => "", ease: "", back: () => "" },
  default: {},
  __esModule: true,
}));

describe("useAudioCapture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLastError.mockReturnValue(null);
    useRecordingStore.getState().reset();
  });

  it("startRecording sets recording state on success", async () => {
    mockStartRecording.mockResolvedValue(true);

    const { result } = renderHook(() => useAudioCapture());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(mockStartRecording).toHaveBeenCalled();
    expect(useRecordingStore.getState().isRecording).toBe(true);
  });

  it("startRecording clears stale processing before recording", async () => {
    mockStartRecording.mockResolvedValue(true);
    useRecordingStore.getState().setProcessing(true);

    const { result } = renderHook(() => useAudioCapture());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(useRecordingStore.getState().isProcessing).toBe(false);
    expect(useRecordingStore.getState().processingStage).toBe("idle");
    expect(useRecordingStore.getState().isRecording).toBe(true);
  });

  it("startRecording sets error on failure", async () => {
    mockStartRecording.mockResolvedValue(false);

    const { result } = renderHook(() => useAudioCapture());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(useRecordingStore.getState().isRecording).toBe(false);
    expect(useRecordingStore.getState().errorMessage).toBe(
      "Recording failed: Unable to start the microphone.",
    );
    expect(mockNotificationAsync).toHaveBeenCalled();
  });

  it("stopRecording returns URI and sets processing", async () => {
    mockStopRecording.mockResolvedValue("file:///recording.wav");

    const { result } = renderHook(() => useAudioCapture());

    let uri: string | undefined;
    await act(async () => {
      uri = await result.current.stopRecording();
    });

    expect(uri).toBe("file:///recording.wav");
    expect(useRecordingStore.getState().isRecording).toBe(false);
    expect(useRecordingStore.getState().isProcessing).toBe(true);
    expect(mockMarkPendingProcessing).toHaveBeenCalledWith("file:///recording.wav", 0);
  });

  it("stopRecording sets error when URI is null", async () => {
    mockStopRecording.mockResolvedValue(null);

    const { result } = renderHook(() => useAudioCapture());

    let uri: string | undefined;
    await act(async () => {
      uri = await result.current.stopRecording();
    });

    expect(uri).toBeUndefined();
    expect(useRecordingStore.getState().errorMessage).toBe(
      "Recording failed: Unable to save recorded audio.",
    );
  });

  it("retry resets store state", async () => {
    useRecordingStore.getState().setError("Some error");

    const { result } = renderHook(() => useAudioCapture());

    act(() => {
      result.current.retry();
    });

    expect(useRecordingStore.getState().errorMessage).toBeNull();
    expect(useRecordingStore.getState().status).toBe("idle");
  });
});
