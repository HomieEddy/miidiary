import { AudioCaptureService } from "@/services/audioCaptureService";

jest.mock("expo-audio", () => ({
  AudioQuality: { MAX: "MAX" },
  AndroidAudioEncoder: { AAC: "AAC" },
  AndroidOutputFormat: { MPEG_4: "MPEG_4" },
  IOSOutputFormat: { LINEARPCM: "LINEARPCM" },
  AudioModule: {
    AudioRecorder: class {
      prepareToRecordAsync = jest.fn();
      record = jest.fn();
      stop = jest.fn();
      getStatus = jest.fn();
    },
  },
  requestRecordingPermissionsAsync: jest.fn(),
  setAudioModeAsync: jest.fn(),
}));

describe("AudioCaptureService pending processing", () => {
  it("tracks pending processing URIs", () => {
    const service = new AudioCaptureService();

    service.markPendingProcessing("file:///a.wav");
    service.markPendingProcessing("file:///b.wav");

    expect(service.getPendingProcessingUris()).toEqual([
      "file:///a.wav",
      "file:///b.wav",
    ]);
  });

  it("removes URI when processing completes", () => {
    const service = new AudioCaptureService();

    service.markPendingProcessing("file:///a.wav");
    service.markPendingProcessing("file:///b.wav");
    service.markProcessingComplete("file:///a.wav");

    expect(service.getPendingProcessingUris()).toEqual(["file:///b.wav"]);
  });

  it("is safe to mark complete for unknown URI", () => {
    const service = new AudioCaptureService();

    service.markPendingProcessing("file:///a.wav");
    service.markProcessingComplete("file:///missing.wav");

    expect(service.getPendingProcessingUris()).toEqual(["file:///a.wav"]);
  });
});
