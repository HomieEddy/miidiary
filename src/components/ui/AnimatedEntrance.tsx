import type { PropsWithChildren, ReactElement } from "react";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { fadeUpStyle, springs } from "@/utils/motion";

interface AnimatedEntranceProps {
  /** Stagger delay in ms (micro cascade: 0, 50, 100, ...). */
  delay?: number;
  className?: string;
}

/**
 * Fade-up entrance wrapper — the app's signature entrance pattern.
 * Paper settle spring, gentle rise, honors reduced-motion (fade only).
 */
export function AnimatedEntrance({
  children,
  delay = 0,
  className,
}: PropsWithChildren<AnimatedEntranceProps>): ReactElement {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withSpring(1, { ...springs.paper }),
    );
  }, [delay, progress, reducedMotion]);

  const style = useAnimatedStyle(() => fadeUpStyle(progress.value, reducedMotion));

  return (
    <Animated.View style={style} className={className}>
      {children}
    </Animated.View>
  );
}
