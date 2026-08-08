import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
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
  };

  const handleSave = async (): Promise<void> => {
    const patch: UpdateEntryPatch = {
      text: textDraft,
      category: categoryDraft,
      // Only send the title when the user edited it, so the repository
      // re-derives it from the saved text otherwise (D-09 manual override).
      ...(titleEdited ? { title: titleDraft } : {}),
    };
    await onSave(patch);
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
                <Text className="font-sans text-[10px] uppercase font-bold">
                  {t(categoryKeyMap[entry.category])}
                </Text>
              </View>
              <Pressable
                className="px-3 py-2 rounded-xl border-2 border-border bg-muted"
                onPress={onClose}
              >
                <Text className="font-sans text-xs font-bold text-foreground">{t("sheet.close")}</Text>
              </Pressable>
            </View>

            <Text className="font-heading text-2xl text-foreground mt-4">{entry.title}</Text>
            <Text className="font-sans text-base text-foreground mt-2 leading-relaxed">{entry.text}</Text>

            <Pressable
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
              placeholderTextColor="#8A828F"
            />

            <Pressable
              className={cn(
                "self-start mt-3 px-3 py-2 rounded-full border-2 border-border",
                categoryClassMap[categoryDraft],
              )}
              onPress={cycleCategory}
            >
              <Text className="font-sans text-xs font-bold">{t(categoryKeyMap[categoryDraft])}</Text>
            </Pressable>

            <TextInput
              className="bg-muted rounded-xl px-4 py-3 font-sans text-foreground text-base mt-3"
              value={textDraft}
              onChangeText={setTextDraft}
              multiline
              numberOfLines={6}
              placeholder={t("sheet.editTextPlaceholder")}
              placeholderTextColor="#8A828F"
            />

            <View className="flex-row gap-2 mt-4">
              <Pressable
                className="flex-1 bg-muted border-2 border-border rounded-xl p-3"
                onPress={() => {
                  resetDrafts();
                  setInternalMode("view");
                }}
              >
                <Text className="font-sans text-center font-bold text-foreground">{t("diary.cancel")}</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-primary border-2 border-border rounded-xl p-3 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
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
