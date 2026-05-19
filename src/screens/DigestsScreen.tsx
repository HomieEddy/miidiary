import { Pressable, Text, View } from "react-native";
import { useEntries } from "@/hooks/useEntries";

export default function DigestsScreen() {
  const {
    showWipeConfirmStepOne,
    showWipeConfirmStepTwo,
    requestWipeAll,
    cancelWipeAll,
    continueWipeAll,
    confirmWipeAll,
  } = useEntries({ autoLoad: false });

  return (
    <View className="min-h-screen bg-background text-foreground pb-32 font-sans p-6">
      <Text className="font-heading text-4xl text-foreground tracking-wide">Digests</Text>
      <Text className="font-sans text-base text-muted-foreground mt-3">
        Weekly and monthly reflections. Settings and data controls live here for now.
      </Text>

      <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper mt-8">
        <Text className="font-heading text-2xl text-foreground">Settings</Text>
        <Text className="font-sans text-sm text-muted-foreground mt-2">
          Manage encrypted local storage controls.
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open wipe all from settings"
          className="mt-4 bg-destructive border-2 border-border rounded-xl p-3 active:translate-y-1 active:translate-x-1 active:shadow-none"
          onPress={requestWipeAll}
        >
          <Text className="font-sans text-center font-bold text-white">Wipe all data</Text>
        </Pressable>
      </View>

      {showWipeConfirmStepOne ? (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full">
            <Text className="font-heading text-xl text-foreground">Wipe all entries?</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">Step 1 of 2 confirmation.</Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel wipe step one from settings"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelWipeAll}
              >
                <Text className="font-sans text-center font-bold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue wipe step one from settings"
                className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
                onPress={continueWipeAll}
              >
                <Text className="font-sans text-center font-bold text-white">Continue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {showWipeConfirmStepTwo ? (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full">
            <Text className="font-heading text-xl text-foreground">Final wipe confirmation</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">
              Step 2 of 2. Local device authentication is required (biometric or passcode fallback).
            </Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel wipe step two from settings"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelWipeAll}
              >
                <Text className="font-sans text-center font-bold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm wipe all from settings"
                className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
                onPress={() => {
                  void confirmWipeAll();
                }}
              >
                <Text className="font-sans text-center font-bold text-white">Wipe all</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
