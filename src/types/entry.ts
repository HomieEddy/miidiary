export type EntryCategory = "diary" | "task" | "note";

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
  classificationConfidence: number | null;
  classificationRationale: string | null;
  classificationSource: "model" | "heuristic" | null;
}

export interface UpdateEntryPatch {
  text?: string;
  category?: EntryCategory;
  title?: string;
}

export interface CreateEntryInput {
  text: string;
  category: EntryCategory;
  createdAt?: string;
  classification?: EntryClassificationMetadata;
}
