import { View, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { useEffect } from 'react';
import { useRecordingStore } from '@/stores/recordingStore';

interface ProcessingStateProps {
  visible: boolean;
}

export function ProcessingState({ visible }: ProcessingStateProps) {
  const opacity = useSharedValue(0);
  const processingStage = useRecordingStore((state) => state.processingStage);

  const stageLabel: Record<typeof processingStage, string> = {
    idle: 'Processing transcription...',
    preparing: 'Preparing model...',
    transcribing: 'Transcribing audio...',
    classifying: 'Classifying entry...',
    persisting: 'Saving entry...',
    finalizing: 'Finalizing...',
  };

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 150 : 200,
    });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={animatedStyle}>
      <View className="bg-muted/50 rounded-2xl px-6 py-4 self-center flex-row items-center gap-3">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text className="font-sans text-base font-medium text-muted-foreground">
          {stageLabel[processingStage]}
        </Text>
      </View>
    </Animated.View>
  );
}
