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

export class AudioCaptureService {
  private recorder: InstanceType<typeof AudioModule.AudioRecorder> | null = null;
  private tempFilePath: string | null = null;
  private meteringCallback: ((value: number) => void) | null = null;

  onMetering(cb: (value: number) => void) {
    this.meteringCallback = cb;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return false;
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      return true;
    } catch {
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      const granted = await this.requestPermissions();
      if (!granted) return false;

      this.recorder = new AudioModule.AudioRecorder(WHISPER_QUALITY);
      await this.recorder.prepareToRecordAsync();
      this.recorder.record();
      this.tempFilePath = this.recorder.uri;

      this.pollMetering();

      return true;
    } catch {
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
    try {
      await this.recorder?.stop();
      const uri = this.recorder?.uri ?? null;
      this.recorder = null;
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      return uri;
    } catch {
      return null;
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
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.recorder = null;
    if (this.tempFilePath) {
      await this.cleanupTempFile(this.tempFilePath);
      this.tempFilePath = null;
    }
  }

  getTempFilePath(): string | null {
    return this.tempFilePath;
  }
}

export const audioCaptureService = new AudioCaptureService();
