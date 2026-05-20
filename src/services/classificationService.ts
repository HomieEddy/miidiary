import type { EntryCategory } from "@/types/entry";

export type ClassificationSource = "model" | "heuristic";

export type ClassificationResult = {
  category: EntryCategory;
  confidence: number;
  rationale: string;
  source: ClassificationSource;
};

export type ClassifyEntryInput = {
  text: string;
};

type CategoryScores = Record<EntryCategory, number>;

const TASK_TERMS = [
  "todo",
  "task",
  "deadline",
  "follow up",
  "call",
  "schedule",
  "buy",
  "need to",
  "remind",
  "tomorrow",
];

const DIARY_TERMS = [
  "today",
  "felt",
  "i am",
  "i was",
  "grateful",
  "learned",
  "memory",
  "happened",
  "journal",
  "reflect",
];

const NOTE_TERMS = [
  "idea",
  "note",
  "remember",
  "concept",
  "insight",
  "summary",
  "fact",
  "snippet",
  "reference",
  "point",
];

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function countMatches(text: string, terms: string[]): number {
  return terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
}

function localModelScores(text: string): CategoryScores {
  const normalized = normalize(text);

  return {
    task: countMatches(normalized, TASK_TERMS),
    diary: countMatches(normalized, DIARY_TERMS),
    note: countMatches(normalized, NOTE_TERMS),
  };
}

function maxCategory(scores: CategoryScores): { category: EntryCategory; score: number } {
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranked[0] as [EntryCategory, number];
  return { category: top[0], score: top[1] };
}

function confidenceFromScores(scores: CategoryScores, category: EntryCategory): number {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return 0.5;
  }

  const raw = scores[category] / total;
  return Math.min(1, Math.max(0.5, Number(raw.toFixed(2))));
}

function heuristicFallback(text: string): ClassificationResult {
  const normalized = normalize(text);
  if (!normalized) {
    return {
      category: "note",
      confidence: 0.5,
      rationale: "Fallback to note for empty transcription text.",
      source: "heuristic",
    };
  }

  if (TASK_TERMS.some((term) => normalized.includes(term))) {
    return {
      category: "task",
      confidence: 0.61,
      rationale: "Heuristic matched action-oriented keywords.",
      source: "heuristic",
    };
  }

  if (DIARY_TERMS.some((term) => normalized.includes(term))) {
    return {
      category: "diary",
      confidence: 0.61,
      rationale: "Heuristic matched reflective first-person keywords.",
      source: "heuristic",
    };
  }

  return {
    category: "note",
    confidence: 0.58,
    rationale: "Heuristic defaulted to note classification.",
    source: "heuristic",
  };
}

export class ClassificationService {
  async classifyEntry(input: ClassifyEntryInput): Promise<ClassificationResult> {
    try {
      const scores = localModelScores(input.text);
      const top = maxCategory(scores);

      if (top.score === 0) {
        return heuristicFallback(input.text);
      }

      return {
        category: top.category,
        confidence: confidenceFromScores(scores, top.category),
        rationale: `Model matched ${top.score} weighted feature(s) for ${top.category}.`,
        source: "model",
      };
    } catch {
      return heuristicFallback(input.text);
    }
  }
}

export const classificationService = new ClassificationService();