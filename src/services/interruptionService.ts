import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { audioCaptureService } from '@/services/audioCaptureService';
import { useRecordingStore } from '@/stores/recordingStore';

export function useInterruptionHandler(): void {
  const appState = useRef(AppState.currentState);
  const isRecording = useRecordingStore((state) => state.isRecording);
  const isPaused = useRecordingStore((state) => state.isPaused);
  const setPaused = useRecordingStore((state) => state.setPaused);

  useEffect(() => {
    void setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      const prevState = appState.current;
      const leavingActive = prevState === 'active' && nextState !== 'active';
      const enteringActive = prevState !== 'active' && nextState === 'active';

      if (leavingActive && isRecording && !isPaused) {
        setPaused(true);
        void audioCaptureService.pause();
      } else if (enteringActive && isRecording && isPaused) {
        setPaused(false);
        void audioCaptureService.resume();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isRecording, isPaused, setPaused]);
}
