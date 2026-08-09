import type { ReactElement } from "react";
import { Text, View } from "react-native";
import { CartesianChart, Bar } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { useStats } from "@/hooks/useStats";
import { useTheme } from "@/hooks/useTheme";
import { accentTextHex, chartColorsHex, mutedForegroundHex, primaryTextHex, secondaryTextHex } from "@/theme/colors";
import { useLocale } from "@/i18n";
import type { EntryCategory } from "@/types/entry";

const CATEGORY_LABEL_KEY: Record<EntryCategory, string> = {
  diary: "sheet.categoryDiary",
  task: "sheet.categoryTask",
  note: "sheet.categoryNote",
};

const CATEGORY_ORDER: EntryCategory[] = ["diary", "task", "note"];

/**
 * Diary statistics card: totals + streak chips and a Skia bar chart of
 * category distribution (victory-native). Implements STAT-01.
 */
export function StatsCard(): ReactElement {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const { stats, loading } = useStats();
  const axisFont = useFont(require("../../assets/fonts/Nunito.ttf"), 9);

  if (loading) {
    return (
      <AnimatedEntrance delay={180}>
        <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper mt-4">
          <ShimmerView className="h-5 w-2/3 mb-4" />
          <ShimmerView className="h-24 mb-3" />
          <ShimmerView className="h-5 w-1/2" />
        </View>
      </AnimatedEntrance>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <AnimatedEntrance delay={180}>
        <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper mt-4">
          <Text className="font-heading text-lg text-foreground mb-1">{t("stats.title")}</Text>
          <Text className="font-sans text-sm text-muted-foreground">{t("stats.empty")}</Text>
        </View>
      </AnimatedEntrance>
    );
  }

  const chartData = CATEGORY_ORDER.map((category) => ({
    label: t(CATEGORY_LABEL_KEY[category]),
    diary: category === "diary" ? stats.byCategory.diary : 0,
    task: category === "task" ? stats.byCategory.task : 0,
    note: category === "note" ? stats.byCategory.note : 0,
  }));

  return (
    <AnimatedEntrance delay={180}>
      <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper mt-4">
        <Text className="font-heading text-lg text-foreground mb-3">{t("stats.title")}</Text>

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
            <Text className="font-sans text-xl font-bold" style={{ color: primaryTextHex(isDark) }}>{stats.total}</Text>
            <Text className="font-sans text-xs text-muted-foreground">
              {t("stats.total", { count: stats.total })}
            </Text>
          </View>
          <View className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
            <Text className="font-sans text-xl font-bold" style={{ color: secondaryTextHex(isDark) }}>{stats.streakDays}</Text>
            <Text className="font-sans text-xs text-muted-foreground">
              {t("stats.streak", { count: stats.streakDays })}
            </Text>
          </View>
          <View className="flex-1 bg-muted/50 rounded-xl px-3 py-2">
            <Text className="font-sans text-xl font-bold" style={{ color: accentTextHex(isDark) }}>{stats.todayCount}</Text>
            <Text className="font-sans text-xs text-muted-foreground">
              {t("stats.today", { count: stats.todayCount })}
            </Text>
          </View>
        </View>

        <View className="h-28">
          <CartesianChart
            data={chartData}
            xKey="label"
            yKeys={["diary", "task", "note"]}
            domainPadding={{ left: 24, right: 24, top: 8, bottom: 4 }}
            axisOptions={{
              font: axisFont,
              labelColor: mutedForegroundHex(isDark),
              lineColor: isDark ? "#4A4550" : "#D8CCB8",
            }}
          >
            {({ points, chartBounds }) => (
              <>
                <Bar points={points.diary} chartBounds={chartBounds} color={chartColorsHex(isDark).diary} roundedCorners={{ topLeft: 6, topRight: 6 }} barWidth={22} />
                <Bar points={points.task} chartBounds={chartBounds} color={chartColorsHex(isDark).task} roundedCorners={{ topLeft: 6, topRight: 6 }} barWidth={22} />
                <Bar points={points.note} chartBounds={chartBounds} color={chartColorsHex(isDark).note} roundedCorners={{ topLeft: 6, topRight: 6 }} barWidth={22} />
              </>
            )}
          </CartesianChart>
        </View>
      </View>
    </AnimatedEntrance>
  );
}

export default StatsCard;
