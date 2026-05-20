import { AudioModule, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { WHISPER_QUALITY } from '@/utils/recordingPresets';
import { File } from 'expo-file-system';

export const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing',
  CALL_PAUSED: 'call-paused',
  ERROR: 'error',
} as const;

export type RecordingStatus = (typeof RECORDING_STATES)[keyof typeof RECORDING_STATES];

const STOP_RECORDING_TIMEOUT_MS = 5_000;

export class AudioCaptureService {
  private recorder: InstanceType<typeof AudioModule.AudioRecorder> | null = null;
  private tempFilePath: string | null = null;
  private lastError: string | null = null;
  private meteringCallback: ((value: number) => void) | null = null;
  private readonly pendingProcessing = new Set<string>();

  onMetering(cb: (value: number) => void) {
    this.meteringCallback = cb;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        this.lastError = 'Microphone permission was denied.';
        return false;
      }
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      return true;
    } catch (error) {
      this.lastError = `Microphone permission setup failed: ${this.describeError(error)}`;
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      this.lastError = null;
      const granted = await this.requestPermissions();
      if (!granted) return false;

      this.recorder = new AudioModule.AudioRecorder(WHISPER_QUALITY);
      await this.recorder.prepareToRecordAsync();
      this.recorder.record();
      this.tempFilePath = this.recorder.uri;

      this.pollMetering();

      return true;
    } catch (error) {
      this.lastError = `Native recorder failed to start: ${this.describeError(error)}`;
      this.cleanupAfterError();
      return false;
    }
  }

  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  private pollMetering() {
    this.pollingInterval = setInterval(() => {
      if (!this.recorder) {
        if (this.pollingInterval) {
          clearInterval(this.pollingInterval);
          this.pollingInterval = null;
        }
        return;
      }
      try {
        const status = this.recorder.getStatus();
        const metering = status.metering;
        if (metering !== undefined && metering !== null && this.meteringCallback) {
          const linear = metering <= -160 ? 0 : Math.pow(10, metering / 20);
          this.meteringCallback(Math.min(1, Math.max(0, linear)));
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 16);
  }

  async stopRecording(): Promise<string | null> {
    const recorder = this.recorder;
    const uri = recorder?.uri || this.tempFilePath;

    if (!recorder) {
      return null;
    }

    try {
      await this.withTimeout(recorder.stop(), STOP_RECORDING_TIMEOUT_MS);
      return uri ?? null;
    } catch (error) {
      this.lastError = `Native recorder failed to stop: ${this.describeError(error)}`;
      return null;
    } finally {
      this.clearPolling();
      this.recorder = null;
    }
  }

  async cleanupTempFile(uri: string): Promise<void> {
    try {
      const file = new File(uri);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // Silently ignore cleanup errors
    }
  }

  private async cleanupAfterError() {
    this.clearPolling();
    this.recorder = null;
    if (this.tempFilePath) {
      await this.cleanupTempFile(this.tempFilePath);
      this.tempFilePath = null;
    }
  }

  getTempFilePath(): string | null {
    return this.tempFilePath;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  markPendingProcessing(uri: string): void {
    this.pendingProcessing.add(uri);
  }

  markProcessingComplete(uri: string): void {
    this.pendingProcessing.delete(uri);
  }

  getPendingProcessingUris(): string[] {
    return [...this.pendingProcessing.values()];
  }

  private clearPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeout = setTimeout(() => {
            reject(new Error('Timed out while stopping recording'));
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  private describeError(error: unknown): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message.trim();
    }

    if (typeof error === 'string' && error.trim()) {
      return error.trim();
    }

    return 'unknown error';
  }
}

export const audioCaptureService = new AudioCaptureService();
