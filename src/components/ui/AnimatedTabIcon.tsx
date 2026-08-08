import type { ReactElement } from "react";
import { useEffect } from "react";
import { SvgXml } from "react-native-svg";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { springs } from "@/utils/motion";

interface AnimatedTabIconProps {
  focused: boolean;
  xml: string;
  color: string;
  size?: number;
}

/**
 * Tab icon with spring emphasis — pops to 112% on focus, settles back.
 * The signature "which drawer am I in" moment.
 */
export function AnimatedTabIcon({
  focused,
  xml,
  color,
  size = 24,
}: AnimatedTabIconProps): ReactElement {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      scale.value = withSpring(focused ? 1 : 1, {
        ...springs.snappy,
        reduceMotion: ReduceMotion.Always,
      });
      translateY.value = 0;
      return;
    }

    scale.value = withSpring(focused ? 1.14 : 1, springs.elastic);
    translateY.value = withSpring(focused ? -2 : 0, springs.paper);
  }, [focused, reducedMotion, scale, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <SvgXml xml={xml} color={color} width={size} height={size} />
    </Animated.View>
  );
}
