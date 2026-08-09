import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { SvgXml } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { PerformanceMeasureView } from "@shopify/react-native-performance";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { useScreenProfiler } from "@/hooks/useScreenProfiler";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/i18n";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryRecord } from "@/types/entry";
import { i18n } from "@/i18n";
import { destructiveHex, primaryTextHex } from "@/theme/colors";
import { cn } from "@/utils/cn";
import { staggerMs } from "@/utils/motion";

const FIRE_ICON =
  '<svg viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>';

/**
 * Due-date label: compares the entry's yyyy-mm-dd (local) with today —
 * today, tomorrow, within 7 days, or the raw dd/mm date otherwise.
 */
function formatDueLabel(dueDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate);

  if (!match) {
    return dueDate;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const due = new Date(year, month - 1, day);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((due.getTime() - startOfToday.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return i18n.t("tasks.dueToday");
  }

  if (diffDays === 1) {
    return i18n.t("tasks.dueTomorrow");
  }

  if (diffDays > 1 && diffDays <= 7) {
    return i18n.t("tasks.dueWeek");
  }

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return i18n.t("diary.justNow");
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function TaskCard({
  entry,
  index,
  onToggle,
}: {
  entry: EntryRecord;
  index: number;
  onToggle: (entryId: string) => Promise<void>;
}): ReactElement {
  const { t } = useLocale();
  const { isDark } = useTheme();
  return (
    <AnimatedEntrance delay={index * staggerMs}>
      <View className="bg-card border-4 border-border rounded-2xl p-4 mb-3">
        <View className="flex-row items-start gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Toggle task ${entry.id}`}
            className={cn(
              "w-6 h-6 rounded-full border-2 border-border items-center justify-center",
              entry.isCompleted && "bg-secondary border-secondary",
            )}
            onPress={() => {
              void onToggle(entry.id);
            }}
          >
            {entry.isCompleted ? (
              <Animated.View
                entering={ZoomIn.springify().damping(12).stiffness(220)}
                className="w-3 h-3 rounded-full bg-secondary-foreground"
              />
            ) : null}
          </Pressable>

          <View className="flex-1">
            <Text className={cn("font-sans text-base font-bold text-foreground", entry.isCompleted && "line-through opacity-50")}>
              {entry.title}
            </Text>
            <Text className={cn("font-sans text-sm text-muted-foreground mt-1", entry.isCompleted && "line-through opacity-50")} numberOfLines={1}>
              {entry.previewText}
            </Text>
            <Text className="font-sans text-xs text-muted-foreground mt-2">{formatTime(entry.createdAt)}</Text>

            <View className="flex-row flex-wrap items-center gap-2 mt-2">
              {entry.isUrgent ? (
                <View className="flex-row items-center gap-1 px-2 py-1 rounded-full bg-destructive/10">
                  <SvgXml xml={FIRE_ICON} width={12} height={12} color={destructiveHex(isDark)} />
                  <Text className="font-sans text-xs font-bold text-destructive">{t("tasks.urgent")}</Text>
                </View>
              ) : null}
              {entry.dueDate ? (
                <View className="px-2 py-1 rounded-full bg-muted">
                  <Text className="font-sans text-xs font-bold text-muted-foreground">
                    {formatDueLabel(entry.dueDate)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </AnimatedEntrance>
  );
}

export default function TasksScreen(): ReactElement {
  useScreenProfiler();
  const { t } = useLocale();
  const { isDark } = useTheme();
  const bottomClearance = useTabBarClearance();
  const latestPersistedEntryId = useEntriesStore((state) => state.entries[0]?.id);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = useCallback(async (): Promise<void> => {
    const onlyTasks = await entriesRepository.listChronological("task");
    setEntries(onlyTasks);
  }, []);

  const loadWithState = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await loadEntries();
    setIsLoading(false);
  }, [loadEntries]);

  useEffect(() => {
    void loadWithState();
  }, [loadWithState]);

  useEffect(() => {
    if (!latestPersistedEntryId) {
      return;
    }

    void loadEntries();
  }, [latestPersistedEntryId, loadEntries]);

  const taskEntries = entries;
  const completedCount = taskEntries.filter((entry) => entry.isCompleted).length;
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleToggle = useCallback(async (entryId: string): Promise<void> => {
    await entriesRepository.toggleComplete(entryId);
    await loadEntries();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [loadEntries]);

  const handleClearCompleted = useCallback(async (): Promise<void> => {
    const completed = taskEntries.filter((entry) => entry.isCompleted);
    for (const entry of completed) {
      await entriesRepository.deleteOne(entry.id);
      useEntriesStore.getState().removeEntry(entry.id);
    }
    setShowClearConfirm(false);
    await loadEntries();
  }, [taskEntries, loadEntries]);

  return (
    <PerformanceMeasureView screenName="TasksScreen" interactive>
      <View className="flex-1 bg-background font-sans">
      <ScrollView
        className="flex-1 text-foreground"
        contentContainerStyle={{
          paddingBottom: bottomClearance,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void (async () => {
                setRefreshing(true);
                await loadWithState();
                setRefreshing(false);
              })();
            }}
            tintColor={primaryTextHex(isDark)}
            colors={[primaryTextHex(isDark)]}
          />
        }
      >
      <Text className="font-heading text-4xl text-foreground tracking-wide mb-2">{t("tasks.title")}</Text>
      <Text className="font-sans text-sm text-muted-foreground mb-5">
        {t("tasks.subtitle")}
      </Text>

      {isLoading ? (
        <View>
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20" />
        </View>
      ) : taskEntries.length === 0 ? (
        <Animated.View
          entering={FadeInDown.duration(250).springify().damping(16)}
          className="bg-card border-4 border-border rounded-2xl p-5"
        >
          <Text className="font-heading text-xl text-foreground">{t("tasks.emptyTitle")}</Text>
          <Text className="font-sans text-sm text-muted-foreground mt-2">
            {t("tasks.emptyBody")}
          </Text>
        </Animated.View>
      ) : (
        <View>
          {taskEntries.map((entry, index) => (
            <TaskCard key={entry.id} entry={entry} index={index} onToggle={handleToggle} />
          ))}
        </View>
      )}

      {completedCount > 0 && !showClearConfirm ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("tasks.clearCompleted")}
          className="self-end mt-5 bg-muted border-2 border-border rounded-xl px-3 py-2"
          onPress={() => setShowClearConfirm(true)}
        >
          <Text className="font-sans text-xs font-bold text-muted-foreground">
            {t("tasks.clearCompleted")}
          </Text>
        </Pressable>
      ) : null}

      {showClearConfirm ? (
        <Animated.View
          entering={FadeInDown.duration(200).springify().damping(16)}
          className="bg-card border-4 border-border rounded-2xl p-4 shadow-paper mt-4"
        >
          <Text className="font-sans text-sm text-foreground">{t("tasks.clearCompletedBody")}</Text>
          <View className="flex-row gap-2 mt-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel clear completed"
              className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
              onPress={() => setShowClearConfirm(false)}
            >
              <Text className="font-sans text-center font-bold text-foreground">{t("diary.cancel")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm clear completed"
              className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
              onPress={() => {
                void handleClearCompleted();
              }}
            >
              <Text className="font-sans text-center font-bold text-destructive-foreground">
                {t("diary.wipeConfirm")}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : null}
      </ScrollView>
    </View>
    </PerformanceMeasureView>
  );
}
