import type { ReactElement } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { EntryCategory } from "@/types/entry";

interface ThoughtShredderProps {
  entry: { id: string; category: EntryCategory };
  cardLayout: { x: number; y: number; width: number; height: number };
  tabTargetPosition: { x: number; y: number };
  onComplete: () => void;
}

function buildCrackPath(seed: number, width: number, height: number): string {
  const y1 = 8 + (seed % 12);
  const y2 = height * 0.4 + (seed % 8);
  const y3 = height * 0.75 - (seed % 10);
  return `M 0 ${y1} L ${width * 0.35} ${y2} L ${width * 0.7} ${y3} L ${width} ${height - y1}`;
}

export function ThoughtShredder({
  entry,
  cardLayout,
  tabTargetPosition,
  onComplete,
}: ThoughtShredderProps): ReactElement {
  const deltaX = tabTargetPosition.x - cardLayout.x;
  const deltaY = tabTargetPosition.y - cardLayout.y;
  const crackOpacity = useSharedValue(0);
  const fragmentProgress = useSharedValue(0);
  const fadeOut = useSharedValue(1);

  useEffect(() => {
    crackOpacity.value = withTiming(1, { duration: 300 });
    fragmentProgress.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 100, mass: 0.8 }));
    fadeOut.value = withDelay(700, withTiming(0, { duration: 600 }));
    crackOpacity.value = withDelay(
      1300,
      withTiming(0, { duration: 0 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }),
    );
  }, [crackOpacity, fadeOut, fragmentProgress, onComplete]);

  const fragmentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: deltaX * fragmentProgress.value },
      { translateY: deltaY * fragmentProgress.value },
      { rotate: `${30 * fragmentProgress.value}deg` },
    ],
    opacity: fadeOut.value,
  }));

  const crackStyle = useAnimatedStyle(() => ({
    opacity: crackOpacity.value,
  }));

  const seed = entry.id.charCodeAt(0) % 100;
  const paths = [0, 1, 2, 3].map((offset) =>
    Skia.Path.MakeFromSVGString(buildCrackPath(seed + offset * 7, cardLayout.width, cardLayout.height)),
  );

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: cardLayout.y,
        left: cardLayout.x,
        width: cardLayout.width,
        height: cardLayout.height,
      }}
    >
      <Animated.View style={crackStyle}>
        <Canvas style={{ width: cardLayout.width, height: cardLayout.height }}>
          {paths.map((path, index) =>
            path ? <Path key={index} path={path} color="#2A2631" style="stroke" strokeWidth={2} /> : null,
          )}
        </Canvas>
      </Animated.View>

      <View className="absolute inset-0 flex-row flex-wrap">
        {new Array(6).fill(0).map((_, index) => (
          <Animated.View
            key={index}
            style={fragmentStyle}
            className="w-1/3 h-1/2 border border-border/20 bg-card/40"
          />
        ))}
      </View>
    </View>
  );
}
