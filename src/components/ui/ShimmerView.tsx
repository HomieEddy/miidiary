import type { ReactElement } from "react";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { cn } from "@/utils/cn";

export function ShimmerView({ className }: { className?: string }): ReactElement {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 600 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View className={cn("bg-muted rounded-xl", className)} style={animatedStyle} />;
}
