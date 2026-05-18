import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { useRecordingStore } from '@/stores/recordingStore';

export function useInterruptionHandler(): void {
  const appState = useRef(AppState.currentState);
  const isRecording = useRecordingStore((state) => state.isRecording);
  const resume = useRecordingStore((state) => state.resume);
  const setPaused = useRecordingStore((state) => state.setPaused);

  useEffect(() => {
    void setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current === 'active' && nextState === 'inactive') {
        if (isRecording) {
          setPaused(true);
        }
      } else if (appState.current === 'inactive' && nextState === 'active') {
        if (isRecording) {
          resume();
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isRecording, setPaused, resume]);
}
