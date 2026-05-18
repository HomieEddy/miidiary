import { flattenEntrySections, groupEntriesByDay } from "@/utils/entryGrouping";
import type { EntryRecord } from "@/types/entry";

function buildEntry(id: string, createdAt: string): EntryRecord {
  return {
    id,
    text: `text-${id}`,
    category: "note",
    createdAt,
    updatedAt: createdAt,
    title: `title-${id}`,
    previewText: `preview-${id}`,
    queryKey: `note|${id}`,
  };
}

describe("entryGrouping", () => {
  it("groups deterministically by day", () => {
    const now = new Date("2026-05-18T12:00:00.000Z");
    const sections = groupEntriesByDay(
      [
        buildEntry("1", "2026-05-18T10:00:00.000Z"),
        buildEntry("2", "2026-05-17T10:00:00.000Z"),
      ],
      now,
    );

    expect(sections[0]?.label).toBe("Today");
    expect(sections[1]?.label).toBe("Yesterday");
  });

  it("flattens sections into stable keys", () => {
    const sections = groupEntriesByDay([
      buildEntry("1", "2026-05-18T10:00:00.000Z"),
    ]);

    const flat = flattenEntrySections(sections);
    expect(flat[0]?.key.startsWith("header-")).toBe(true);
    expect(flat[1]?.key).toBe("row-1");
  });
});
