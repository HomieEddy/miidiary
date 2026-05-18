import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito: require("../assets/fonts/Nunito.ttf"),
    Fredoka: require("../assets/fonts/Fredoka.ttf"),
    "Playfair Display": require("../assets/fonts/PlayfairDisplay.ttf"),
    "JetBrains Mono": require("../assets/fonts/JetBrainsMono.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
