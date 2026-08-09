import { lazy, Suspense, useEffect, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
// Lazy so the Skia module (which captures CanvasKit at import time) only
// evaluates after the web wasm runtime is ready; native loads it on demand.
const ThoughtShredder = lazy(() =>
  import('@/components/ui/ThoughtShredder').then((module) => ({
    default: module.ThoughtShredder,
  })),
);
import { useLocale } from '@/i18n';
import { useTheme } from '@/hooks/useTheme';
import { primaryTextHex } from '@/theme/colors';
import { useEntriesStore } from '@/stores/entriesStore';
import { useRecordingStore } from '@/stores/recordingStore';

interface TranscriptionResultProps {
  visible: boolean;
  tabTargetPosition?: { x: number; y: number };
  onShredderComplete?: () => void;
}

export function TranscriptionResult({
  visible,
  tabTargetPosition,
  onShredderComplete,
}: TranscriptionResultProps) {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const entry = useEntriesStore((state) => state.entries[0]);
  const setProcessing = useRecordingStore((s) => s.setProcessing);
  const [show, setShow] = useState(false);
  const [showShredder, setShowShredder] = useState(false);
  const [cardLayout, setCardLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (visible && entry) {
      setShow(true);
      setShowShredder(false);
      opacity.value = withSpring(1);
      translateY.value = withSpring(0);

      let hideTimer: ReturnType<typeof setTimeout> | undefined;
      const timer = setTimeout(() => {
        if (onShredderComplete && tabTargetPosition && Platform.OS !== "web") {
          setShowShredder(true);
          return;
        }

        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(20, { duration: 300 });
        hideTimer = setTimeout(() => {
          setShow(false);
          setProcessing(false);
        }, 350);
      }, 4000);

      return () => {
        clearTimeout(timer);
        if (hideTimer) {
          clearTimeout(hideTimer);
        }
      };
    } else {
      setShow(false);
    }
  }, [visible, entry, opacity, translateY, setProcessing, onShredderComplete, tabTargetPosition]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!show || !entry) return null;

  return (
    <Animated.View style={animatedStyle} className="mx-8">
      <View
        className="bg-card rounded-2xl border-2 border-border/30 px-5 py-4 shadow-[2px_2px_0px_theme(colors.border)] gap-3"
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setCardLayout({ x, y, width, height });
        }}
      >
        <Text className="font-sans text-base font-medium text-foreground leading-6">
          {entry.text}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="bg-accent px-2 py-0.5 rounded-full">
            <Text className="text-xs font-bold text-accent-foreground">
              {t("sheet.categoryNote")}
            </Text>
          </View>
        </View>

        <Text className="font-sans text-xs font-medium text-center mt-1" style={{ color: primaryTextHex(isDark) }}>
          {t("result.tapAnother")}
        </Text>
      </View>

      {showShredder && tabTargetPosition ? (
        <Suspense fallback={null}>
          <ThoughtShredder
            entry={entry}
            cardLayout={cardLayout}
            tabTargetPosition={tabTargetPosition}
            onComplete={() => {
              setShow(false);
              setShowShredder(false);
              setProcessing(false);
              onShredderComplete?.();
            }}
          />
        </Suspense>
      ) : null}
    </Animated.View>
  );
}
