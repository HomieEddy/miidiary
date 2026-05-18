import type { ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { DeleteModeToolbar } from "@/components/ui/DeleteModeToolbar";
import { useEntries } from "@/hooks/useEntries";
import { cn } from "@/utils/cn";

const categoryBadgeClassMap = {
  diary: "bg-primary text-primary-foreground",
  task: "bg-secondary text-secondary-foreground",
  note: "bg-accent text-accent-foreground",
} as const;

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function DiaryScreen(): ReactElement {
  const {
    flatItems,
    isDeleteMode,
    showDeleteConfirm,
    showWipeConfirmStepOne,
    showWipeConfirmStepTwo,
    enterDeleteMode,
    exitDeleteMode,
    requestDeleteOne,
    cancelDeleteOne,
    confirmDeleteOne,
    requestWipeAll,
    cancelWipeAll,
    continueWipeAll,
    confirmWipeAll,
  } = useEntries();

  return (
    <View className="min-h-screen bg-background text-foreground pb-32 font-sans px-6 pt-10">
      <Text className="font-heading text-4xl text-foreground tracking-wide mb-2">Diary</Text>
      <Text className="font-sans text-sm text-muted-foreground mb-5">
        Chronological thoughts, grouped by day.
      </Text>

      {isDeleteMode ? (
        <DeleteModeToolbar onCancel={exitDeleteMode} onWipeAll={requestWipeAll} />
      ) : null}

      <FlashList
        data={flatItems}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View className="mb-3 mt-2">
                <Text className="font-heading text-xl text-foreground">{item.label}</Text>
              </View>
            );
          }

          const entry = item.entry;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Entry ${entry.id}`}
              className="bg-card border-4 border-border rounded-2xl p-4 shadow-paper mb-3"
              onLongPress={enterDeleteMode}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <View
                    className={cn(
                      "self-start px-2 py-1 rounded-full border-2 border-border",
                      categoryBadgeClassMap[entry.category],
                    )}
                  >
                    <Text className="font-sans text-[10px] uppercase font-bold">
                      {entry.category}
                    </Text>
                  </View>

                  <Text className="font-sans text-base font-bold text-foreground mt-2">
                    {entry.title}
                  </Text>
                  <Text className="font-sans text-sm text-muted-foreground mt-1" numberOfLines={1}>
                    {entry.previewText}
                  </Text>
                  <Text className="font-sans text-xs text-muted-foreground mt-2">
                    {formatTime(entry.createdAt)}
                  </Text>
                </View>

                {isDeleteMode ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete entry ${entry.id}`}
                    className="w-8 h-8 rounded-full border-2 border-border bg-destructive items-center justify-center active:translate-y-1 active:translate-x-1 active:shadow-none"
                    onPress={() => requestDeleteOne(entry.id)}
                  >
                    <Text className="text-white font-bold">X</Text>
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />

      {showDeleteConfirm ? (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full">
            <Text className="font-heading text-xl text-foreground">Delete this entry?</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">
              This removes only the selected entry.
            </Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel delete"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelDeleteOne}
              >
                <Text className="font-sans text-center font-bold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm delete"
                className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
                onPress={() => {
                  void confirmDeleteOne();
                }}
              >
                <Text className="font-sans text-center font-bold text-white">Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      {showWipeConfirmStepOne ? (
        <View className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full">
            <Text className="font-heading text-xl text-foreground">Wipe all entries?</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">
              Step 1 of 2 confirmation.
            </Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel wipe step one"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelWipeAll}
              >
                <Text className="font-sans text-center font-bold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue wipe step one"
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
              Step 2 of 2. Biometric verification is required.
            </Text>
            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel wipe step two"
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={cancelWipeAll}
              >
                <Text className="font-sans text-center font-bold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm wipe all"
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
