import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as NavigationBar from "expo-navigation-bar";
import { PerformanceProfiler } from "@shopify/react-native-performance";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { BiometricGate } from "@/components/ui/BiometricGate";
import { useTheme } from "@/hooks/useTheme";
import { useSkiaReady, ensureSkiaWeb } from "@/hooks/useSkiaReady";
import { useInterruptionHandler } from "@/services/interruptionService";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import { cn } from "@/utils/cn";
import "../../global.css";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore splash control errors in dev builds.
});

export default function RootLayout(): ReactElement | null {
  const { isDark } = useTheme();
  const skiaReady = useSkiaReady();
  useInterruptionHandler();
  const [loaded, error] = useFonts({
    Nunito: require("../assets/fonts/Nunito.ttf"),
    Fredoka: require("../assets/fonts/Fredoka.ttf"),
    "Playfair Display": require("../assets/fonts/PlayfairDisplay.ttf"),
    "JetBrains Mono": require("../assets/fonts/JetBrainsMono.ttf"),
  });

  useEffect(() => {
    void ensureSkiaWeb();
  }, []);

  useEffect(() => {
    // Seed the shared session cache from Realm so Home previews are
    // correct after a cold start (the store is not persisted).
    void entriesRepository
      .listChronological()
      .then((records) => {
        useEntriesStore.getState().setEntries(
          records.map((record) => ({
            id: record.id,
            text: record.text,
            category: record.category,
            createdAt: record.createdAt,
          })),
        );
      })
      .catch(() => {
        // Hydration is best-effort; screens still load from the repository.
      });
  }, []);

  useEffect(() => {
    // Android system navigation bar follows the app theme.
    if (Platform.OS === "android") {
      void NavigationBar.setBackgroundColorAsync(isDark ? "#1E1A24" : "#FDF8F0");
      void NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (error) {
    // Font loading failed: render a recoverable error instead of a
    // permanent blank screen (the splash already hid).
    return (
      <View className="flex-1 items-center justify-center bg-background px-8">
        <Text className="font-sans text-center text-muted-foreground">
          Failed to load app assets. Restart the app to try again.
        </Text>
      </View>
    );
  }

  if (!loaded || !skiaReady) {
    return null;
  }

  const content = (
    <BiometricGate>
      <View className={cn("flex-1 bg-background", isDark && "dark")}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </BiometricGate>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        {Platform.OS === "web" ? (
          content
        ) : (
          <KeyboardProvider>
            <PerformanceProfiler useRenderTimeouts={false}>
              {content}
            </PerformanceProfiler>
          </KeyboardProvider>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
