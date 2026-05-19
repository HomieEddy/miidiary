const TITLE_MAX_LENGTH = 80;
const PREVIEW_MAX_LENGTH = 140;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateDeterministically(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function deriveEntryTitle(text: string): string {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return "Untitled entry";
  }

  const firstSentence = normalized.split(/[.!?]/, 1)[0]?.trim() ?? normalized;
  return truncateDeterministically(firstSentence || normalized, TITLE_MAX_LENGTH);
}

export function deriveEntryPreview(text: string): string {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return "";
  }

  return truncateDeterministically(normalized, PREVIEW_MAX_LENGTH);
}

export const entryDerivationLimits = {
  title: TITLE_MAX_LENGTH,
  preview: PREVIEW_MAX_LENGTH,
};
