import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

export async function reauthenticateForDestructiveAction(): Promise<boolean> {
  if (Platform.OS === "web") {
    // Biometric auth is unavailable on web; the in-memory web storage
    // holds no sensitive data, so destructive actions need no re-auth.
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    disableDeviceFallback: false,
    promptMessage: "Confirm destructive action",
  });

  return result.success;
}
