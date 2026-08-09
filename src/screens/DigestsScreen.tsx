import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { LazyStatsCard } from "@/components/ui/LazyStatsCard";
import { PerformanceMeasureView } from "@shopify/react-native-performance";
import { useEntries } from "@/hooks/useEntries";
import { useScreenProfiler } from "@/hooks/useScreenProfiler";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { useSkiaReady } from "@/hooks/useSkiaReady";
import { useTheme } from "@/hooks/useTheme";
import { primaryTextHex } from "@/theme/colors";
import { useLocale, type AppLocale } from "@/i18n";
import { exportJson, exportPdf } from "@/services/exportService";
import {
  disableDailyReminder,
  enableDailyReminder,
  getScheduledReminder,
  REMINDER_PRESETS,
  type ReminderSettings,
} from "@/services/reminderService";
import { cn } from "@/utils/cn";

const reminderSupported = Platform.OS !== "web";

export default function DigestsScreen() {
  useScreenProfiler();
  const bottomClearance = useTabBarClearance();
  const { isDark, themeOverride, setThemeOverride } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const {
    showWipeConfirmStepOne,
    showWipeConfirmStepTwo,
    requestWipeAll,
    cancelWipeAll,
    continueWipeAll,
    confirmWipeAll,
  } = useEntries({ autoLoad: false });

  const [reminder, setReminder] = useState<ReminderSettings | null>(null);
  const [reminderBusy, setReminderBusy] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [exportBusy, setExportBusy] = useState<"json" | "pdf" | null>(null);
  const [exportError, setExportError] = useState(false);

  useEffect(() => {
    if (!reminderSupported) {
      return;
    }

    void getScheduledReminder().then((scheduled) => setReminder(scheduled));
  }, []);

  const handleEnableReminder = useCallback(async (hour: number, minute: number) => {
    setReminderBusy(true);
    setPermissionDenied(false);
    const ok = await enableDailyReminder(hour, minute);
    if (ok) {
      setReminder({ enabled: true, hour, minute });
    } else {
      setPermissionDenied(true);
    }
    setReminderBusy(false);
  }, []);

  const handleDisableReminder = useCallback(async () => {
    setReminderBusy(true);
    await disableDailyReminder();
    setReminder(null);
    setReminderBusy(false);
  }, []);

  const handleExport = useCallback(async (kind: "json" | "pdf") => {
    setExportBusy(kind);
    setExportError(false);
    try {
      if (kind === "json") {
        await exportJson();
      } else {
        await exportPdf();
      }
    } catch {
      setExportError(true);
    } finally {
      setExportBusy(null);
    }
  }, []);

  const selectedReminderLabel = reminder
    ? t("reminders.enabledAt", {
        time: `${String(reminder.hour).padStart(2, "0")}:${String(reminder.minute).padStart(2, "0")}`,
      })
    : null;

  return (
    <PerformanceMeasureView screenName="DigestsScreen" interactive>
      <View className="flex-1 bg-background font-sans">
      <ScrollView
        className="flex-1 text-foreground"
        contentContainerStyle={{
          paddingBottom: bottomClearance,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
      <AnimatedEntrance>
        <Text className="font-heading text-4xl text-foreground tracking-wide">{t("digests.title")}</Text>
      </AnimatedEntrance>
      <AnimatedEntrance delay={60}>
        <Text className="font-sans text-base text-muted-foreground mt-3">
          {t("digests.subtitle")}
        </Text>
      </AnimatedEntrance>

      <AnimatedEntrance delay={120}>
        <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper mt-8">
          <Text className="font-heading text-2xl text-foreground">{t("digests.settings")}</Text>
          <Text className="font-sans text-sm text-muted-foreground mt-2">
            {t("digests.settingsBody")}
          </Text>

          <View className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] rotate-1 mb-4 mt-4">
            <Text className="font-heading text-lg text-foreground mb-3">{t("digests.appearance")}</Text>
            {(["system", "light", "dark"] as const).map((mode) => (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityLabel={t(`digests.${mode}`)}
                accessibilityState={{ selected: themeOverride === mode }}
                onPress={() => setThemeOverride(mode)}
                className={cn(
                  "flex-row items-center py-2",
                  themeOverride === mode ? "opacity-100" : "opacity-50",
                )}
              >
                <View
                  className={cn(
                    "w-4 h-4 rounded-full border-2 border-border mr-3 items-center justify-center",
                    themeOverride === mode && "border-primary",
                  )}
                >
                  {themeOverride === mode ? (
                    <Animated.View
                      entering={ZoomIn.springify().damping(12).stiffness(240)}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ) : null}
                </View>
                <Text className="font-sans text-foreground capitalize">
                  {t(`digests.${mode}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] -rotate-1 mb-4">
            <Text className="font-heading text-lg text-foreground mb-3">{t("digests.language")}</Text>
            {(["en", "fr"] as AppLocale[]).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={t(`digests.${option}`)}
                accessibilityState={{ selected: locale === option }}
                onPress={() => setLocale(option)}
                className={cn(
                  "flex-row items-center py-2",
                  locale === option ? "opacity-100" : "opacity-50",
                )}
              >
                <View
                  className={cn(
                    "w-4 h-4 rounded-full border-2 border-border mr-3 items-center justify-center",
                    locale === option && "border-primary",
                  )}
                >
                  {locale === option ? (
                    <Animated.View
                      entering={ZoomIn.springify().damping(12).stiffness(240)}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  ) : null}
                </View>
                <Text className="font-sans text-foreground">
                  {option === "en" ? t("digests.english") : t("digests.french")}
                </Text>
              </Pressable>
            ))}
          </View>

          {reminderSupported ? (
            <View className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] rotate-1 mb-4">
              <Text className="font-heading text-lg text-foreground mb-1">{t("reminders.title")}</Text>
              <Text className="font-sans text-sm text-muted-foreground mb-3">{t("reminders.body")}</Text>

              {reminder ? (
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-bold" style={{ color: primaryTextHex(isDark) }}>{selectedReminderLabel}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Disable daily reminder"
                    className="bg-muted border-2 border-border rounded-xl px-3 py-2"
                    disabled={reminderBusy}
                    onPress={() => {
                      void handleDisableReminder();
                    }}
                  >
                    <Text className="font-sans text-xs font-bold text-foreground">{t("diary.cancel")}</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View className="flex-row flex-wrap gap-2">
                    {REMINDER_PRESETS.map((preset) => (
                      <Pressable
                        key={preset.labelKey}
                        accessibilityRole="button"
                        accessibilityLabel={t(preset.labelKey)}
                        className="bg-primary border-2 border-border rounded-xl px-3 py-2"
                        disabled={reminderBusy}
                        onPress={() => {
                          void handleEnableReminder(preset.hour, preset.minute);
                        }}
                      >
                        <Text className="font-sans text-xs font-bold text-primary-foreground">
                          {t(preset.labelKey)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {permissionDenied ? (
                    <Text className="font-sans text-xs font-medium text-destructive mt-2">
                      {t("reminders.permissionDenied")}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          ) : null}

          <View className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] -rotate-1 mb-4">
            <Text className="font-heading text-lg text-foreground mb-1">{t("export.title")}</Text>
            <Text className="font-sans text-sm text-muted-foreground mb-3">{t("export.body")}</Text>
            <View className="flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Export JSON"
                className="flex-1 bg-primary border-2 border-border rounded-xl px-3 py-2"
                disabled={exportBusy !== null}
                onPress={() => {
                  void handleExport("json");
                }}
              >
                <Text className="font-sans text-xs font-bold text-primary-foreground text-center">
                  {exportBusy === "json" ? "…" : t("export.json")}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Export PDF"
                className="flex-1 bg-secondary border-2 border-border rounded-xl px-3 py-2"
                disabled={exportBusy !== null}
                onPress={() => {
                  void handleExport("pdf");
                }}
              >
                <Text className="font-sans text-xs font-bold text-secondary-foreground text-center">
                  {exportBusy === "pdf" ? "…" : t("export.pdf")}
                </Text>
              </Pressable>
            </View>
            {exportError ? (
              <Text className="font-sans text-xs font-medium text-destructive mt-2">
                {t("banner.fallback")}
              </Text>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open wipe all from settings"
            className="mt-4 bg-destructive border-2 border-border rounded-xl p-3 active:translate-y-1 active:translate-x-1 active:shadow-none"
            onPress={requestWipeAll}
          >
            <Text className="font-sans text-center font-bold text-destructive-foreground">{t("digests.wipeAllData")}</Text>
          </Pressable>
        </View>
      </AnimatedEntrance>

      {useSkiaReady() ? <LazyStatsCard /> : null}

      </ScrollView>

      {showWipeConfirmStepOne ? (
        <Animated.View entering={FadeIn.duration(150)} className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(220)}
            className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full"
          >
            <Text className="font-heading text-xl text-foreground">{t("diary.wipeTitle")}</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">{t("diary.wipeStepOne")}</Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel wipe step one from settings"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelWipeAll}
              >
                <Text className="font-sans text-center font-bold text-foreground">{t("diary.cancel")}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue wipe step one from settings"
                className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
                onPress={continueWipeAll}
              >
                <Text className="font-sans text-center font-bold text-destructive-foreground">{t("diary.continue")}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}

      {showWipeConfirmStepTwo ? (
        <Animated.View entering={FadeIn.duration(150)} className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(220)}
            className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full"
          >
            <Text className="font-heading text-xl text-foreground">{t("diary.wipeFinalTitle")}</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">{t("diary.wipeStepTwo")}</Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel wipe step two from settings"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelWipeAll}
              >
                <Text className="font-sans text-center font-bold text-foreground">{t("diary.cancel")}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm wipe all from settings"
                className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
                onPress={() => {
                  void confirmWipeAll();
                }}
              >
                <Text className="font-sans text-center font-bold text-destructive-foreground">{t("diary.wipeConfirm")}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}
    </View>
    </PerformanceMeasureView>
  );
}
