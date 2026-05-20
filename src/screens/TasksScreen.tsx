import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { useEntries } from "@/hooks/useEntries";
import type { EntryRecord } from "@/types/entry";
import { cn } from "@/utils/cn";

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

function TaskCard({
  entry,
  onToggle,
}: {
  entry: EntryRecord;
  onToggle: (entryId: string) => Promise<void>;
}): ReactElement {
  return (
    <View className="bg-card border-4 border-border rounded-2xl p-4 shadow-paper mb-3">
      <View className="flex-row items-start gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Toggle task ${entry.id}`}
          className={cn(
            "w-6 h-6 rounded-full border-2 border-border items-center justify-center",
            entry.isCompleted && "bg-secondary border-secondary",
          )}
          onPress={() => {
            void onToggle(entry.id);
          }}
        >
          {entry.isCompleted ? <View className="w-3 h-3 rounded-full bg-secondary-foreground" /> : null}
        </Pressable>

        <View className="flex-1">
          <Text className={cn("font-sans text-base font-bold text-foreground", entry.isCompleted && "line-through opacity-50")}>
            {entry.title}
          </Text>
          <Text className={cn("font-sans text-sm text-muted-foreground mt-1", entry.isCompleted && "line-through opacity-50")} numberOfLines={1}>
            {entry.previewText}
          </Text>
          <Text className="font-sans text-xs text-muted-foreground mt-2">{formatTime(entry.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TasksScreen(): ReactElement {
  const { entries, loadEntries, toggleComplete } = useEntries();
  const [isLoading, setIsLoading] = useState(true);

  const loadWithState = useCallback(async () => {
    setIsLoading(true);
    await loadEntries();
    setIsLoading(false);
  }, [loadEntries]);

  useEffect(() => {
    void loadWithState();
  }, [loadWithState]);

  const taskEntries = useMemo(() => entries.filter((entry) => entry.category === "task"), [entries]);

  const handleToggle = useCallback(async (entryId: string): Promise<void> => {
    await toggleComplete(entryId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [toggleComplete]);

  return (
    <View className="min-h-screen bg-background text-foreground pb-32 font-sans px-6 pt-10">
      <Text className="font-heading text-4xl text-foreground tracking-wide mb-2">Tasks</Text>
      <Text className="font-sans text-sm text-muted-foreground mb-5">
        Entries auto-classified as tasks appear here.
      </Text>

      {isLoading ? (
        <View>
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20" />
        </View>
      ) : taskEntries.length === 0 ? (
        <View className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper">
          <Text className="font-heading text-xl text-foreground">No tasks yet</Text>
          <Text className="font-sans text-sm text-muted-foreground mt-2">
            New recordings currently default to notes until Phase 3 classification is enabled.
          </Text>
        </View>
      ) : (
        <FlashList
          data={taskEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TaskCard entry={item} onToggle={handleToggle} />}
        />
      )}
    </View>
  );
}
