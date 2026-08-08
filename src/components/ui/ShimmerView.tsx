import type { ReactElement } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/utils/cn";

interface ShimmerViewProps {
  className?: string;
}

/**
 * Skeletal shimmer placeholder with an animated highlight sweep.
 * A warm highlight band travels across the muted block (ambient layer);
 * honors reduced-motion by rendering a static placeholder.
 */
export function ShimmerView({ className }: ShimmerViewProps): ReactElement {
  const sweep = useSharedValue(-1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
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
  }, [reducedMotion, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${sweep.value * 100}%` }],
  }));

  return (
    <View
      className={cn("bg-muted/70 rounded-xl overflow-hidden relative", className)}
    >
      {!reducedMotion ? (
        <Animated.View
          className="absolute inset-y-0 w-1/2 bg-card/80 rotate-12"
          style={sweepStyle}
        />
      ) : null}
    </View>
  );
}
