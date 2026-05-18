import type { ReactElement } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { BiometricGate } from "@/components/ui/BiometricGate";
import "../../global.css";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore splash control errors in dev builds.
});

export default function RootLayout(): ReactElement | null {
  const [loaded, error] = useFonts({
    Nunito: require("../assets/fonts/Nunito.ttf"),
    Fredoka: require("../assets/fonts/Fredoka.ttf"),
    "Playfair Display": require("../assets/fonts/PlayfairDisplay.ttf"),
    "JetBrains Mono": require("../assets/fonts/JetBrainsMono.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <BiometricGate>
      <View className="flex-1 bg-background">
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </BiometricGate>
  );
}
