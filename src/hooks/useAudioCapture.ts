import { useCallback, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { audioCaptureService } from '@/services/audioCaptureService';
import { useRecordingStore } from '@/stores/recordingStore';
import * as Haptics from 'expo-haptics';

const BUFFER_SIZE = 120;

export function useAudioCapture() {
  const {
    isRecording, isPaused, isProcessing, status,
    setRecording, setPaused, setProcessing, setError,
    setDuration, setMetering, setStatus, reset,
  } = useRecordingStore();

  const amplitudes = useSharedValue<number[]>(new Array(BUFFER_SIZE).fill(0));
  const durationRef = useRef(0);
  const smoothedAmplitude = useRef(0);

  const startRecording = useCallback(async () => {
    const success = await audioCaptureService.startRecording();
    if (!success) {
      setRecording(false);
      setError('Recording failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setRecording(true);

    audioCaptureService.onMetering((value: number) => {
      const alpha = 0.3;
      const smoothed = smoothedAmplitude.current + alpha * (value - smoothedAmplitude.current);
      smoothedAmplitude.current = smoothed;

      setMetering(smoothed);

      const buf = [...amplitudes.value];
      buf.shift();
      buf.push(smoothed);
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
