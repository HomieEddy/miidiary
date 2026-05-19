import { useCallback, useEffect, useMemo, useState } from "react";
import { entriesRepository } from "@/services/entriesRepository";
import { reauthenticateForDestructiveAction } from "@/services/localAuthService";
import { flattenEntrySections, groupEntriesByDay } from "@/utils/entryGrouping";
import type { EntryRecord } from "@/types/entry";

interface UseEntriesResult {
  entries: EntryRecord[];
  flatItems: ReturnType<typeof flattenEntrySections>;
  isDeleteMode: boolean;
  deleteTargetId: string | null;
  showDeleteConfirm: boolean;
  showWipeConfirmStepOne: boolean;
  showWipeConfirmStepTwo: boolean;
  loadEntries: () => Promise<void>;
  enterDeleteMode: () => void;
  exitDeleteMode: () => void;
  requestDeleteOne: (entryId: string) => void;
  cancelDeleteOne: () => void;
  confirmDeleteOne: () => Promise<void>;
  requestWipeAll: () => void;
  cancelWipeAll: () => void;
  continueWipeAll: () => void;
  confirmWipeAll: () => Promise<boolean>;
}

interface UseEntriesOptions {
  autoLoad?: boolean;
}

export function useEntries(options?: UseEntriesOptions): UseEntriesResult {
  const autoLoad = options?.autoLoad ?? true;
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWipeConfirmStepOne, setShowWipeConfirmStepOne] = useState(false);
  const [showWipeConfirmStepTwo, setShowWipeConfirmStepTwo] = useState(false);

  const loadEntries = useCallback(async () => {
    const nextEntries = await entriesRepository.listChronological();
    setEntries(nextEntries);
  }, []);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    void loadEntries();
  }, [autoLoad, loadEntries]);

  const sections = useMemo(() => groupEntriesByDay(entries), [entries]);
  const flatItems = useMemo(() => flattenEntrySections(sections), [sections]);

  const enterDeleteMode = useCallback(() => {
    setIsDeleteMode(true);
  }, []);

  const exitDeleteMode = useCallback(() => {
    setIsDeleteMode(false);
    setDeleteTargetId(null);
    setShowDeleteConfirm(false);
  }, []);

  const requestDeleteOne = useCallback((entryId: string) => {
    setDeleteTargetId(entryId);
    setShowDeleteConfirm(true);
  }, []);

  const cancelDeleteOne = useCallback(() => {
    setDeleteTargetId(null);
    setShowDeleteConfirm(false);
  }, []);

  const confirmDeleteOne = useCallback(async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      await entriesRepository.deleteOne(deleteTargetId);
      await loadEntries();
      setDeleteTargetId(null);
      setShowDeleteConfirm(false);
    } catch {
      setShowDeleteConfirm(false);
    }
  }, [deleteTargetId, loadEntries]);

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
      await loadEntries();
      setShowWipeConfirmStepOne(false);
      setShowWipeConfirmStepTwo(false);
      setIsDeleteMode(false);
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
    isDeleteMode,
    deleteTargetId,
    showDeleteConfirm,
    showWipeConfirmStepOne,
    showWipeConfirmStepTwo,
    loadEntries,
    enterDeleteMode,
    exitDeleteMode,
    requestDeleteOne,
    cancelDeleteOne,
    confirmDeleteOne,
    requestWipeAll,
    cancelWipeAll,
    continueWipeAll,
    confirmWipeAll,
  };
}
