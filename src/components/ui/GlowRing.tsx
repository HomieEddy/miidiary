import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { View } from 'react-native';

interface GlowRingProps {
  isActive: boolean;
}

export function GlowRing({ isActive }: GlowRingProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (isActive) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      scale.value = withTiming(1.0, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.95, { duration: 300 });
    }
  }, [isActive, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="absolute w-[180px] h-[180px] items-center justify-center">
      <Animated.View
        className="w-full h-full rounded-full bg-primary/25"
        style={animatedStyle}
      />
    </View>
  );
}
