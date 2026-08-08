import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { SvgXml } from "react-native-svg";
import { BookBookmarkBoldDuotone, MagniferBoldDuotone } from "@/assets/icons/solar";
import { AnimatedEntrance } from "@/components/ui/AnimatedEntrance";
import { EntryDetailSheet } from "@/components/ui/EntryDetailSheet";
import { PressableScale } from "@/components/ui/PressableScale";
import { ShimmerView } from "@/components/ui/ShimmerView";
import { useLocale } from "@/i18n";
import { useEntries } from "@/hooks/useEntries";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryRecord } from "@/types/entry";
import { i18n } from "@/i18n";
import { cn } from "@/utils/cn";
import { staggerMs } from "@/utils/motion";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categoryBadgeClassMap = {
  diary: "bg-primary text-primary-foreground",
  task: "bg-secondary text-secondary-foreground",
  note: "bg-accent text-accent-foreground",
} as const;

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
    <View className="min-h-screen bg-background text-foreground pb-32 font-sans px-6 pt-10">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-heading text-4xl text-foreground tracking-wide">{t("diary.title")}</Text>
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
            placeholderTextColor="#8A828F"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={isSearchOpen}
            editable={isSearchOpen}
          />
        </Animated.View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open wipe all"
        className="self-start mb-4 bg-destructive border-2 border-border rounded-xl px-3 py-2 active:translate-y-1 active:translate-x-1 active:shadow-none"
        onPress={requestWipeAll}
      >
        <Text className="font-sans text-xs font-bold text-white">{t("diary.wipeAll")}</Text>
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
        <View>
          {flatItems.map((item, index) => {
            if (item.type === "header") {
              return (
                <AnimatedEntrance key={item.key} delay={Math.min(index, 3) * staggerMs}>
                  <View className="mb-3 mt-2">
                    <Text className="font-heading text-xl text-foreground">{item.label}</Text>
                  </View>
                </AnimatedEntrance>
              );
            }

            return renderEntryCard(item.entry, index);
          })}
        </View>
      )}

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
              <Text className="font-sans text-white font-bold">X</Text>
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
                    await entriesRepository.deleteOne(deleteTarget.id);
                    await loadEntries();
                    setDeleteTarget(null);
                  })();
                }}
              >
                <Text className="font-sans text-center font-bold text-white">{t("diary.delete")}</Text>
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
                <Text className="font-sans text-center font-bold text-white">{t("diary.continue")}</Text>
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
                <Text className="font-sans text-center font-bold text-white">{t("diary.wipeConfirm")}</Text>
              </Pressable>
            </View>
          </Animated.View>
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
