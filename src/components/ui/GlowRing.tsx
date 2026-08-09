import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View } from 'react-native';

interface GlowRingProps {
  isActive: boolean;
}

export function GlowRing({ isActive }: GlowRingProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: static ring, no pulse loop.
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = 0;
      scale.value = 0.95;
      return;
    }

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
      // Idle breathing — the recorder is alive, waiting. Very quiet.
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.05, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.14, { duration: 1400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(0.95, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.02, { duration: 1400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }
  }, [isActive, opacity, reducedMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      className="absolute w-[180px] h-[180px] items-center justify-center"
      pointerEvents="none"
    >
      <Animated.View
        className="w-full h-full rounded-full bg-primary/25"
        style={animatedStyle}
      />
    </View>
  );
}
