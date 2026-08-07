import type { ReactElement } from "react";
import { SvgXml } from "react-native-svg";
import { Tabs } from "expo-router";
import {
  BookBookmarkBold,
  BookBookmarkBoldDuotone,
  BoxMinimalisticBoldDuotone,
  CheckSquareBold,
  CheckSquareBoldDuotone,
  HomeSmileBoldDuotone,
} from "@/assets/icons/solar";

export default function TabLayout(): ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#FDF8F0" },
        tabBarActiveTintColor: "#FF6B9E",
        tabBarInactiveTintColor: "#8A828F",
        tabBarStyle: {
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 24,
          height: 72,
          borderTopWidth: 4,
          borderTopColor: "#4C3A51",
          borderRadius: 24,
          backgroundColor: "#F7EFD8",
          elevation: 0,
          shadowColor: "#4C3A51",
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
          title: "Home",
          tabBarIcon: ({ color }): ReactElement => (
            <SvgXml xml={HomeSmileBoldDuotone} color={color} width={24} height={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: "Diary",
          tabBarIcon: ({ focused, color }): ReactElement => (
            <SvgXml xml={focused ? BookBookmarkBold : BookBookmarkBoldDuotone} color={color} width={24} height={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused, color }): ReactElement => (
            <SvgXml xml={focused ? CheckSquareBold : CheckSquareBoldDuotone} color={color} width={24} height={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="digests"
        options={{
          title: "Digests",
          tabBarIcon: ({ color }): ReactElement => (
            <SvgXml xml={BoxMinimalisticBoldDuotone} color={color} width={24} height={24} />
          ),
        }}
      />
    </Tabs>
  );
}
