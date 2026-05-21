import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";
import { BookBookmarkBoldDuotone, MagniferBoldDuotone } from "@/assets/icons/solar";
import { EntryDetailSheet } from "@/components/ui/EntryDetailSheet";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { useEntries } from "@/hooks/useEntries";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryRecord } from "@/types/entry";
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
  const latestPersistedEntryId = useEntriesStore((state) => state.entries[0]?.id);
  const {
    entries,
    flatItems,
    searchQuery,
    setSearchQuery,
    searchResults,
    showWipeConfirmStepOne,
    showWipeConfirmStepTwo,
    loadEntries,
    requestWipeAll,
    cancelWipeAll,
    continueWipeAll,
    confirmWipeAll,
  } = useEntries({ autoLoad: false, category: "diary" });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [longPressTarget, setLongPressTarget] = useState<EntryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EntryRecord | null>(null);
  const [sheetEntry, setSheetEntry] = useState<EntryRecord | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit">("view");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchInputRef = useRef<TextInput | null>(null);

  const loadWithState = useCallback(async () => {
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

  useEffect(() => {
    if (!isSearchOpen) {
      searchInputRef.current?.blur();
    }
  }, [isSearchOpen]);

  const renderEntryCard = (entry: EntryRecord): ReactElement => {
    return (
      <Pressable
        key={entry.id}
        accessibilityRole="button"
        accessibilityLabel={`Entry ${entry.id}`}
        testID={`diary-entry-card-${entry.id}`}
        className="bg-card border-4 border-border rounded-2xl p-4 shadow-paper mb-3"
        onPress={() => {
          setSheetEntry(entry);
          setSheetMode("view");
          setSheetVisible(true);
        }}
        onLongPress={() => {
          setLongPressTarget(entry);
        }}
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View
              className={cn(
                "self-start px-2 py-1 rounded-full border-2 border-border",
                categoryBadgeClassMap[entry.category],
              )}
            >
              <Text className="font-sans text-[10px] uppercase font-bold">{entry.category}</Text>
            </View>

            <Text className="font-sans text-base font-bold text-foreground mt-2">{entry.title}</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-1" numberOfLines={1}>
              {entry.previewText}
            </Text>
            <Text className="font-sans text-xs text-muted-foreground mt-2">
              {formatTime(entry.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const visibleEntries = useMemo(() => {
    if (searchResults !== null) {
      return searchResults;
    }

    return entries;
  }, [entries, searchResults]);

  return (
    <View className="min-h-screen bg-background text-foreground pb-32 font-sans px-6 pt-10">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-heading text-4xl text-foreground tracking-wide">Diary</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle search"
          testID="search-toggle-btn"
          className="w-10 h-10 rounded-xl border-2 border-border bg-card items-center justify-center"
          onPress={() => {
            setIsSearchOpen((previous) => !previous);
          }}
        >
          <SvgXml xml={MagniferBoldDuotone} width={20} height={20} color="#8A828F" />
        </Pressable>
      </View>

      <Text className="font-sans text-sm text-muted-foreground mb-3">
        Chronological thoughts, grouped by day.
      </Text>

      {isSearchOpen ? (
        <View className="mb-3">
        <TextInput
          ref={searchInputRef}
          accessibilityLabel="Search entries"
          testID="search-input"
          className="bg-muted rounded-xl px-4 py-2 font-sans text-foreground text-sm"
          placeholder="Search entries..."
          placeholderTextColor="#8A828F"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={isSearchOpen}
          editable={isSearchOpen}
        />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open wipe all"
        className="self-start mb-4 bg-destructive border-2 border-border rounded-xl px-3 py-2 active:translate-y-1 active:translate-x-1 active:shadow-none"
        onPress={requestWipeAll}
      >
        <Text className="font-sans text-xs font-bold text-white">Wipe all</Text>
      </Pressable>

      {isLoading ? (
        <View>
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20" />
        </View>
      ) : searchResults !== null ? (
        <View>{visibleEntries.map((entry) => renderEntryCard(entry))}</View>
      ) : (
        <View>
          {flatItems.map((item) => {
            if (item.type === "header") {
              return (
                <View className="mb-3 mt-2" key={item.key}>
                  <Text className="font-heading text-xl text-foreground">{item.label}</Text>
                </View>
              );
            }

            return renderEntryCard(item.entry);
          })}
        </View>
      )}

      {longPressTarget ? (
        <Pressable
          className="absolute inset-0 bg-black/20 items-center justify-center"
          onPress={() => setLongPressTarget(null)}
        >
          <View className="flex-row">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit entry"
              className="bg-card border-2 border-border rounded-xl p-3"
              onPress={() => {
                setLongPressTarget(null);
                setSheetEntry(longPressTarget);
                setSheetMode("edit");
                setSheetVisible(true);
              }}
            >
              <SvgXml xml={BookBookmarkBoldDuotone} width={20} height={20} color="#3A3544" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete entry"
              className="bg-destructive border-2 border-border rounded-xl p-3 ml-2"
              onPress={() => {
                setDeleteTarget(longPressTarget);
                setLongPressTarget(null);
              }}
            >
              <Text className="font-sans text-white font-bold">X</Text>
            </Pressable>
          </View>
        </Pressable>
      ) : null}

      {deleteTarget ? (
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
                onPress={() => {
                  setDeleteTarget(null);
                }}
              >
                <Text className="font-sans text-center font-bold text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm delete"
                className="flex-1 bg-destructive border-2 border-border rounded-xl p-3"
                onPress={() => {
                  if (!deleteTarget) {
                    return;
                  }

                  void (async () => {
                    await entriesRepository.deleteOne(deleteTarget.id);
                    await loadEntries();
                    setDeleteTarget(null);
                  })();
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
              Step 2 of 2. Local device authentication is required (biometric or passcode fallback).
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

      <EntryDetailSheet
        entry={sheetEntry}
        mode={sheetMode}
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
        }}
        onSave={async (patch) => {
          if (!sheetEntry) {
            return;
          }

          await entriesRepository.updateEntry(sheetEntry.id, patch);
          await loadEntries();
          setSheetVisible(false);
        }}
      />
    </View>
  );
}
