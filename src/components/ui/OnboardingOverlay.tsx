import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SvgXml } from "react-native-svg";
import { useLocale } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";
import { getPref, setPref } from "@/services/appPrefsService";
import { cn } from "@/utils/cn";

const ONBOARDING_SEEN_KEY = "onboarding_seen";

const SLIDE_ICONS = [
  `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="currentColor" opacity=".6"/><path d="M6 11a6 6 0 0 0 12 0h2a8 8 0 0 1-7 7.93V21h-2v-2.07A8 8 0 0 1 4 11h2z" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none"><rect x="4.5" y="4.5" width="15" height="15" rx="3" stroke="currentColor" stroke-width="2"/><path d="M8.5 12.2l2.3 2.3 4.7-4.9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11z" fill="currentColor" opacity=".3"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
] as const;

const SLIDES = [
  { icon: SLIDE_ICONS[0], titleKey: "onboarding.slide1Title", bodyKey: "onboarding.slide1Body" },
  { icon: SLIDE_ICONS[1], titleKey: "onboarding.slide2Title", bodyKey: "onboarding.slide2Body" },
  { icon: SLIDE_ICONS[2], titleKey: "onboarding.slide3Title", bodyKey: "onboarding.slide3Body" },
] as const;

/** First-launch onboarding: 3 slides, dots, skip/start. Rendered once. */
export function OnboardingOverlay(): ReactElement | null {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (getPref(ONBOARDING_SEEN_KEY) !== "1") {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  const complete = (): void => {
    setPref(ONBOARDING_SEEN_KEY, "1");
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setVisible(false);
  };

  const onMomentumEnd = (offsetX: number): void => {
    const next = Math.round(offsetX / 340);
    setSlideIndex(Math.max(0, Math.min(next, SLIDES.length - 1)));
  };

  const dotColor = isDark ? "#9B93A4" : "#8A828F";

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="absolute inset-0 z-50 bg-background"
    >
      <View className="flex-1">
        <View className="flex-row justify-end px-6 pt-14">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.skip")}
            onPress={complete}
            className="px-3 py-2 rounded-xl border-2 border-border bg-card"
          >
            <Text className="font-sans text-sm font-bold text-foreground">{t("onboarding.skip")}</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => onMomentumEnd(event.nativeEvent.contentOffset.x)}
          className="flex-1"
        >
          {SLIDES.map((slide, index) => (
            <View key={slide.titleKey} className="w-[100%] px-10 items-center justify-center">
              <View
                className="w-28 h-28 rounded-3xl border-4 border-border items-center justify-center shadow-paper mb-8"
                style={{ backgroundColor: isDark ? "#2A2631" : "#FFFFFF" }}
              >
                <SvgXml xml={slide.icon} width={56} height={56} color="#C2377E" />
              </View>
              <Text className="font-heading text-3xl text-foreground text-center tracking-wide">
                {t(slide.titleKey)}
              </Text>
              <Text className="font-sans text-base text-muted-foreground text-center mt-3 leading-relaxed">
                {t(slide.bodyKey)}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View className="flex-row justify-center gap-2 pb-4" accessibilityRole="tablist">
          {SLIDES.map((slide, index) => (
            <View
              key={slide.titleKey}
              className={cn("w-2.5 h-2.5 rounded-full", index === slideIndex ? "bg-primary" : "bg-muted")}
            />
          ))}
        </View>

        <View className="px-8 pb-16">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.start")}
            className="bg-primary border-2 border-border rounded-2xl p-4 active:translate-y-1 active:translate-x-1 active:shadow-none shadow-paper"
            onPress={complete}
          >
            <Text className="font-sans text-center font-bold text-primary-foreground text-base">
              {t("onboarding.start")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
