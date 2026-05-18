import { useEffect, useRef, useCallback } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useRecordingStore } from '@/stores/recordingStore';
import { cn } from '@/utils/cn';

export function RecordingTimer(): React.ReactElement | null {
  const duration = useRecordingStore((state) => state.duration);
  const isPaused = useRecordingStore((state) => state.isPaused);
  const isRecording = useRecordingStore((state) => state.isRecording);
  const opacity = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      const now = Date.now();
      const currentDuration = useRecordingStore.getState().duration;
      startTimeRef.current = now - currentDuration;
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        useRecordingStore.getState().setDuration(elapsed);
      }, 100);
    } else if (!isRecording) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      useRecordingStore.getState().setDuration(0);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    opacity.value = withTiming(isRecording ? 1 : 0, { duration: 200 });
  }, [isRecording, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!isRecording) return null;

  return (
    <Animated.View style={animatedStyle} className="items-center">
      <View className="flex-row items-center gap-1.5 mb-1">
        <View className="w-2 h-2 rounded-full bg-primary" />
        <Text className="text-xs font-bold text-primary uppercase tracking-wider">
          {isPaused ? 'Call in progress — recording paused' : 'Recording'}
        </Text>
      </View>
      <Text className={cn(
        'font-sans text-4xl font-bold text-center tracking-wider',
        isPaused ? 'text-muted-foreground' : 'text-foreground'
      )}>
        {formatTime(duration)}
      </Text>
    </Animated.View>
  );
}
