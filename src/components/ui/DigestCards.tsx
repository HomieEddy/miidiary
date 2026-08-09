import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { useLocale } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";
import { chartColorsHex } from "@/theme/colors";
import { entriesRepository } from "@/services/entriesRepository";
import type { EntryCategory, EntryRecord } from "@/types/entry";
import { cn } from "@/utils/cn";

const WEEKLY_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l1.9 5.6 5.9.5-4.5 3.9 1.4 5.8L12 15.2l-4.7 3.1 1.4-5.8L4.2 8.6l5.9-.5L12 2.5z" fill="currentColor"/></svg>`;

const MONTHLY_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5z" fill="currentColor" opacity=".35"/><path d="M7 4V2.5M17 4V2.5M3.5 8h17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8.5 12l2.2 2.2 4.8-4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

const CATEGORY_LABEL_KEY: Record<EntryCategory, string> = {
  diary: "sheet.categoryDiary",
  task: "sheet.categoryTask",
  note: "sheet.categoryNote",
};

interface DigestData {
  weeklyCount: number;
  weeklyTop: EntryCategory | null;
  monthlyCount: number;
  monthlyStreak: number;
}

function localDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "1970-01-01";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeDigests(entries: EntryRecord[]): DigestData {
  const now = new Date();
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const weekly = entries.filter(
    (entry) => new Date(entry.createdAt).getTime() >= weekAgo,
  );
  const monthly = entries.filter((entry) =>
    localDateKey(entry.createdAt).startsWith(monthKey),
  );

  const topByCategory = (rows: EntryRecord[]): EntryCategory | null => {
    if (rows.length === 0) {
      return null;
    }
    const counts = new Map<EntryCategory, number>();
    for (const row of rows) {
      counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
    }
    let top: EntryCategory | null = null;
    let topCount = 0;
    for (const [category, count] of counts) {
      if (count > topCount) {
        top = category;
        topCount = count;
      }
    }
    return top;
  };

  // Streak over the month: consecutive days ending today or yesterday.
  const uniqueDays = [...new Set(monthly.map((entry) => localDateKey(entry.createdAt)))].sort().reverse();
  const todayKey = localDateKey(now.toISOString());
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday.toISOString());

  let streak = 0;
  if (uniqueDays[0] === todayKey || uniqueDays[0] === yesterdayKey) {
    streak = 1;
    let cursor = new Date(uniqueDays[0]);
    for (let index = 1; index < uniqueDays.length; index += 1) {
      const previous = new Date(cursor);
      previous.setDate(previous.getDate() - 1);
      if (localDateKey(previous.toISOString()) === uniqueDays[index]) {
        streak += 1;
        cursor = previous;
      } else {
        break;
      }
    }
  }

  return {
    weeklyCount: weekly.length,
    weeklyTop: topByCategory(weekly),
    monthlyCount: monthly.length,
    monthlyStreak: streak,
  };
}

/**
 * Weekly Wrap-up and Monthly Reflection digest cards (UI-SPEC 5.7).
 * Horizontal snap-scroll row; CTAs jump to the Diary tab.
 */
export function DigestCards(): ReactElement {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<DigestData | null>(null);

  useEffect(() => {
    let active = true;
    void entriesRepository
      .listChronological()
      .then((rows) => {
        if (active) {
          setData(computeDigests(rows));
        }
      })
      .catch(() => {
        // Stats degrade to zeros silently on load failure.
      });
    return () => {
      active = false;
    };
  }, []);

  const charts = chartColorsHex(isDark);

  const openDiary = (): void => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/diary");
  };

  const weeklySurface = isDark ? "#2A2631" : "#E3F4F4";
  const monthlySurface = isDark ? "#2A2631" : "#FFE8D6";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={272}
      decelerationRate="fast"
      className="-mx-6 px-6 mt-6"
      contentContainerStyle={{ gap: 16, paddingRight: 24 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("digests.weeklyTitle")}
        onPress={openDiary}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        className="w-64 rounded-[2rem] border-4 border-border p-5 shadow-paper"
      >
        <View className="flex-row items-center gap-2" style={{ backgroundColor: weeklySurface }}>
          <View className="w-10 h-10 rounded-full items-center justify-center border-2 border-border" style={{ backgroundColor: isDark ? "#1E1A24" : "#FFFFFF" }}>
            <SvgXml xml={WEEKLY_ICON} width={20} height={20} color={charts.note} />
          </View>
          <Text className="font-heading text-lg text-foreground tracking-wide">{t("digests.weeklyTitle")}</Text>
        </View>
        <View className="mt-4">
          <Text testID="digest-weekly-count" className="font-sans text-3xl font-bold text-foreground tabular-nums">
            {data?.weeklyCount ?? 0}
          </Text>
          <Text className="font-sans text-sm text-muted-foreground mt-1">
            {t("digests.weeklyBody", { count: data?.weeklyCount ?? 0 })}
          </Text>
          {data?.weeklyTop ? (
            <Text className="font-sans text-xs font-medium mt-2" style={{ color: charts.diary }}>
              {t("digests.weeklyTop", { category: t(CATEGORY_LABEL_KEY[data.weeklyTop]) })}
            </Text>
          ) : null}
        </View>
        <View className="mt-4 rounded-xl py-2 items-center border-2 border-border" style={{ backgroundColor: charts.note }}>
          <Text className="font-sans text-xs font-bold" style={{ color: isDark ? "#1E1A24" : "#FFFFFF" }}>
            {t("digests.viewDiary")}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("digests.monthlyTitle")}
        onPress={openDiary}
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.97 : 1 }] }]}
        className="w-64 rounded-[2rem] border-4 border-border p-5 shadow-paper"
      >
        <View className="flex-row items-center gap-2" style={{ backgroundColor: monthlySurface }}>
          <View className="w-10 h-10 rounded-full items-center justify-center border-2 border-border" style={{ backgroundColor: isDark ? "#1E1A24" : "#FFFFFF" }}>
            <SvgXml xml={MONTHLY_ICON} width={20} height={20} color={charts.task} />
          </View>
          <Text className="font-heading text-lg text-foreground tracking-wide">{t("digests.monthlyTitle")}</Text>
        </View>
        <View className="mt-4">
          <Text testID="digest-monthly-count" className="font-sans text-3xl font-bold text-foreground tabular-nums">
            {data?.monthlyCount ?? 0}
          </Text>
          <Text className="font-sans text-sm text-muted-foreground mt-1">
            {t("digests.monthlyBody", { count: data?.monthlyCount ?? 0 })}
          </Text>
          <Text className="font-sans text-xs font-medium mt-2" style={{ color: charts.task }}>
            {t("digests.monthlyStreak", { days: data?.monthlyStreak ?? 0 })}
          </Text>
        </View>
        <View className="mt-4 rounded-xl py-2 items-center border-2 border-border" style={{ backgroundColor: charts.task }}>
          <Text className="font-sans text-xs font-bold" style={{ color: isDark ? "#1E1A24" : "#FFFFFF" }}>
            {t("digests.viewDiary")}
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}
