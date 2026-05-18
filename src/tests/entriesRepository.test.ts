const mockGetRealmInstance = jest.fn();

jest.mock("@/services/realmService", () => ({
  getRealmInstance: (...args: unknown[]) => mockGetRealmInstance(...args),
}));

import { entriesRepository } from "@/services/entriesRepository";

describe("entriesRepository", () => {
  const store = new Map<string, Record<string, unknown>>();

  function buildRealmMock(): Record<string, unknown> {
    return {
      write: (fn: () => void) => fn(),
      create: (_name: string, payload: Record<string, unknown>) => {
        store.set(payload.id as string, payload);
      },
      objects: () => {
        const list = Array.from(store.values());

        return {
          length: list.length,
          filtered: (_query: string, category: string) => ({
            sorted: () => list.filter((item) => item.category === category),
          }),
          sorted: () =>
            list.sort((a, b) => String(a.queryKey).localeCompare(String(b.queryKey))),
        };
      },
      objectForPrimaryKey: (_name: string, id: string) => store.get(id),
      delete: (value: unknown) => {
        if (Array.isArray(value)) {
          store.clear();
          return;
        }

        if (value && typeof value === "object" && "id" in (value as Record<string, unknown>)) {
          store.delete(String((value as Record<string, unknown>).id));
          return;
        }

        store.clear();
      },
    };
  }

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();
    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
  });

  it("createEntry stores required and derived fields", async () => {
    const entry = await entriesRepository.createEntry({
      text: "My first sentence. Here is more text",
      category: "note",
      createdAt: "2026-05-18T10:00:00.000Z",
    });

    expect(entry.id).toMatch(/^entry-/);
    expect(entry.title).toBe("My first sentence");
    expect(entry.previewText).toContain("My first sentence");
    expect(entry.queryKey).toContain("note|");
  });

  it("listChronological returns newest-first deterministically", async () => {
    await entriesRepository.createEntry({
      text: "Older",
      category: "note",
      createdAt: "2026-05-18T09:00:00.000Z",
    });
    await entriesRepository.createEntry({
      text: "Newer",
      category: "note",
      createdAt: "2026-05-18T10:00:00.000Z",
    });

    const entries = await entriesRepository.listChronological();
    expect(entries[0]?.text).toBe("Newer");
    expect(entries[1]?.text).toBe("Older");
  });

  it("deleteOne removes only selected id and wipeAll clears all", async () => {
    const first = await entriesRepository.createEntry({
      text: "One",
      category: "note",
    });
    await entriesRepository.createEntry({
      text: "Two",
      category: "note",
    });

    await entriesRepository.deleteOne(first.id);
    let entries = await entriesRepository.listChronological();
    expect(entries).toHaveLength(1);

    await entriesRepository.wipeAll();
    entries = await entriesRepository.listChronological();
    expect(entries).toEqual([]);
  });

  it("persists across close/reopen behavior in repository contract", async () => {
    await entriesRepository.createEntry({
      text: "Persisted",
      category: "note",
    });

    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
    const entries = await entriesRepository.listChronological();
    expect(entries[0]?.text).toBe("Persisted");
  });
});
