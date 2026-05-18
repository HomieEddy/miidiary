import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { Tabs, usePathname, useRouter } from "expo-router";
import { SvgXml } from "react-native-svg";
import {
  HomeSmileBoldDuotone,
  BookBookmarkBoldDuotone,
  BookBookmarkBold,
  CheckSquareBoldDuotone,
  CheckSquareBold,
  BoxMinimalisticBoldDuotone,
} from "@/assets/icons/solar";
import { cn } from "@/utils/cn";

const tabs = [
  {
    name: "index",
    title: "Home",
    iconInactive: HomeSmileBoldDuotone,
    iconActive: HomeSmileBoldDuotone,
  },
  {
    name: "diary",
    title: "Diary",
    iconInactive: BookBookmarkBoldDuotone,
    iconActive: BookBookmarkBold,
  },
  {
    name: "tasks",
    title: "Tasks",
    iconInactive: CheckSquareBoldDuotone,
    iconActive: CheckSquareBold,
  },
  {
    name: "digests",
    title: "Digests",
    iconInactive: BoxMinimalisticBoldDuotone,
    iconActive: BoxMinimalisticBoldDuotone,
  },
] as const;

function TabBar(): ReactElement {
  const pathname = usePathname();
  const tabRouter = useRouter();

  return (
    <View className="absolute bottom-6 left-6 right-6 z-50 bg-card border-4 border-border rounded-3xl shadow-paper flex-row items-center justify-around py-2 px-2">
      {tabs.map((tab) => {
        const isActive = pathname === `/${tab.name === "index" ? "" : tab.name}`;
        return (
          <Pressable
            key={tab.name}
            className="min-w-14 items-center gap-1 p-2 active:translate-y-1 active:translate-x-1 transition-all"
            onPress={() => tabRouter.navigate(tab.name === "index" ? "/" : `/${tab.name}`)}
          >
            <View className="w-7 h-7 items-center justify-center">
              <SvgXml
                xml={isActive ? tab.iconActive : tab.iconInactive}
                color={isActive ? "#FF6B9E" : "#8A828F"}
                width={28}
                height={28}
              />
            </View>
            <Text
              className={cn(
                "text-[10px] font-bold",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {tab.title}
            </Text>
            {isActive && (
              <View className="w-10 h-1.5 bg-primary rounded-full skew-x-12" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout(): ReactElement {
  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: "bottom",
        sceneStyle: { backgroundColor: "#FDF8F0" },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="digests" />
    </Tabs>
  );
}
