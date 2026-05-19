import type { ReactElement } from "react";
import { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect } from "@react-navigation/native";
import { useEntries } from "@/hooks/useEntries";
import type { EntryRecord } from "@/types/entry";

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

function TaskCard({ entry }: { entry: EntryRecord }): ReactElement {
  return (
    <View className="bg-card border-4 border-border rounded-2xl p-4 shadow-paper mb-3">
      <Text className="font-sans text-base font-bold text-foreground">{entry.title}</Text>
      <Text className="font-sans text-sm text-muted-foreground mt-1" numberOfLines={1}>
        {entry.previewText}
      </Text>
      <Text className="font-sans text-xs text-muted-foreground mt-2">{formatTime(entry.createdAt)}</Text>
    </View>
  );
}

export default function TasksScreen(): ReactElement {
  const { entries, loadEntries } = useEntries();

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
    }, [loadEntries]),
  );

  const taskEntries = useMemo(() => entries.filter((entry) => entry.category === "task"), [entries]);

  return (
    <View className="min-h-screen bg-background text-foreground pb-32 font-sans px-6 pt-10">
      <Text className="font-heading text-4xl text-foreground tracking-wide mb-2">Tasks</Text>
      <Text className="font-sans text-sm text-muted-foreground mb-5">
        Entries auto-classified as tasks appear here.
      </Text>

      {taskEntries.length === 0 ? (
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
          renderItem={({ item }) => <TaskCard entry={item} />}
        />
      )}
    </View>
  );
}
