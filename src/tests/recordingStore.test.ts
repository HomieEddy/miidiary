import { useRecordingStore } from "@/stores/recordingStore";

describe("recordingStore", () => {
  beforeEach(() => {
    useRecordingStore.getState().reset();
  });

  it("has correct initial state", () => {
    const state = useRecordingStore.getState();
    expect(state.isRecording).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.isProcessing).toBe(false);
    expect(state.duration).toBe(0);
    expect(state.metering).toBe(0);
    expect(state.status).toBe("idle");
    expect(state.errorMessage).toBeNull();
    expect(state.interruptionMarkers).toEqual([]);
  });

  it("setRecording(true) transitions to recording state", () => {
    useRecordingStore.getState().setRecording(true);
    const state = useRecordingStore.getState();
    expect(state.isRecording).toBe(true);
    expect(state.status).toBe("recording");
  });

  it("setRecording(true) bumps sessionId and resets per-session fields", () => {
    useRecordingStore.getState().setRecording(true);
    useRecordingStore.getState().setPaused(true);
    useRecordingStore.getState().setDuration(42_000);
    useRecordingStore.getState().setError("Old error");

    useRecordingStore.getState().setRecording(true);

    const state = useRecordingStore.getState();
    expect(state.sessionId).toBe(2);
    expect(state.isPaused).toBe(false);
    expect(state.duration).toBe(0);
    expect(state.errorMessage).toBeNull();
    expect(state.status).toBe("recording");
  });

  it("setRecording(false) transitions back to idle", () => {
    useRecordingStore.getState().setRecording(true);
    useRecordingStore.getState().setRecording(false);
    const state = useRecordingStore.getState();
    expect(state.isRecording).toBe(false);
    expect(state.status).toBe("idle");
  });

  it("setPaused(true) during recording sets call-paused status", () => {
    useRecordingStore.getState().setRecording(true);
    useRecordingStore.getState().setPaused(true);
    const state = useRecordingStore.getState();
    expect(state.isPaused).toBe(true);
    expect(state.status).toBe("call-paused");
  });

  it("setProcessing(true) sets processing status", () => {
    useRecordingStore.getState().setProcessing(true);
    const state = useRecordingStore.getState();
    expect(state.isProcessing).toBe(true);
    expect(state.status).toBe("processing");
  });

  it("setProcessing(false) returns to idle", () => {
    useRecordingStore.getState().setProcessing(true);
    useRecordingStore.getState().setProcessing(false);
    const state = useRecordingStore.getState();
    expect(state.isProcessing).toBe(false);
    expect(state.status).toBe("idle");
  });

  it("setError sets error message and error status", () => {
    useRecordingStore.getState().setError("Recording failed");
    const state = useRecordingStore.getState();
    expect(state.errorMessage).toBe("Recording failed");
    expect(state.status).toBe("error");
  });

  it("setError(null) clears error and returns to idle", () => {
    useRecordingStore.getState().setError("Recording failed");
    useRecordingStore.getState().setError(null);
    const state = useRecordingStore.getState();
    expect(state.errorMessage).toBeNull();
    expect(state.status).toBe("idle");
  });

  it("resume() clears paused and returns to recording", () => {
    useRecordingStore.getState().setRecording(true);
    useRecordingStore.getState().setPaused(true);
    useRecordingStore.getState().resume();
    const state = useRecordingStore.getState();
    expect(state.isPaused).toBe(false);
    expect(state.status).toBe("recording");
  });

  it("addInterruptionMarker appends to markers array", () => {
    useRecordingStore.getState().addInterruptionMarker(1000);
    useRecordingStore.getState().addInterruptionMarker(2000);
    const state = useRecordingStore.getState();
    expect(state.interruptionMarkers).toEqual([1000, 2000]);
  });

  it("reset returns to exact initial state", () => {
    useRecordingStore.getState().setRecording(true);
    useRecordingStore.getState().setDuration(5000);
    useRecordingStore.getState().setMetering(0.75);
    useRecordingStore.getState().addInterruptionMarker(1000);
    useRecordingStore.getState().reset();
    const state = useRecordingStore.getState();
    expect(state.isRecording).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.isProcessing).toBe(false);
    expect(state.duration).toBe(0);
    expect(state.metering).toBe(0);
    expect(state.status).toBe("idle");
    expect(state.errorMessage).toBeNull();
    expect(state.interruptionMarkers).toEqual([]);
  });
});
