import * as Crypto from "expo-crypto";
import Realm from "realm";
import { buildEntryQueryKey } from "@/models/EntryRealm";
import { getRealmInstance } from "@/services/realmService";
import type {
  CreateEntryInput,
  EntryCategory,
  EntryRecord,
  UpdateEntryPatch,
} from "@/types/entry";
import { deriveEntryPreview, deriveEntryTitle } from "@/utils/entryTextDerivation";

type RealmEntry = {
  id: string;
  text: string;
  category: EntryCategory;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  previewText: string;
  queryKey: string;
  isCompleted: boolean;
  isFavorite: boolean;
  dueDate: string | null;
  isUrgent: boolean;
  classificationConfidence: number | null;
  classificationRationale: string | null;
  classificationSource: "model" | "heuristic" | null;
};

function toEntryRecord(item: RealmEntry): EntryRecord {
  return {
    id: item.id,
    text: item.text,
    category: item.category,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    title: item.title,
    previewText: item.previewText,
    queryKey: item.queryKey,
    isCompleted: item.isCompleted,
    isFavorite: item.isFavorite,
    dueDate: item.dueDate ?? null,
    isUrgent: item.isUrgent,
    classificationConfidence: item.classificationConfidence,
    classificationRationale: item.classificationRationale,
    classificationSource: item.classificationSource,
  };
}

async function createEntry(input: CreateEntryInput): Promise<EntryRecord> {
  const realm = await getRealmInstance();
  const now = new Date();
  const candidateCreatedAt = input.createdAt ? new Date(input.createdAt) : now;
  const createdAt = Number.isNaN(candidateCreatedAt.getTime()) ? now : candidateCreatedAt;
  const id = `entry-${Crypto.randomUUID()}`;

  const payload: RealmEntry = {
    id,
    text: input.text,
    category: input.category,
    createdAt,
    updatedAt: now,
    title: deriveEntryTitle(input.text),
    previewText: deriveEntryPreview(input.text),
    queryKey: buildEntryQueryKey(input.category, createdAt, id),
    isCompleted: false,
    isFavorite: false,
    dueDate: null,
    isUrgent: false,
    classificationConfidence: input.classification?.confidence ?? null,
    classificationRationale: input.classification?.rationale ?? null,
    classificationSource: input.classification?.source ?? null,
  };

  realm.write(() => {
    realm.create("Entry", payload);
  });

  return toEntryRecord(payload);
}

async function listChronological(category?: EntryCategory): Promise<EntryRecord[]> {
  const realm = await getRealmInstance();
  const source = category
    ? realm.objects<RealmEntry>("Entry").filtered("category == $0", category)
    : realm.objects<RealmEntry>("Entry");

  return source.sorted("queryKey").map((item) => toEntryRecord(item));
}

async function deleteOne(id: string): Promise<void> {
  const realm = await getRealmInstance();

  realm.write(() => {
    const entry = realm.objectForPrimaryKey("Entry", id);
    if (entry) {
      realm.delete(entry);
    }
  });
}

async function wipeAll(): Promise<void> {
  const realm = await getRealmInstance();
  realm.write(() => {
    realm.delete(realm.objects("Entry"));
  });
}

/** Re-insert a previously deleted record under its original id (undo). */
async function restoreEntry(record: EntryRecord): Promise<EntryRecord> {
  const realm = await getRealmInstance();
  const payload: RealmEntry = {
    id: record.id,
    text: record.text,
    category: record.category,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    title: record.title,
    previewText: record.previewText,
    queryKey: record.queryKey,
    isCompleted: record.isCompleted,
    isFavorite: record.isFavorite,
    dueDate: record.dueDate,
    isUrgent: record.isUrgent,
    classificationConfidence: record.classificationConfidence,
    classificationRationale: record.classificationRationale,
    classificationSource: record.classificationSource,
  };

  realm.write(() => {
    realm.create("Entry", payload, true);
  });

  return toEntryRecord(payload);
}

async function count(): Promise<number> {
  const realm = await getRealmInstance();
  return realm.objects("Entry").length;
}

async function searchEntries(query: string): Promise<EntryRecord[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return listChronological();
  }

  const realm = await getRealmInstance();
  return realm
    .objects<RealmEntry>("Entry")
    .filtered("text CONTAINS[c] $0", trimmed)
    .sorted("queryKey")
    .map((item) => toEntryRecord(item));
}

async function toggleComplete(id: string): Promise<void> {
  const realm = await getRealmInstance();
  const entry = realm.objectForPrimaryKey<RealmEntry>("Entry", id);
  if (!entry) {
    return;
  }

  realm.write(() => {
    entry.isCompleted = !entry.isCompleted;
  });
}

async function toggleFavorite(id: string): Promise<boolean> {
  const realm = await getRealmInstance();
  const entry = realm.objectForPrimaryKey<RealmEntry>("Entry", id);
  if (!entry) {
    return false;
  }

  realm.write(() => {
    entry.isFavorite = !entry.isFavorite;
  });

  return entry.isFavorite;
}

async function updateEntry(id: string, patch: UpdateEntryPatch): Promise<EntryRecord> {
  const realm = await getRealmInstance();
  const entry = realm.objectForPrimaryKey<RealmEntry>("Entry", id);
  if (!entry) {
    throw new Error(`Entry ${id} not found`);
  }

  realm.write(() => {
    const nextText = patch.text ?? entry.text;
    entry.text = nextText;
    entry.category = patch.category ?? entry.category;
    entry.title = patch.title ?? deriveEntryTitle(nextText);
    entry.previewText = deriveEntryPreview(nextText);
    if (patch.isFavorite !== undefined) {
      entry.isFavorite = patch.isFavorite;
    }
    if (patch.dueDate !== undefined) {
      entry.dueDate = patch.dueDate;
    }
    if (patch.isUrgent !== undefined) {
      entry.isUrgent = patch.isUrgent;
    }
    entry.updatedAt = new Date();
    entry.queryKey = buildEntryQueryKey(entry.category, entry.createdAt, entry.id);
  });

  return toEntryRecord(entry);
}

export const entriesRepository = {
  createEntry,
  listChronological,
  deleteOne,
  wipeAll,
  count,
  searchEntries,
  toggleComplete,
  toggleFavorite,
  restoreEntry,
  updateEntry,
};
