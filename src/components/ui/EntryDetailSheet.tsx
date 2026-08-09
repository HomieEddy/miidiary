import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SvgXml } from "react-native-svg";
import * as Haptics from "expo-haptics";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { EntryCategory, EntryRecord, UpdateEntryPatch } from "@/types/entry";
import { useLocale } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/utils/cn";

interface EntryDetailSheetProps {
  entry: EntryRecord | null;
  mode: "view" | "edit";
  visible: boolean;
  onClose: () => void;
  onSave: (patch: UpdateEntryPatch) => Promise<void>;
}

const categoryOrder: EntryCategory[] = ["diary", "task", "note"];

const categoryClassMap: Record<EntryCategory, string> = {
  diary: "bg-primary text-primary-foreground",
  task: "bg-secondary text-secondary-foreground",
  note: "bg-accent text-accent-foreground",
};

const categoryKeyMap: Record<EntryCategory, string> = {
  diary: "sheet.categoryDiary",
  task: "sheet.categoryTask",
  note: "sheet.categoryNote",
};

const HEART_FILLED_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/></svg>`;

const HEART_OUTLINE_ICON = `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;

interface DueOption {
  key: string;
  labelKey: string;
  /** Days from today, or null for "no due date". */
  offsetDays: number | null;
}

const dueOptions: DueOption[] = [
  { key: "none", labelKey: "sheet.dueNone", offsetDays: null },
  { key: "today", labelKey: "sheet.dueToday", offsetDays: 0 },
  { key: "tomorrow", labelKey: "sheet.dueTomorrow", offsetDays: 1 },
  { key: "week", labelKey: "sheet.dueWeek", offsetDays: 7 },
];

/** Local date as yyyy-mm-dd (padded), matching the repository's dueDate format. */
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dueDateForOffset = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toLocalDateString(date);
};

/**
 * Entry detail sheet built on @gorhom/bottom-sheet: snap points (half /
 * near-full), swipe-to-dismiss, press-backdrop-to-close, and keyboard
 * avoidance for the edit mode.
 */
