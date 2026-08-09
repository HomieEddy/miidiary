import type { ReactElement } from "react";
import { Tabs } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/i18n";
import { AnimatedTabIcon } from "@/components/ui/AnimatedTabIcon";
import { PaperTabBar } from "@/components/ui/PaperTabBar";
import {
  BookBookmarkBoldDuotone,
  BoxMinimalisticBoldDuotone,
  CheckSquareBoldDuotone,
  HomeSmileBoldDuotone,
} from "@/assets/icons/solar";

export default function TabLayout(): ReactElement {
  const { isDark } = useTheme();
  const { t } = useLocale();

  return (
    <Tabs
      tabBar={(props) => <PaperTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Paper-fade scene transition between tabs.
        animation: "fade",
        sceneStyle: { backgroundColor: isDark ? "#1E1A24" : "#FDF8F0" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }): ReactElement => (
            <AnimatedTabIcon focused={focused} xml={HomeSmileBoldDuotone} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t("tabs.diary"),
          tabBarIcon: ({ color, focused }): ReactElement => (
            <AnimatedTabIcon focused={focused} xml={BookBookmarkBoldDuotone} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t("tabs.tasks"),
          tabBarIcon: ({ color, focused }): ReactElement => (
            <AnimatedTabIcon focused={focused} xml={CheckSquareBoldDuotone} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="digests"
        options={{
          title: t("tabs.digests"),
          tabBarIcon: ({ color, focused }): ReactElement => (
            <AnimatedTabIcon focused={focused} xml={BoxMinimalisticBoldDuotone} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
