import { AudioCaptureService } from "@/services/audioCaptureService";

const mockPrepareToRecordAsync = jest.fn();
const mockRecord = jest.fn();
const mockStop = jest.fn();
const mockGetStatus = jest.fn();
const mockRequestRecordingPermissionsAsync = jest.fn();
const mockSetAudioModeAsync = jest.fn();

jest.mock("expo-audio", () => ({
  AudioQuality: { MAX: "MAX" },
  AndroidAudioEncoder: { AAC: "AAC" },
  AndroidOutputFormat: { MPEG_4: "MPEG_4" },
  IOSOutputFormat: { LINEARPCM: "LINEARPCM" },
  AudioModule: {
    AudioRecorder: class {
      uri = "file:///cache/recording.m4a";
      prepareToRecordAsync = mockPrepareToRecordAsync;
      record = mockRecord;
      stop = mockStop;
      getStatus = mockGetStatus;
    },
  },
  requestRecordingPermissionsAsync: (...args: unknown[]) => mockRequestRecordingPermissionsAsync(...args),
  setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
}));

jest.mock("expo-file-system", () => ({
  File: class {
    exists = false;
    delete = jest.fn();
  },
}));

describe("AudioCaptureService pending processing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockRequestRecordingPermissionsAsync.mockResolvedValue({ granted: true });
    mockSetAudioModeAsync.mockResolvedValue(undefined);
    mockPrepareToRecordAsync.mockResolvedValue(undefined);
    mockStop.mockResolvedValue(undefined);
    mockGetStatus.mockReturnValue({ metering: -20 });
  });

  it("tracks pending processing URIs", () => {
    const service = new AudioCaptureService();

    service.markPendingProcessing("file:///a.wav", 1);
    service.markPendingProcessing("file:///b.wav", 2);

    expect(service.getPendingProcessingUris()).toEqual([
      "file:///a.wav",
      "file:///b.wav",
    ]);
  });

  it("removes URI when processing completes", () => {
    const service = new AudioCaptureService();

    service.markPendingProcessing("file:///a.wav", 1);
    service.markPendingProcessing("file:///b.wav", 2);
    service.markProcessingComplete("file:///a.wav");

    expect(service.getPendingProcessingUris()).toEqual(["file:///b.wav"]);
  });

  it("is safe to mark complete for unknown URI", () => {
    const service = new AudioCaptureService();

    service.markPendingProcessing("file:///a.wav", 1);
    service.markProcessingComplete("file:///missing.wav");

    expect(service.getPendingProcessingUris()).toEqual(["file:///a.wav"]);
  });

  it("returns the recorder URI captured before native stop resets it", async () => {
    const service = new AudioCaptureService();

    await service.startRecording();
    const uri = await service.stopRecording();

    expect(uri).toBe("file:///cache/recording.m4a");
    expect(mockStop).toHaveBeenCalled();
  });

  it("times out when native stop does not resolve", async () => {
    jest.useFakeTimers();
    mockStop.mockReturnValue(new Promise(() => undefined));
    const service = new AudioCaptureService();

    await service.startRecording();
    const stopPromise = service.stopRecording();

    jest.advanceTimersByTime(5_000);

    await expect(stopPromise).resolves.toBeNull();
  });
});
