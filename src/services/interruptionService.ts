import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import { useRecordingStore } from '@/stores/recordingStore';

export function useInterruptionHandler() {
  const appState = useRef(AppState.currentState);
  const { isRecording, setPaused, resume } = useRecordingStore();

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionModeIOS: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
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
