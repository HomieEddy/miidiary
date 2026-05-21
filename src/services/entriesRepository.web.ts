import * as Crypto from "expo-crypto";
import { buildEntryQueryKey } from "@/models/EntryRealm";
import type {
  CreateEntryInput,
  EntryCategory,
  EntryRecord,
  UpdateEntryPatch,
} from "@/types/entry";
import { deriveEntryPreview, deriveEntryTitle } from "@/utils/entryTextDerivation";

const store = new Map<string, EntryRecord>();

function toSortedEntries(items: Iterable<EntryRecord>): EntryRecord[] {
  return [...items].sort((a, b) => a.queryKey.localeCompare(b.queryKey));
}

async function createEntry(input: CreateEntryInput): Promise<EntryRecord> {
  const now = new Date();
  const candidateCreatedAt = input.createdAt ? new Date(input.createdAt) : now;
  const createdAtDate = Number.isNaN(candidateCreatedAt.getTime()) ? now : candidateCreatedAt;
  const id = `entry-${Crypto.randomUUID()}`;

  const entry: EntryRecord = {
    id,
    text: input.text,
    category: input.category,
    createdAt: createdAtDate.toISOString(),
    updatedAt: now.toISOString(),
    title: deriveEntryTitle(input.text),
    previewText: deriveEntryPreview(input.text),
    queryKey: buildEntryQueryKey(input.category, createdAtDate, id),
    isCompleted: false,
    classificationConfidence: input.classification?.confidence ?? null,
    classificationRationale: input.classification?.rationale ?? null,
    classificationSource: input.classification?.source ?? null,
  };

  store.set(id, entry);

  return entry;
}

async function listChronological(category?: EntryCategory): Promise<EntryRecord[]> {
  const items = category
    ? [...store.values()].filter((entry) => entry.category === category)
    : store.values();

  return toSortedEntries(items);
}

async function deleteOne(id: string): Promise<void> {
  store.delete(id);
}

async function wipeAll(): Promise<void> {
  store.clear();
}

async function count(): Promise<number> {
  return store.size;
}

async function searchEntries(query: string): Promise<EntryRecord[]> {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return listChronological();
  }

  const items = [...store.values()].filter((entry) => entry.text.toLowerCase().includes(trimmed));

  return toSortedEntries(items);
}

async function toggleComplete(id: string): Promise<void> {
  const entry = store.get(id);

  if (!entry) {
    return;
  }

  store.set(id, {
    ...entry,
    isCompleted: !entry.isCompleted,
    updatedAt: new Date().toISOString(),
  });
}

async function updateEntry(id: string, patch: UpdateEntryPatch): Promise<EntryRecord> {
  const existing = store.get(id);

  if (!existing) {
    throw new Error(`Entry ${id} not found`);
  }

  const nextText = patch.text ?? existing.text;
  const nextCategory = patch.category ?? existing.category;
  const createdAtDate = new Date(existing.createdAt);

  const updated: EntryRecord = {
    ...existing,
    text: nextText,
    category: nextCategory,
    title: patch.title ?? deriveEntryTitle(nextText),
    previewText: deriveEntryPreview(nextText),
    updatedAt: new Date().toISOString(),
    queryKey: buildEntryQueryKey(nextCategory, createdAtDate, id),
  };

  store.set(id, updated);

  return updated;
}

export const entriesRepository = {
  createEntry,
  listChronological,
  deleteOne,
  wipeAll,
  count,
  searchEntries,
  toggleComplete,
  updateEntry,
};
