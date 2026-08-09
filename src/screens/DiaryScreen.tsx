import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { SvgXml } from "react-native-svg";
import {
  BookBookmarkBoldDuotone,
  CheckSquareBoldDuotone,
  MagniferBoldDuotone,
} from "@/assets/icons/solar";
import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { EntryDetailSheet } from "@/components/ui/EntryDetailSheet";
import { NewEntrySheet } from "@/components/ui/NewEntrySheet";
import { PressableScale } from "@/components/ui/PressableScale";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { useLocale } from "@/i18n";
import { getPref, setPref } from "@/services/appPrefsService";
import { useEntries } from "@/hooks/useEntries";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import { useTheme } from "@/hooks/useTheme";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryCategory, EntryRecord } from "@/types/entry";
import { i18n } from "@/i18n";
import { accentTextHex, mutedForegroundHex, primaryTextHex } from "@/theme/colors";
import { cn } from "@/utils/cn";
import { staggerMs } from "@/utils/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categoryBadgeClassMap = {
  diary: "bg-primary text-primary-foreground",
  task: "bg-secondary text-secondary-foreground",
  note: "bg-accent text-accent-foreground",
} as const;

const categoryLabelKeyMap: Record<EntryCategory, string> = {
  diary: "sheet.categoryDiary",
  task: "sheet.categoryTask",
  note: "sheet.categoryNote",
};

const PEN_NEW_ROUND_ICON =
  '<svg viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';

const HEART_FILLED_ICON =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>';

const filterOptions: Array<{ key: "all" | EntryCategory; labelKey: string }> = [
  { key: "all", labelKey: "diary.filterAll" },
  { key: "diary", labelKey: "sheet.categoryDiary" },
  { key: "task", labelKey: "sheet.categoryTask" },
  { key: "note", labelKey: "sheet.categoryNote" },
];

function formatTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return i18n.t("diary.justNow");
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function DiaryScreen(): ReactElement {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const bottomClearance = useTabBarClearance();
  const latestPersistedEntryId = useEntriesStore((state) => state.entries[0]?.id);
  const [filterCategory, setFilterCategory] = useState<"all" | EntryCategory>("all");
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
  } = useEntries({
    autoLoad: false,
    category: filterCategory === "all" ? undefined : filterCategory,
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newSheetVisible, setNewSheetVisible] = useState(false);
  const [longPressTarget, setLongPressTarget] = useState<EntryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EntryRecord | null>(null);
  const [undoEntry, setUndoEntry] = useState<EntryRecord | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sheetEntry, setSheetEntry] = useState<EntryRecord | null>(null);
  const [sheetMode, setSheetMode] = useState<"view" | "edit">("view");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const RECENT_SEARCHES_KEY = "recent_searches";

  const searchInputRef = useRef<TextInput | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const raw = getPref(RECENT_SEARCHES_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item): item is string => typeof item === "string"));
      }
    } catch {
      // Corrupt prefs fall back to empty recents.
    }
  }, []);

  useEffect(() => {
    setPref(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    // A resolved search (searchResults !== null) with a non-empty query
    // becomes a recent search — newest first, capped at 5, unique.
    const trimmed = searchQuery.trim();
    if (searchResults !== null && trimmed) {
      setRecentSearches((current) =>
        [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 5),
      );
    }
  }, [searchResults, searchQuery]);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const offerUndo = useCallback((record: EntryRecord) => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
    setUndoEntry(record);
    undoTimerRef.current = setTimeout(() => {
      setUndoEntry(null);
      undoTimerRef.current = null;
    }, 6000);
  }, []);

  const handleUndo = useCallback(async () => {
    if (!undoEntry) {
      return;
    }
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    const restored = await entriesRepository.restoreEntry(undoEntry);
    useEntriesStore.getState().addPersistedEntry({
      id: restored.id,
      text: restored.text,
      category: restored.category,
      createdAt: restored.createdAt,
    });
    setUndoEntry(null);
    await loadEntries();
  }, [undoEntry, loadEntries]);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

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

  const renderEntryCard = (entry: EntryRecord, index: number): ReactElement => {
    return (
      <AnimatedEntrance delay={index * staggerMs} key={entry.id}>
        <PressableScale
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
          {entry.isFavorite ? (
            <View
              pointerEvents="none"
              className="absolute top-2 right-2 z-10"
            >
              <SvgXml xml={HEART_FILLED_ICON} width={18} height={18} color="#C2377E" />
            </View>
          ) : null}

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <View
                  className={cn(
                    "self-start px-2 py-1 rounded-full border-2 border-border",
                    categoryBadgeClassMap[entry.category],
                  )}
                >
                  <Text className="font-sans text-xs uppercase font-bold">
                    {t(categoryLabelKeyMap[entry.category])}
                  </Text>
                </View>

                {entry.isCompleted ? (
                  <View className="self-start flex-row items-center gap-1 px-2 py-1 rounded-full border-2 border-border bg-accent">
                    <SvgXml xml={CheckSquareBoldDuotone} width={12} height={12} color={accentTextHex(isDark)} />
                    <Text className="font-sans text-xs uppercase font-bold text-accent-foreground">
                      {t("diary.done")}
                    </Text>
                  </View>
                ) : null}
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
        </PressableScale>
      </AnimatedEntrance>
    );
  };

  const visibleEntries = useMemo(() => {
    if (searchResults !== null) {
      return searchResults;
    }

    return entries;
  }, [entries, searchResults]);

  return (
    <View className="flex-1 bg-background font-sans">
      <ScrollView
        className="flex-1 text-foreground"
        contentContainerStyle={{
          paddingBottom: bottomClearance,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void (async () => {
                setRefreshing(true);
                await loadWithState();
                setRefreshing(false);
              })();
            }}
            tintColor={primaryTextHex(isDark)}
            colors={[primaryTextHex(isDark)]}
          />
        }
      >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-heading text-4xl text-foreground tracking-wide">{t("diary.title")}</Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("sheet.newEntryTitle")}
            testID="new-entry-btn"
            className="w-11 h-11 rounded-xl border-2 border-border bg-card items-center justify-center"
            onPress={() => {
              setNewSheetVisible(true);
            }}
          >
            <SvgXml xml={PEN_NEW_ROUND_ICON} width={20} height={20} color={primaryTextHex(isDark)} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle search"
            testID="search-toggle-btn"
            className="w-11 h-11 rounded-xl border-2 border-border bg-card items-center justify-center"
            onPress={() => {
              setIsSearchOpen((previous) => !previous);
            }}
          >
            <SvgXml xml={MagniferBoldDuotone} width={20} height={20} color={mutedForegroundHex(isDark)} />
          </Pressable>
        </View>
      </View>

      <Text className="font-sans text-sm text-muted-foreground mb-3">
        {t("diary.subtitle")}
      </Text>

      {isSearchOpen ? (
        <Animated.View entering={FadeInDown.duration(200)} className="mb-3">
          <TextInput
            ref={searchInputRef}
            accessibilityLabel={t("diary.searchLabel")}
            testID="search-input"
            className="bg-muted rounded-xl px-4 py-2 font-sans text-foreground text-sm"
            placeholder={t("diary.searchPlaceholder")}
            placeholderTextColor={mutedForegroundHex(isDark)}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={isSearchOpen}
            editable={isSearchOpen}
          />

          {!searchQuery.trim() && recentSearches.length > 0 ? (
            <View className="mt-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-sans text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t("diary.recentSearches")}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("diary.clearRecents")}
                  onPress={clearRecentSearches}
                >
                  <Text className="font-sans text-xs font-bold text-muted-foreground">
                    {t("diary.clearRecents")}
                  </Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <Pressable
                    key={term}
                    accessibilityRole="button"
                    accessibilityLabel={term}
                    className="bg-card border-2 border-border rounded-full px-3 py-1"
                    onPress={() => setSearchQuery(term)}
                  >
                    <Text className="font-sans text-xs font-bold text-foreground">{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      <View className="flex-row flex-wrap gap-2 mb-4">
        {filterOptions.map((option) => {
          const selected = filterCategory === option.key;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={t(option.labelKey)}
              accessibilityState={{ selected }}
              className={cn(
                "px-3 py-1.5 rounded-full border-2 border-border",
                selected ? "bg-primary" : "bg-muted",
              )}
              onPress={() => {
                setFilterCategory(option.key);
              }}
            >
              <Text
                className={cn(
                  "font-sans text-xs font-bold",
                  selected ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {t(option.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open wipe all"
        className="self-start mb-4 bg-destructive border-2 border-border rounded-xl px-3 py-2 active:translate-y-1 active:translate-x-1 active:shadow-none"
        onPress={requestWipeAll}
      >
        <Text className="font-sans text-xs font-bold text-destructive-foreground">{t("diary.wipeAll")}</Text>
      </Pressable>

      {isLoading ? (
        <View>
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20 mb-3" />
          <ShimmerView className="h-20" />
        </View>
      ) : searchResults !== null ? (
        <View>{visibleEntries.map((entry, index) => renderEntryCard(entry, index))}</View>
      ) : (
        <View className="relative">
          <View
            pointerEvents="none"
            className="absolute left-10 top-0 bottom-0 w-1 bg-border/20 rounded-full"
          />
          {flatItems.map((item, index) => {
            if (item.type === "header") {
              return (
                <AnimatedEntrance key={item.key} delay={Math.min(index, 3) * staggerMs}>
                  <View className="flex-row items-center mb-3 mt-2">
                    <View
                      pointerEvents="none"
                      className="w-8 h-8 rounded-full bg-primary border-2 border-border -left-2 mr-2"
                    />
                    <Text className="font-heading text-xl text-foreground">{item.label}</Text>
                  </View>
                </AnimatedEntrance>
              );
            }

            return renderEntryCard(item.entry, index);
          })}
        </View>
      )}

      </ScrollView>

      {longPressTarget ? (
        <AnimatedPressable
          entering={FadeIn.duration(120)}
          className="absolute inset-0 bg-black/20 items-center justify-center"
          onPress={() => setLongPressTarget(null)}
        >
          <Animated.View entering={ZoomIn.springify().damping(15).stiffness(200)} className="flex-row">
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
              <Text className="font-sans text-destructive-foreground font-bold">X</Text>
            </Pressable>
          </Animated.View>
        </AnimatedPressable>
      ) : null}

      {deleteTarget ? (
        <Animated.View entering={FadeIn.duration(150)} className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(220)}
            className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full"
          >
            <Text className="font-heading text-xl text-foreground">{t("diary.deleteTitle")}</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">
              {t("diary.deleteBody")}
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
                <Text className="font-sans text-center font-bold text-foreground">{t("diary.cancel")}</Text>
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
                    const deleted = deleteTarget;
                    await entriesRepository.deleteOne(deleted.id);
                    useEntriesStore.getState().removeEntry(deleted.id);
                    await loadEntries();
                    setDeleteTarget(null);
                    offerUndo(deleted);
                  })();
                }}
              >
                <Text className="font-sans text-center font-bold text-destructive-foreground">{t("diary.delete")}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}

      {showWipeConfirmStepOne ? (
        <Animated.View entering={FadeIn.duration(150)} className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(220)}
            className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full"
          >
            <Text className="font-heading text-xl text-foreground">{t("diary.wipeTitle")}</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">
              {t("diary.wipeStepOne")}
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
                <Text className="font-sans text-center font-bold text-destructive-foreground">{t("diary.continue")}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}

      {showWipeConfirmStepTwo ? (
        <Animated.View entering={FadeIn.duration(150)} className="absolute inset-0 bg-black/40 items-center justify-center px-6">
          <Animated.View
            entering={ZoomIn.springify().damping(16).stiffness(220)}
            className="bg-card border-4 border-border rounded-2xl p-5 shadow-paper w-full"
          >
            <Text className="font-heading text-xl text-foreground">{t("diary.wipeFinalTitle")}</Text>
            <Text className="font-sans text-sm text-muted-foreground mt-2">
              {t("diary.wipeStepTwo")}
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
                <Text className="font-sans text-center font-bold text-destructive-foreground">{t("diary.wipeConfirm")}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}

      <NewEntrySheet
        visible={newSheetVisible}
        onClose={() => {
          setNewSheetVisible(false);
        }}
        onCreated={() => {
          setNewSheetVisible(false);
          void loadEntries();
        }}
      />
      {undoEntry ? (
        <Animated.View
          entering={FadeIn.duration(150)}
          className="absolute bottom-28 left-8 right-8 items-center"
          pointerEvents="box-none"
        >
          <View className="bg-card border-2 border-border rounded-2xl px-4 py-3 shadow-paper flex-row items-center gap-3">
            <Text className="font-sans text-sm font-medium text-foreground">
              {t("diary.undoDelete")}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("diary.undo")}
              onPress={() => {
                void handleUndo();
              }}
            >
              <Text className="font-sans text-sm font-bold text-primary">{t("diary.undo")}</Text>
            </Pressable>
          </View>
        </Animated.View>
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
