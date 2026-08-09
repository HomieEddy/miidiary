import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { i18n, useLocale } from "@/i18n";
import { easings } from "@/utils/motion";

const PROMPT_INTERVAL_MS = 12000;

/**
 * Daily Spark — the app's hero card. Rotates through reflection prompts
 * with a paper-fade crossfade, while the spark illustration floats
 * slowly over a warm gradient band (ambient layer). Honors
 * reduced-motion (crossfade only).
 */
export function DailySparkCard(): ReactElement {
  const { t } = useLocale();
  const prompts = i18n.t("home.quotes") as unknown as string[];
  const [promptIndex, setPromptIndex] = useState(0);
  const promptOpacity = useSharedValue(1);
  const promptOffset = useSharedValue(0);
  const floatY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      promptOpacity.value = withSequence(
        withTiming(0, { duration: 220, easing: easings.exit }),
        withTiming(1, { duration: 260, easing: easings.entrance }),
      );
      promptOffset.value = withSequence(
        withTiming(-6, { duration: 220, easing: easings.exit }),
        withTiming(0, { duration: 260, easing: easings.entrance }),
      );
      setPromptIndex((current) => (current + 1) % prompts.length);
    }, PROMPT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [promptOffset, promptOpacity, prompts, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      // Reduced motion: stop any running float loop and rest the spark.
      cancelAnimation(floatY);
      floatY.value = 0;
      return;
    }

    // Ambient: the spark drifts gently, like a leaf on the page.
    floatY.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 2200, easing: easings.ambient }),
        withTiming(-4, { duration: 2200, easing: easings.ambient }),
      ),
      -1,
      true,
    );

    return () => cancelAnimation(floatY);
  }, [floatY, reducedMotion]);

  const promptStyle = useAnimatedStyle(() => ({
    opacity: promptOpacity.value,
    transform: [{ translateY: promptOffset.value }],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View className="relative bg-secondary border-4 border-border rounded-3xl p-6 shadow-paper -rotate-2 overflow-hidden">
      <LinearGradient
        colors={["rgba(255,107,158,0.10)", "rgba(255,107,158,0)", "rgba(255,255,255,0.06)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <Animated.View
        className="absolute -top-10 -right-4 z-10 w-20 h-20"
        style={floatStyle}
      >
        <Image
          source={require('../../assets/images/spark-illustration.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
          transition={300}
        />
      </Animated.View>
      <Text className="font-heading text-xl mb-1 text-secondary-foreground tracking-wide">
        {t("home.sparkTitle")}
      </Text>
      <Animated.View style={promptStyle}>
        <Text
          key={promptIndex}
          className="text-sm text-secondary-foreground font-medium"
        >
          "{prompts[promptIndex]}"
        </Text>
      </Animated.View>
    </View>
  );
}
