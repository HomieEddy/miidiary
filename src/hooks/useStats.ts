import { useCallback, useEffect, useState } from "react";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntriesStore } from "@/stores/entriesStore";
import type { EntryCategory } from "@/types/entry";

export interface DiaryStats {
  total: number;
  todayCount: number;
  streakDays: number;
  byCategory: Record<EntryCategory, number>;
}

function localDateKey(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "1970-01-01";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function computeStreak(dayKeys: string[]): number {
  if (dayKeys.length === 0) {
    return 0;
  }

  const uniqueDays = [...new Set(dayKeys)].sort().reverse();
  const today = new Date();
  const todayKey = localDateKey(today.toISOString());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = localDateKey(yesterday.toISOString());

  // A streak only counts when the most recent entry is from today or
  // yesterday; then walk backward over consecutive days.
  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 0;

  for (let index = 0; index < uniqueDays.length; index += 1) {
    const expected = new Date(`${uniqueDays[0]}T12:00:00`);
    expected.setDate(expected.getDate() - index);
    if (uniqueDays[index] !== localDateKey(expected.toISOString())) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export function useStats(): { stats: DiaryStats | null; loading: boolean; reload: () => Promise<void> } {
  const [stats, setStats] = useState<DiaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  // While the tab stays mounted, new entries land in the store without a fresh
  // mount — reload whenever the entry list changes so the stats stay current.
  const entryCount = useEntriesStore((state) => state.entries.length);
  const latestEntryId = useEntriesStore((state) => state.entries[0]?.id ?? null);

  const reload = useCallback(async () => {
    setLoading(true);
    const entries = await entriesRepository.listChronological();

    const byCategory: Record<EntryCategory, number> = {
      diary: 0,
      task: 0,
      note: 0,
    };

    const dayKeys: string[] = [];
    const todayKey = localDateKey(new Date().toISOString());
    let todayCount = 0;

    for (const entry of entries) {
      byCategory[entry.category] += 1;
      const dayKey = localDateKey(entry.createdAt);
      dayKeys.push(dayKey);
      if (dayKey === todayKey) {
        todayCount += 1;
      }
    }

    setStats({
      total: entries.length,
      todayCount,
      streakDays: computeStreak(dayKeys),
      byCategory,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload, entryCount, latestEntryId]);

  return { stats, loading, reload };
}
