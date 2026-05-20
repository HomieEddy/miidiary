const mockGetRealmInstance = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-crypto", () => ({
  randomUUID: (...args: unknown[]) => mockRandomUUID(...args),
}));

jest.mock("@/services/realmService", () => ({
  getRealmInstance: (...args: unknown[]) => mockGetRealmInstance(...args),
}));

import { entriesRepository } from "@/services/entriesRepository";

describe("bilingualSearch", () => {
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
          filtered: (_query: string, value: string) => {
            // Mirrors CONTAINS[c] behavior used by repository: case-insensitive only,
            // but not accent-insensitive. Queries must include accents to match accents.
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
      return `fr-${counter}`;
    });
    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
  });

  it("handles accent-sensitive french matches", async () => {
    expect.assertions(4);

    await entriesRepository.createEntry({ text: "Aller au café demain", category: "diary" });
    await entriesRepository.createEntry({ text: "Mettre a jour le résumé", category: "note" });

    const cafe = await entriesRepository.searchEntries("café");
    const resumeNoAccent = await entriesRepository.searchEntries("resume");
    const resumeAccent = await entriesRepository.searchEntries("résumé");

    expect(cafe).toHaveLength(1);
    expect(cafe[0]?.text).toContain("café");
    expect(resumeNoAccent).toHaveLength(0);
    expect(resumeAccent).toHaveLength(1);
  });
});
