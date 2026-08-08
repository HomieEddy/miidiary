import type { ReactElement } from "react";
import { StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/i18n";
import { AnimatedTabIcon } from "@/components/ui/AnimatedTabIcon";
import {
  BookBookmarkBold,
  BookBookmarkBoldDuotone,
  BoxMinimalisticBoldDuotone,
  CheckSquareBold,
  CheckSquareBoldDuotone,
  HomeSmileBoldDuotone,
} from "@/assets/icons/solar";

export default function TabLayout(): ReactElement {
  const { isDark } = useTheme();
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Paper-fade scene transition between tabs.
        animation: "fade",
        sceneStyle: { backgroundColor: isDark ? "#1E1A24" : "#FDF8F0" },
        tabBarActiveTintColor: "#FF6B9E",
        tabBarInactiveTintColor: "#8A828F",
        tabBarBackground: (): ReactElement => (
          <BlurView
            intensity={42}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
        ),
        tabBarStyle: {
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 24,
          height: 72,
          borderTopWidth: 4,
          borderTopColor: isDark ? "#4A4550" : "#4C3A51",
          borderRadius: 24,
          backgroundColor: "transparent",
          elevation: 0,
          shadowColor: isDark ? "#4A4550" : "#4C3A51",
          shadowOpacity: 1,
          shadowRadius: 0,
          shadowOffset: { width: 4, height: 4 },
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },

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
          tabBarIcon: ({ focused, color }): ReactElement => (
            <AnimatedTabIcon
              focused={focused}
              xml={focused ? BookBookmarkBold : BookBookmarkBoldDuotone}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t("tabs.tasks"),
          tabBarIcon: ({ focused, color }): ReactElement => (
            <AnimatedTabIcon
              focused={focused}
              xml={focused ? CheckSquareBold : CheckSquareBoldDuotone}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="digests"
        options={{
          title: t("tabs.digests"),
          tabBarIcon: ({ focused, color }): ReactElement => (
            <AnimatedTabIcon
              focused={focused}
              xml={BoxMinimalisticBoldDuotone}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
