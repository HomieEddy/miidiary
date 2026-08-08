import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { BiometricGate } from "@/components/ui/BiometricGate";
import { useTheme } from "@/hooks/useTheme";
import { ensureSkiaWeb, useSkiaReady } from "@/hooks/useSkiaReady";
import { useInterruptionHandler } from "@/services/interruptionService";
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
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

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
          <KeyboardProvider>{content}</KeyboardProvider>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
