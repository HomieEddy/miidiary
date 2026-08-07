import type { PropsWithChildren, ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

export function BiometricGate({ children }: PropsWithChildren): ReactElement {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [message, setMessage] = useState("Unlock Dear Diary to continue");

  const unlock = useCallback(async () => {
    setIsChecking(true);

    try {
      if (Platform.OS === "web") {
        // Biometric auth is unavailable on web and the web storage
        // fallback (in-memory) holds no sensitive data — skip the gate.
        setIsUnlocked(true);
        setMessage("Unlocked");
        return;
      }

      await LocalAuthentication.hasHardwareAsync();
      await LocalAuthentication.isEnrolledAsync();

      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        promptMessage: "Unlock Dear Diary",
      });

      if (result.success) {
        setIsUnlocked(true);
        setMessage("Unlocked");
      } else {
        setIsUnlocked(false);
        setMessage("Authentication required");
      }
    } catch {
      setIsUnlocked(false);
      setMessage("Authentication unavailable");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void unlock();
  }, [unlock]);

  return (
    <View className="flex-1">
      {children}

      {!isUnlocked ? (
        <View className="absolute inset-0 z-50 bg-background items-center justify-center px-6">
          <View className="bg-card border-4 border-border rounded-2xl p-6 shadow-paper w-full max-w-sm">
            <Text className="font-heading text-3xl text-foreground">Dear Diary</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">{message}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry unlock"
              className="mt-5 bg-primary rounded-xl border-2 border-border px-4 py-3 active:translate-y-1 active:translate-x-1 active:shadow-none"
              disabled={isChecking}
              onPress={() => {
                void unlock();
              }}
            >
              <Text className="font-sans font-bold text-primary-foreground text-center">
                {isChecking ? "Checking..." : "Unlock"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
