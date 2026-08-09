export type EntryCategory = "diary" | "task" | "note";

export type DueDatePreset = "today" | "tomorrow" | "week";

export interface EntryClassificationMetadata {
  confidence: number;
  rationale: string;
  source: "model" | "heuristic";
}

export interface EntryRecord {
  id: string;
  text: string;
  category: EntryCategory;
  createdAt: string;
  updatedAt: string;
  title: string;
  previewText: string;
  queryKey: string;
  isCompleted: boolean;
  isFavorite: boolean;
  /** ISO date (yyyy-mm-dd) or null. */
  dueDate: string | null;
  isUrgent: boolean;
  classificationConfidence: number | null;
  classificationRationale: string | null;
  classificationSource: "model" | "heuristic" | null;
}

export interface UpdateEntryPatch {
  text?: string;
  category?: EntryCategory;
  title?: string;
  isFavorite?: boolean;
  dueDate?: string | null;
  isUrgent?: boolean;
}

export interface CreateEntryInput {
  text: string;
  category: EntryCategory;
  createdAt?: string;
  classification?: EntryClassificationMetadata;
}
