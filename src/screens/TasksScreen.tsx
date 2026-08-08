import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryRecord } from "@/types/entry";
import { cn } from "@/utils/cn";
import { staggerMs } from "@/utils/motion";

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
  index,
  onToggle,
}: {
  entry: EntryRecord;
  index: number;
  onToggle: (entryId: string) => Promise<void>;
}): ReactElement {
  return (
    <AnimatedEntrance delay={index * staggerMs}>
      <View className="bg-card border-4 border-border rounded-2xl p-4 mb-3">
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
            {entry.isCompleted ? (
              <Animated.View
                entering={ZoomIn.springify().damping(12).stiffness(220)}
                className="w-3 h-3 rounded-full bg-secondary-foreground"
              />
            ) : null}
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
    </AnimatedEntrance>
  );
}

export default function TasksScreen(): ReactElement {
  const latestPersistedEntryId = useEntriesStore((state) => state.entries[0]?.id);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = useCallback(async (): Promise<void> => {
    const onlyTasks = await entriesRepository.listChronological("task");
    setEntries(onlyTasks);
  }, []);

  const loadWithState = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    await loadEntries();
    setIsLoading(false);
  }, [loadEntries]);

  useEffect(() => {
    void loadWithState();
  }, [loadWithState]);

  useEffect(() => {
    if (!latestPersistedEntryId) {
      return;
    }

    void loadEntries();
  }, [latestPersistedEntryId, loadEntries]);

  const taskEntries = entries;

  const handleToggle = useCallback(async (entryId: string): Promise<void> => {
    await entriesRepository.toggleComplete(entryId);
    await loadEntries();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [loadEntries]);

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
        <Animated.View
          entering={FadeInDown.duration(250).springify().damping(16)}
          className="bg-card border-4 border-border rounded-2xl p-5"
        >
          <Text className="font-heading text-xl text-foreground">No tasks yet</Text>
          <Text className="font-sans text-sm text-muted-foreground mt-2">
            Record a thought and on-device classification will surface it here when it sounds like a task.
          </Text>
        </Animated.View>
      ) : (
        <View>
          {taskEntries.map((entry, index) => (
            <TaskCard key={entry.id} entry={entry} index={index} onToggle={handleToggle} />
          ))}
        </View>
      )}
    </View>
  );
}
