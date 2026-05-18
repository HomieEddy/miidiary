export type EntryCategory = "diary" | "task" | "note";

export interface EntryRecord {
  id: string;
  text: string;
  category: EntryCategory;
  createdAt: string;
  updatedAt: string;
  title: string;
  previewText: string;
  queryKey: string;
}

export interface CreateEntryInput {
  text: string;
  category: EntryCategory;
  createdAt?: string;
}
