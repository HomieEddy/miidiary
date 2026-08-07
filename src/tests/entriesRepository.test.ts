const mockGetRealmInstance = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-crypto", () => ({
  randomUUID: (...args: unknown[]) => mockRandomUUID(...args),
}));

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
        const sortByQueryKey = (records: Record<string, unknown>[]) =>
          [...records].sort((a, b) => String(a.queryKey).localeCompare(String(b.queryKey)));
        const buildResult = (records: Record<string, unknown>[]) => ({
          sorted: () => sortByQueryKey(records),
          map: <T>(mapper: (record: Record<string, unknown>) => T): T[] =>
            sortByQueryKey(records).map(mapper),
        });

        return {
          length: list.length,
          filtered: (query: string, value: string) => {
            if (query.includes("category")) {
              return buildResult(list.filter((item) => item.category === value));
            }

            const lowered = value.toLowerCase();
            return buildResult(
              list.filter((item) => String(item.text).toLowerCase().includes(lowered)),
            );
          },
          sorted: () => sortByQueryKey(list),
          map: <T>(mapper: (record: Record<string, unknown>) => T): T[] =>
            sortByQueryKey(list).map(mapper),
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
    let counter = 0;
    mockRandomUUID.mockImplementation(() => {
      counter += 1;
      return `uuid-${counter}`;
    });
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

  it("falls back to now when createdAt is invalid", async () => {
    const before = Date.now();
    const entry = await entriesRepository.createEntry({
      text: "Invalid date fallback",
      category: "note",
      createdAt: "not-a-date",
    });
    const after = Date.now();

    const createdMs = Date.parse(entry.createdAt);
    expect(Number.isNaN(createdMs)).toBe(false);
    expect(createdMs).toBeGreaterThanOrEqual(before - 1000);
    expect(createdMs).toBeLessThanOrEqual(after + 1000);
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

  it("keeps category+timestamp query in a bounded fast path for STOR-06 benchmark", async () => {
    const base = Date.parse("2026-05-18T10:00:00.000Z");

    for (let index = 0; index < 500; index += 1) {
      await entriesRepository.createEntry({
        text: `Entry ${index}`,
        category: index % 2 === 0 ? "note" : "task",
        createdAt: new Date(base + index * 1000).toISOString(),
      });
    }

    const start = performance.now();
    const notes = await entriesRepository.listChronological("note");
    const elapsedMs = performance.now() - start;

    expect(notes.length).toBeGreaterThan(0);
    // Keep this as a bounded fast-path check to reduce CI timing flakiness.
    expect(elapsedMs).toBeLessThan(50);
  });
});
