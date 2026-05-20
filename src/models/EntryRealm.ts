import type Realm from "realm";
import type { EntryCategory } from "@/types/entry";

const REVERSE_EPOCH_CEILING = 9_999_999_999_999;
const REVERSE_EPOCH_WIDTH = 13;

export function buildEntryQueryKey(
  category: EntryCategory,
  createdAt: Date,
  id: string,
): string {
  const epochMs = createdAt.getTime();
  const safeEpoch = Number.isFinite(epochMs) && epochMs >= 0 ? epochMs : 0;
  const reverseEpoch = Math.max(0, REVERSE_EPOCH_CEILING - safeEpoch);

  return `${category}|${String(reverseEpoch).padStart(REVERSE_EPOCH_WIDTH, "0")}|${id}`;
}

export const EntryRealmSchema: Realm.ObjectSchema = {
  name: "Entry",
  primaryKey: "id",
  properties: {
    id: "string",
    text: "string",
    category: "string",
    createdAt: "date",
    updatedAt: "date",
    title: "string",
    previewText: "string",
    queryKey: { type: "string", indexed: true },
    isCompleted: { type: "bool", default: false },
    classificationConfidence: "double?",
    classificationRationale: "string?",
    classificationSource: "string?",
  },
};
