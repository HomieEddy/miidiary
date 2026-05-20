import * as Crypto from "expo-crypto";
import { buildEntryQueryKey } from "@/models/EntryRealm";
import { getRealmInstance } from "@/services/realmService";
import type { CreateEntryInput, EntryCategory, EntryRecord } from "@/types/entry";
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

async function count(): Promise<number> {
  const realm = await getRealmInstance();
  return realm.objects("Entry").length;
}

export const entriesRepository = {
  createEntry,
  listChronological,
  deleteOne,
  wipeAll,
  count,
};
