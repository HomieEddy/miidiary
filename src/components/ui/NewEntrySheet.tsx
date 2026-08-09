import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import type { EntryCategory, EntryRecord } from "@/types/entry";
import { useLocale } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";
import { entriesRepository } from "@/services/entriesRepository";
import { cn } from "@/utils/cn";

interface NewEntrySheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (entry: EntryRecord) => void;
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
 * New entry sheet built on @gorhom/bottom-sheet (mirrors EntryDetailSheet's
 * structure): a required multiline text field, category pills and a
 * busy-state Save button. The title is derived from the text by the
 * repository, so no separate title field is offered. On save the entry is
 * created through the repository and handed back via onCreated before the
 * sheet closes.
 */
export function NewEntrySheet({
  visible,
  onClose,
  onCreated,
}: NewEntrySheetProps): ReactElement {
  const { t } = useLocale();
  const { isDark } = useTheme();
  const [textDraft, setTextDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState<EntryCategory>("note");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const placeholderColor = isDark ? "#9B93A4" : "#6F6776";
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["55%", "90%"], []);

  useEffect(() => {
    if (visible) {
      // Fresh drafts on every open.
      setTextDraft("");
      setCategoryDraft("note");
      setSaveError(false);
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

  const handleSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      const entry = await entriesRepository.createEntry({
        text: textDraft,
        category: categoryDraft,
      });
      onCreated(entry);
      onClose();
    } catch {
      // Keep the sheet open so the user can retry.
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

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
        <Text className="font-heading text-2xl text-foreground">{t("sheet.newEntryTitle")}</Text>
        <Text className="font-sans text-sm text-muted-foreground mt-1">{t("sheet.newEntryBody")}</Text>

        <TextInput
          className="bg-muted rounded-xl px-4 py-3 font-sans text-foreground text-base mt-4"
          value={textDraft}
          onChangeText={setTextDraft}
          multiline
          numberOfLines={6}
          placeholder={t("sheet.newEntryText")}
          placeholderTextColor={placeholderColor}
          accessibilityLabel={t("sheet.newEntryText")}
        />

        <View className="flex-row gap-2 mt-3">
          {categoryOrder.map((category) => {
            const selected = categoryDraft === category;
            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityLabel={t(categoryKeyMap[category])}
                accessibilityState={{ selected }}
                className={cn(
                  "px-3 py-2 rounded-full border-2 border-border",
                  selected ? categoryClassMap[category] : "bg-muted",
                )}
                onPress={() => {
                  setCategoryDraft(category);
                }}
              >
                <Text className="font-sans text-xs font-bold">{t(categoryKeyMap[category])}</Text>
              </Pressable>
            );
          })}
        </View>

        {saveError ? (
          <Text className="font-sans text-xs font-medium text-destructive mt-3">
            {t("sheet.saveFailed")}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("sheet.save")}
          accessibilityState={{ disabled: isSaving, busy: isSaving }}
          disabled={isSaving}
          testID="new-entry-save-btn"
          className="mt-4 bg-primary border-2 border-border rounded-xl p-3 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50"
          onPress={() => {
            void handleSave();
          }}
        >
          <Text className="font-sans text-center font-bold text-primary-foreground">{t("sheet.save")}</Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
