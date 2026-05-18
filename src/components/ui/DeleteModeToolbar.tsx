import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";

interface DeleteModeToolbarProps {
  onCancel: () => void;
  onWipeAll: () => void;
}

export function DeleteModeToolbar({ onCancel, onWipeAll }: DeleteModeToolbarProps): ReactElement {
  return (
    <View className="flex-row items-center justify-between bg-card border-4 border-border rounded-2xl p-3 shadow-paper mb-4">
      <Text className="font-sans text-sm font-bold text-foreground">Delete mode</Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel delete mode"
          className="px-3 py-2 rounded-xl bg-muted border-2 border-border active:translate-y-1 active:translate-x-1 active:shadow-none"
          onPress={onCancel}
        >
          <Text className="font-sans text-xs font-bold text-foreground">Cancel</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Wipe all entries"
          className="px-3 py-2 rounded-xl bg-destructive border-2 border-border active:translate-y-1 active:translate-x-1 active:shadow-none"
          onPress={onWipeAll}
        >
          <Text className="font-sans text-xs font-bold text-white">Wipe all</Text>
        </Pressable>
      </View>
    </View>
  );
}
