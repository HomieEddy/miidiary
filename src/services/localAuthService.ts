import * as LocalAuthentication from "expo-local-authentication";

export async function reauthenticateForDestructiveAction(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    disableDeviceFallback: false,
    promptMessage: "Confirm destructive action",
  });

  return result.success;
}