export function EntryDetailSheet({
  entry,
  mode,
  visible,
  onClose,
  onSave,
}: EntryDetailSheetProps): ReactElement {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const [internalMode, setInternalMode] = useState<"view" | "edit">(mode);
  const [titleDraft, setTitleDraft] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [textDraft, setTextDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState<EntryCategory>("note");
  const [dueDateDraft, setDueDateDraft] = useState<string | null>(null);
  const [isUrgentDraft, setIsUrgentDraft] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const placeholderColor = isDark ? "#9B93A4" : "#6F6776";
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["48%", "88%"], []);

  useEffect(() => {
    setInternalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!entry) {
      return;
    }

    setTitleDraft(entry.title);
    setTitleEdited(false);
    setTextDraft(entry.text);
    setCategoryDraft(entry.category);
    setDueDateDraft(entry.dueDate);
    setIsUrgentDraft(entry.isUrgent);
  }, [entry, visible]);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const cycleCategory = (): void => {
    const currentIndex = categoryOrder.indexOf(categoryDraft);
    const next = categoryOrder[(currentIndex + 1) % categoryOrder.length];
    setCategoryDraft(next);
  };

  const resetDrafts = (): void => {
    if (!entry) {
      return;
    }

    setTitleDraft(entry.title);
    setTitleEdited(false);
    setTextDraft(entry.text);
    setCategoryDraft(entry.category);
    setDueDateDraft(entry.dueDate);
    setIsUrgentDraft(entry.isUrgent);
    setSaveError(false);
  };

  const handleSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }

    const patch: UpdateEntryPatch = {
      text: textDraft,
      category: categoryDraft,
      dueDate: dueDateDraft,
      isUrgent: isUrgentDraft,
      // Only send the title when the user edited it, so the repository
      // re-derives it from the saved text otherwise (D-09 manual override).
      ...(titleEdited ? { title: titleDraft } : {}),
    };

    try {
      setIsSaving(true);
      await onSave(patch);
      setSaveError(false);
    } catch {
      // Keep the sheet open in edit mode so the user can retry.
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  if (!entry) {
    return <></>;
  }

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      onDismiss={handleDismiss}
      backgroundStyle={{ backgroundColor: isDark ? "#2A2631" : "#FFFFFF" }}
      handleIndicatorStyle={{ backgroundColor: isDark ? "#4A4550" : "#C9BFAE" }}
    >
      <BottomSheetScrollView className="px-6 pb-8">
        {internalMode === "view" ? (
          <>
            <View className="flex-row items-center justify-between">
              <View
                className={cn(
                  "self-start px-2 py-1 rounded-full border-2 border-border",
                  categoryClassMap[entry.category],
                )}
              >
                <Text className="font-sans text-xs uppercase font-bold">
                  {t(categoryKeyMap[entry.category])}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={entry.isFavorite ? t("sheet.unfavorite") : t("sheet.favorite")}
                  className="px-3 py-2 rounded-xl border-2 border-border bg-muted"
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    void onSave({ isFavorite: !entry.isFavorite });
                  }}
                >
                  <SvgXml
                    xml={entry.isFavorite ? HEART_FILLED_ICON : HEART_OUTLINE_ICON}
                    width={20}
                    height={20}
                    color={entry.isFavorite ? "#C2377E" : placeholderColor}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("sheet.close")}
                  className="px-3 py-2 rounded-xl border-2 border-border bg-muted"
                  onPress={onClose}
                >
                  <Text className="font-sans text-xs font-bold text-foreground">{t("sheet.close")}</Text>
                </Pressable>
              </View>
            </View>

            <Text className="font-heading text-2xl text-foreground mt-4">{entry.title}</Text>
            <Text className="font-sans text-base text-foreground mt-2 leading-relaxed">{entry.text}</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("sheet.edit")}
              className="mt-4 bg-primary border-2 border-border rounded-xl p-3 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
              onPress={() => setInternalMode("edit")}
            >
              <Text className="font-sans text-center font-bold text-primary-foreground">{t("sheet.edit")}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              className="bg-muted rounded-xl px-4 py-3 font-sans text-foreground text-base"
              value={titleDraft}
              onChangeText={(next) => {
                setTitleEdited(true);
                setTitleDraft(next);
              }}
              placeholder={t("sheet.titlePlaceholder")}
              placeholderTextColor={placeholderColor}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(categoryKeyMap[categoryDraft])}
              accessibilityHint={t("sheet.changeCategoryHint")}
              className={cn(
                "self-start mt-3 px-3 py-2 rounded-full border-2 border-border",
                categoryClassMap[categoryDraft],
              )}
              onPress={cycleCategory}
            >
              <Text className="font-sans text-xs font-bold">{t(categoryKeyMap[categoryDraft])}</Text>
            </Pressable>

            <View className="mt-3">
              <Text className="font-sans text-xs font-bold text-foreground">{t("sheet.dueLabel")}</Text>
              <View className="flex-row flex-wrap gap-2 mt-1">
                {dueOptions.map((option) => {
                  const selected =
                    option.offsetDays === null
                      ? dueDateDraft === null
                      : dueDateDraft === dueDateForOffset(option.offsetDays);
                  return (
                    <Pressable
                      key={option.key}
                      accessibilityRole="button"
                      accessibilityLabel={t(option.labelKey)}
                      accessibilityState={{ selected }}
                      className={cn(
                        "px-3 py-2 rounded-full",
                        selected
                          ? "bg-primary border-2 border-border text-primary-foreground"
                          : "bg-muted",
                      )}
                      onPress={() => {
                        if (option.offsetDays === null) {
                          setDueDateDraft(null);
                        } else {
                          setDueDateDraft(dueDateForOffset(option.offsetDays));
                        }
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
            </View>

            <Pressable
              accessibilityRole="switch"
              accessibilityLabel={t("sheet.urgentLabel")}
              accessibilityState={{ checked: isUrgentDraft }}
              className="flex-row items-center justify-between mt-3 bg-muted border-2 border-border rounded-xl px-3 py-3"
              onPress={() => setIsUrgentDraft((prev) => !prev)}
            >
              <Text className="font-sans text-sm font-bold text-foreground">{t("sheet.urgentLabel")}</Text>
              <View
                className={cn(
                  "h-6 w-11 rounded-full px-0.5 flex-row items-center",
                  isUrgentDraft ? "bg-primary" : "bg-border",
                )}
              >
                <View
                  className={cn(
                    "h-5 w-5 rounded-full bg-white",
                    isUrgentDraft ? "ml-auto" : "ml-0",
                  )}
                />
              </View>
            </Pressable>

            <TextInput
              className="bg-muted rounded-xl px-4 py-3 font-sans text-foreground text-base mt-3"
              value={textDraft}
              onChangeText={setTextDraft}
              multiline
              numberOfLines={6}
              placeholder={t("sheet.editTextPlaceholder")}
              placeholderTextColor={placeholderColor}
              accessibilityLabel={t("sheet.editTextPlaceholder")}
            />

            {saveError ? (
              <Text className="font-sans text-xs font-medium text-destructive mt-3">
                {t("sheet.saveFailed")}
              </Text>
            ) : null}

            <View className="flex-row gap-2 mt-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("diary.cancel")}
                disabled={isSaving}
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3 disabled:opacity-50"
                onPress={() => {
                  resetDrafts();
                  setInternalMode("view");
                }}
              >
                <Text className="font-sans text-center font-bold text-foreground">{t("diary.cancel")}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("sheet.save")}
                accessibilityState={{ disabled: isSaving, busy: isSaving }}
                disabled={isSaving}
                className="flex-1 bg-primary border-2 border-border rounded-xl p-3 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50"
                onPress={() => {
                  void handleSave();
                }}
              >
                <Text className="font-sans text-center font-bold text-primary-foreground">{t("sheet.save")}</Text>
              </Pressable>
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
