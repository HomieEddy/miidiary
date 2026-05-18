import { buildEntryQueryKey } from "@/models/EntryRealm";
import {
  deriveEntryPreview,
  deriveEntryTitle,
  entryDerivationLimits,
} from "@/utils/entryTextDerivation";

describe("entryTextDerivation", () => {
  it("produces deterministic title and preview for identical input", () => {
    const text = "  Hello world. This is a test entry with extra spacing.  ";

    expect(deriveEntryTitle(text)).toBe(deriveEntryTitle(text));
    expect(deriveEntryPreview(text)).toBe(deriveEntryPreview(text));
  });

  it("uses first sentence for title and deterministic truncation for preview", () => {
    const text = "First sentence is here! Second sentence goes on and on for preview.";
    const longText = `${text} ${"x".repeat(200)}`;

    const title = deriveEntryTitle(text);
    const preview = deriveEntryPreview(longText);

    expect(title).toBe("First sentence is here");
    expect(preview.length).toBeLessThanOrEqual(entryDerivationLimits.preview);
    expect(preview.endsWith("…")).toBe(true);
  });

  it("builds deterministic query key for same inputs", () => {
    const createdAt = new Date("2026-05-18T12:30:00.000Z");

    const first = buildEntryQueryKey("note", createdAt, "abc-123");
    const second = buildEntryQueryKey("note", createdAt, "abc-123");

    expect(first).toBe(second);
  });
});
