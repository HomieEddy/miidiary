const mockGetRealmInstance = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-crypto", () => ({
  randomUUID: (...args: unknown[]) => mockRandomUUID(...args),
}));

jest.mock("@/services/realmService", () => ({
  getRealmInstance: (...args: unknown[]) => mockGetRealmInstance(...args),
}));

import { entriesRepository } from "@/services/entriesRepository";

describe("diarySearch", () => {
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

        return {
          sorted: () => sortByQueryKey(list),
          filtered: (query: string, value: string) => {
            if (query.includes("category")) {
              const byCategory = list.filter((item) => item.category === value);
              return {
                sorted: () => sortByQueryKey(byCategory),
                map: <T>(mapper: (record: Record<string, unknown>) => T): T[] =>
                  sortByQueryKey(byCategory).map(mapper),
              };
            }

            const lowered = value.toLowerCase();
            const matched = list.filter((item) =>
              String(item.text).toLowerCase().includes(lowered),
            );
            return {
              sorted: () => sortByQueryKey(matched),
              map: <T>(mapper: (record: Record<string, unknown>) => T): T[] =>
                sortByQueryKey(matched).map(mapper),
            };
          },
          map: <T>(mapper: (record: Record<string, unknown>) => T): T[] =>
            sortByQueryKey(list).map(mapper),
        };
      },
      objectForPrimaryKey: (_name: string, id: string) => store.get(id),
      delete: () => undefined,
    };
  }

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();
    let counter = 0;
    mockRandomUUID.mockImplementation(() => {
      counter += 1;
      return `search-${counter}`;
    });
    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
  });

  it("returns all entries for empty query", async () => {
    expect.assertions(1);

    await entriesRepository.createEntry({ text: "coffee thoughts", category: "diary" });
    await entriesRepository.createEntry({ text: "meeting note", category: "note" });

    const results = await entriesRepository.searchEntries("");
    expect(results).toHaveLength(2);
  });

  it("returns all entries for whitespace-only query", async () => {
    expect.assertions(1);

    await entriesRepository.createEntry({ text: "alpha", category: "note" });
    await entriesRepository.createEntry({ text: "beta", category: "task" });

    const results = await entriesRepository.searchEntries("   ");
    expect(results).toHaveLength(2);
  });

  it("finds matches by case-insensitive text contains", async () => {
    expect.assertions(2);

    await entriesRepository.createEntry({ text: "coffee with Sam", category: "diary" });
    await entriesRepository.createEntry({ text: "Walk the dog", category: "task" });

    const lower = await entriesRepository.searchEntries("coffee");
    const upper = await entriesRepository.searchEntries("Coffee");

    expect(lower).toHaveLength(1);
    expect(upper[0]?.text).toBe("coffee with Sam");
  });
});
