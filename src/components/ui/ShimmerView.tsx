import type { ReactElement } from "react";
import { useEffect } from "react";
import { View } from "react-native";
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
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/utils/cn";

interface ShimmerViewProps {
  className?: string;
}

/**
 * Skeletal shimmer placeholder: a warm cream gradient band sweeps across
 * the muted block (ambient layer). Honors reduced-motion with a static
 * placeholder.
 */
export function ShimmerView({ className }: ShimmerViewProps): ReactElement {
  const sweep = useSharedValue(-1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: stop any running sweep and park the band off-canvas.
      cancelAnimation(sweep);
      sweep.value = -1;
      return;
    }

    sweep.value = withRepeat(
      withSequence(
        withDelay(
          300,
          withTiming(1.4, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        ),
        withTiming(-1, { duration: 0 }),
      ),
      -1,
      false,
    );

    return () => cancelAnimation(sweep);
  }, [reducedMotion, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${sweep.value * 100}%` }],
  }));

  return (
    <View
      className={cn("bg-muted/70 rounded-xl overflow-hidden relative", className)}
    >
      {!reducedMotion ? (
        <Animated.View className="absolute inset-y-0 w-1/2 -skew-x-12" style={sweepStyle}>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,251,240,0.75)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
