import { useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { audioCaptureService } from '@/services/audioCaptureService';
import { useRecordingStore } from '@/stores/recordingStore';
import * as Haptics from 'expo-haptics';
import type { RecordingStatus } from '@/stores/recordingStore';

const BUFFER_SIZE = 120;

interface UseAudioCaptureResult {
  amplitudes: { value: number[] };
  isPaused: boolean;
  isProcessing: boolean;
  isRecording: boolean;
  retry: () => void;
  startRecording: () => Promise<void>;
  status: RecordingStatus;
  stopRecording: () => Promise<string | undefined>;
}

export function useAudioCapture(): UseAudioCaptureResult {
  const isRecording = useRecordingStore((state) => state.isRecording);
  const isPaused = useRecordingStore((state) => state.isPaused);
  const isProcessing = useRecordingStore((state) => state.isProcessing);
  const status = useRecordingStore((state) => state.status);
  const reset = useRecordingStore((state) => state.reset);
  const setDuration = useRecordingStore((state) => state.setDuration);
  const setError = useRecordingStore((state) => state.setError);
  const setMetering = useRecordingStore((state) => state.setMetering);
  const setProcessing = useRecordingStore((state) => state.setProcessing);
  const setRecording = useRecordingStore((state) => state.setRecording);

  const amplitudes = useSharedValue<number[]>(new Array(BUFFER_SIZE).fill(0));
  const durationRef = useRef(0);
  const smoothedAmplitude = useRef(0);
  const amplitudeBufferRef = useRef<number[]>(new Array(BUFFER_SIZE).fill(0));

  const startRecording = useCallback(async () => {
    const success = await audioCaptureService.startRecording();
    if (!success) {
      setRecording(false);
      setError('Recording failed');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setRecording(true);

    audioCaptureService.onMetering((value: number) => {
      const alpha = 0.3;
      const smoothed = smoothedAmplitude.current + alpha * (value - smoothedAmplitude.current);
      smoothedAmplitude.current = smoothed;

      setMetering(smoothed);

      const buf = [...amplitudeBufferRef.current];
      buf.shift();
      buf.push(smoothed);
      amplitudeBufferRef.current = buf;
      amplitudes.value = buf;
    });

    durationRef.current = Date.now();
  }, [setRecording, setError, setMetering, amplitudes]);

  const stopRecording = useCallback(async (): Promise<string | undefined> => {
    const uri = await audioCaptureService.stopRecording();

    if (durationRef.current) {
      const elapsed = Date.now() - durationRef.current;
      setDuration(elapsed);
    }

    if (!uri) {
      setError('Recording failed');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return undefined;
    }

    setRecording(false);
    setProcessing(true);

    return uri;
  }, [setRecording, setProcessing, setError, setDuration]);

  const retry = useCallback(() => {
    reset();
  }, [reset]);

  return {
    isRecording,
    isPaused,
    isProcessing,
    status,
    amplitudes,
    startRecording,
    stopRecording,
    retry,
  };
}
