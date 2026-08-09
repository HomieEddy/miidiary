import { useCallback, useEffect, useMemo, useState } from "react";
import { entriesRepository } from "@/services/entriesRepository";
import { reauthenticateForDestructiveAction } from "@/services/localAuthService";
import { useLocale } from "@/i18n";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryCategory } from "@/types/entry";
import { flattenEntrySections, groupEntriesByDay } from "@/utils/entryGrouping";
import type { EntryRecord } from "@/types/entry";

interface UseEntriesResult {
  entries: EntryRecord[];
  flatItems: ReturnType<typeof flattenEntrySections>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: EntryRecord[] | null;
  showWipeConfirmStepOne: boolean;
  showWipeConfirmStepTwo: boolean;
  loadEntries: () => Promise<void>;
  requestWipeAll: () => void;
  cancelWipeAll: () => void;
  continueWipeAll: () => void;
  confirmWipeAll: () => Promise<boolean>;
}

interface UseEntriesOptions {
  autoLoad?: boolean;
  category?: EntryCategory;
}

export function useEntries(options?: UseEntriesOptions): UseEntriesResult {
  const { locale } = useLocale();
  const autoLoad = options?.autoLoad ?? true;
  const category = options?.category;
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [searchQuery, setSearchQueryState] = useState("");
  const [searchResults, setSearchResults] = useState<EntryRecord[] | null>(null);
  const [showWipeConfirmStepOne, setShowWipeConfirmStepOne] = useState(false);
  const [showWipeConfirmStepTwo, setShowWipeConfirmStepTwo] = useState(false);

  const loadEntries = useCallback(async () => {
    const nextEntries = await entriesRepository.listChronological(category);
    setEntries(nextEntries);
  }, [category]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadEntries();
  }, [autoLoad, loadEntries]);

  const sections = useMemo(() => groupEntriesByDay(entries), [entries, locale]);
  const flatItems = useMemo(() => flattenEntrySections(sections), [sections]);

  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }

    let stale = false;
    const timeout = setTimeout(() => {
      void entriesRepository.searchEntries(trimmed).then((results) => {
        if (stale) {
          // A newer query (or a cleared one) superseded this request.
          return;
        }
        const scoped = category
          ? results.filter((item) => item.category === category)
          : results;
        setSearchResults(scoped);
      });
    }, 150);

    return () => {
      stale = true;
      clearTimeout(timeout);
    };
  }, [category, searchQuery]);

  const requestWipeAll = useCallback(() => {
    setShowWipeConfirmStepOne(true);
  }, []);

  const cancelWipeAll = useCallback(() => {
    setShowWipeConfirmStepOne(false);
    setShowWipeConfirmStepTwo(false);
  }, []);

  const continueWipeAll = useCallback(() => {
    setShowWipeConfirmStepOne(false);
    setShowWipeConfirmStepTwo(true);
  }, []);

  const confirmWipeAll = useCallback(async (): Promise<boolean> => {
    let allowed = false;

    try {
      allowed = await reauthenticateForDestructiveAction();
    } catch {
      setShowWipeConfirmStepOne(false);
      setShowWipeConfirmStepTwo(false);
      return false;
    }

    if (!allowed) {
      return false;
    }

    try {
      await entriesRepository.wipeAll();
      // Invalidate the shared session cache so Home previews and every
      // mounted tab observe the wipe (they reload via latestPersistedEntryId).
      useEntriesStore.getState().clearAll();
      await loadEntries();
      setShowWipeConfirmStepOne(false);
      setShowWipeConfirmStepTwo(false);
      return true;
    } catch {
      setShowWipeConfirmStepOne(false);
      setShowWipeConfirmStepTwo(false);
      return false;
    }
  }, [loadEntries]);

  return {
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
  };
}
