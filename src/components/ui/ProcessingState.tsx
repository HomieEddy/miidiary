import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useLocale } from '@/i18n';
import { useRecordingStore } from '@/stores/recordingStore';

interface ProcessingStateProps {
  visible: boolean;
}

const DOT_COUNT = 3;

/**
 * Processing state card: three paper dots pulse in sequence while a
 * stage runs. Honors reduced-motion (static dots).
 */
export function ProcessingState({ visible }: ProcessingStateProps) {
  const { t } = useLocale();
  const processingStage = useRecordingStore((state) => state.processingStage);

  const stageLabel: Record<typeof processingStage, string> = {
    idle: t("processing.idle"),
    preparing: t("processing.preparing"),
    transcribing: t("processing.transcribing"),
    classifying: t("processing.classifying"),
    persisting: t("processing.persisting"),
    finalizing: t("processing.finalizing"),
  };

  if (!visible) return null;

  return (
    <View className="bg-muted/50 rounded-2xl px-6 py-4 self-center flex-row items-center gap-3">
      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: DOT_COUNT }, (_, index) => (
          <PulseDot key={index} index={index} />
        ))}
      </View>
      <Text className="font-sans text-base font-medium text-muted-foreground">
        {stageLabel[processingStage]}
      </Text>
    </View>
  );
}

function PulseDot({ index }: { index: number }): ReactElement {
  const pulse = useSharedValue(0.35);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: stop any running pulse loop and rest the dot.
      cancelAnimation(pulse);
      pulse.value = 0.35;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withDelay(
          index * 160,
          withTiming(1, { duration: 480, easing: Easing.inOut(Easing.sin) }),
        ),
        withTiming(0.35, { duration: 480, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(pulse);
  }, [index, pulse, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.7 + pulse.value * 0.3 }],
  }));

  return (
    <Animated.View
      style={[
        style,
        { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF6B9E' },
      ]}
    />
  );
}
