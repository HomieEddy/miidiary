import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEntriesStore } from '@/stores/entriesStore';
import { useRecordingStore } from '@/stores/recordingStore';

interface TranscriptionResultProps {
  visible: boolean;
}

export function TranscriptionResult({ visible }: TranscriptionResultProps) {
  const entry = useEntriesStore((state) => state.entries[0]);
  const setProcessing = useRecordingStore((s) => s.setProcessing);
  const [show, setShow] = useState(false);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible && entry) {
      setShow(true);
      opacity.value = withSpring(1);
      translateY.value = withSpring(0);

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(20, { duration: 300 });
        setTimeout(() => {
          setShow(false);
          setProcessing(false);
        }, 350);
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, entry, opacity, translateY, setProcessing]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!show || !entry) return null;

  return (
    <Animated.View style={animatedStyle} className="mx-8">
      <View className="bg-card rounded-2xl border-2 border-border/30 px-5 py-4 shadow-[2px_2px_0px_theme(colors.border)] gap-3">
        <Text className="font-sans text-base font-medium text-foreground leading-6">
          {entry.text}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="bg-accent px-2 py-0.5 rounded-full">
            <Text className="text-xs font-bold text-accent-foreground">
              Note
            </Text>
          </View>
        </View>

        <Text className="font-sans text-xs font-medium text-primary text-center mt-1">
          Tap to record another thought
        </Text>
      </View>
    </Animated.View>
  );
}
