import type { EntryRecord } from "@/types/entry";
import { i18n } from "@/i18n";

export interface EntryDaySection {
  dayKey: string;
  label: string;
  entries: EntryRecord[];
}

export type FlatDiaryItem =
  | { key: string; type: "header"; label: string }
  | { key: string; type: "row"; entry: EntryRecord };

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayDiff(base: Date, compare: Date): number {
  const diff = startOfDay(base).getTime() - startOfDay(compare).getTime();
  return Math.floor(diff / 86_400_000);
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDayLabel(date: Date, now: Date): string {
  const delta = dayDiff(now, date);

  if (delta === 0) {
    return i18n.t("diary.today");
  }

  if (delta === 1) {
    return i18n.t("diary.yesterday");
  }

  return formatDateLabel(date);
}

export function groupEntriesByDay(entries: EntryRecord[], now = new Date()): EntryDaySection[] {
  const groups = new Map<string, EntryDaySection>();

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const existing = groups.get(dayKey);

    if (existing) {
      existing.entries.push(entry);
    } else {
      groups.set(dayKey, {
        dayKey,
        label: getDayLabel(date, now),
        entries: [entry],
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
}

export function flattenEntrySections(sections: EntryDaySection[]): FlatDiaryItem[] {
  const items: FlatDiaryItem[] = [];

  for (const section of sections) {
    items.push({
      key: `header-${section.dayKey}`,
      type: "header",
      label: section.label,
    });

    for (const entry of section.entries) {
      items.push({
        key: `row-${entry.id}`,
        type: "row",
        entry,
      });
    }
  }

  return items;
}
