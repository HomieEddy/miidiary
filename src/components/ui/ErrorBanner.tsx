import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useRecordingStore } from '@/stores/recordingStore';

const WARNING_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 7.75a.75.75 0 0 1 .75.75v4a.75.75 0 0 1-1.5 0v-4a.75.75 0 0 1 .75-.75zM12 16.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" fill="currentColor" opacity="0.5"/><path d="M1.745 20.418a1.5 1.5 0 0 1 1.317-2.272h17.876a1.5 1.5 0 0 1 1.317 2.272l-8.938 15.013a1.5 1.5 0 0 1-2.634 0L1.745 20.418z" fill="currentColor" opacity="0.3"/></svg>`;

interface ErrorBannerProps {
  visible: boolean;
  onRetry?: () => void;
}

export function ErrorBanner({ visible, onRetry }: ErrorBannerProps) {
  const { errorMessage, setError } = useRecordingStore();
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    if (visible && errorMessage) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
      });
      translateX.value = withTiming(0, { duration: 300 });

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) });
        translateX.value = withTiming(-20, { duration: 500 });
        setTimeout(() => setError(null), 550);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, errorMessage, opacity, translateX, setError]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (!visible || !errorMessage) return null;

  return (
    <Pressable onPress={() => { setError(null); onRetry?.(); }}>
      <Animated.View style={animatedStyle}>
        <View className="bg-destructive/10 border-l-4 border-destructive rounded-xl px-4 py-3 mx-8 flex-row items-center gap-3">
          <SvgXml xml={WARNING_ICON} width={20} height={20} color="#EF476F" />
          <View className="flex-1">
            <Text className="font-sans text-xs font-bold text-destructive">
              {errorMessage}
            </Text>
            <Text className="font-sans text-xs font-medium text-destructive/80 mt-0.5">
              Tap to try again
            </Text>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
