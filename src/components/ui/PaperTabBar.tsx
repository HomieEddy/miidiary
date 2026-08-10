import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";

/**
 * Instagram-style bottom nav (v5).
 *
 * The bar is a NORMAL-FLOW layout element — the last child of the
 * navigator's column — so the scene shrinks to sit exactly above it and
 * the bar is always full-screen-width. No absolute positioning, no
 * z-index games: the floating-bar approach proved unreliable inside the
 * custom tabBar slot on Android (bar rendered shifted/oversized).
 *
 * Look: flat full-bleed surface matching the scene, 1px top hairline,
 * icon-only items; active tab in the foreground color (filled look),
 * inactive in muted gray.
 */
export function PaperTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): ReactElement {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const barColor = isDark ? "#1E1A24" : "#FDF8F0";
  const hairline = isDark ? "#4A4550" : "#E0D4C2";
  const activeTint = isDark ? "#F5F0EB" : "#2A2631";
  const inactiveTint = isDark ? "#9B93A4" : "#8A828F";
  const bottomInset = insets?.bottom ?? 0;

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: barColor,
          borderTopColor: hairline,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarAccessibilityLabel ??
          (typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title ?? route.name);
        const isFocused = state.index === index;
        const color = isFocused ? activeTint : inactiveTint;

        const onPress = (): void => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = (): void => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={label}
            testID={`tab-${route.name}`}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.item,
              pressed ? styles.itemPressed : null,
            ]}
          >
            {options.tabBarIcon
              ? options.tabBarIcon({ focused: isFocused, color, size: 26 })
              : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    start: 0,
    end: 0,
    bottom: 0,
    flexDirection: "row",
    alignSelf: "stretch",
    width: "100%",
    borderTopWidth: 1,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  itemPressed: {
    transform: [{ scale: 0.92 }],
  },
});
