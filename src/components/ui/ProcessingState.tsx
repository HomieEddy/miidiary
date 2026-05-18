import { View, Text, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { useEffect } from 'react';

interface ProcessingStateProps {
  visible: boolean;
}

export function ProcessingState({ visible }: ProcessingStateProps) {
  const opacity = useSharedValue(0);

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
          Processing transcription...
        </Text>
      </View>
    </Animated.View>
  );
}
