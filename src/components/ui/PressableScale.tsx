import type { PropsWithChildren, ReactElement } from "react";
import { useCallback } from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { springs } from "@/utils/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  /** Pressed scale, default 0.97. */
  scaleTo?: number;
}

/**
 * Pressable with spring scale feedback (squash on press-in, paper
 * settle on release). Honors reduced-motion by disabling the scale.
 */
export function PressableScale({
  children,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: PropsWithChildren<PressableScaleProps>): ReactElement {
  const scale = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!reducedMotion) {
        scale.value = withSpring(scaleTo, springs.snappy);
      }
      onPressIn?.(event);
    },
    [onPressIn, reducedMotion, scale, scaleTo],
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      if (!reducedMotion) {
        scale.value = withSpring(1, springs.paper);
      }
      onPressOut?.(event);
    },
    [onPressOut, reducedMotion, scale],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
