import type { ReactElement } from 'react';
import { Text } from 'react-native';
import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useLocale } from '@/i18n';
import { useRecordingStore } from '@/stores/recordingStore';

export function PromptText(): ReactElement {
  const { t } = useLocale();
  const isRecording = useRecordingStore((state) => state.isRecording);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(isRecording ? 0 : 1, {
      duration: isRecording ? 150 : 300,
    });
  }, [isRecording, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text className="font-heading text-xl font-bold text-foreground/80 tracking-wide text-center">
        {t("home.tapToRecord")}
      </Text>
    </Animated.View>
  );
}
