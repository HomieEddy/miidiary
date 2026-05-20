const mockGetRealmInstance = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-crypto", () => ({
  randomUUID: (...args: unknown[]) => mockRandomUUID(...args),
}));

jest.mock("@/services/realmService", () => ({
  getRealmInstance: (...args: unknown[]) => mockGetRealmInstance(...args),
}));

import { entriesRepository } from "@/services/entriesRepository";

describe("entryEdit", () => {
  const store = new Map<string, Record<string, unknown>>();

  function buildRealmMock(): Record<string, unknown> {
    return {
      write: (fn: () => void) => fn(),
      create: (_name: string, payload: Record<string, unknown>) => {
        store.set(payload.id as string, payload);
      },
      objects: () => ({
        sorted: () => Array.from(store.values()),
        filtered: () => ({ sorted: () => Array.from(store.values()) }),
        map: <T>(mapper: (record: Record<string, unknown>) => T): T[] =>
          Array.from(store.values()).map(mapper),
      }),
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
      return `edit-${counter}`;
    });
    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
  });

  it("patches text/category and re-derives preview/title", async () => {
    expect.assertions(3);

    const entry = await entriesRepository.createEntry({ text: "first idea", category: "note" });
    const updated = await entriesRepository.updateEntry(entry.id, {
      text: "Second pass with more detail.",
      category: "task",
    });

    expect(updated.category).toBe("task");
    expect(updated.previewText).toContain("Second pass");
    expect(updated.title).toContain("Second pass with more detail");
  });

  it("keeps explicit title when provided", async () => {
    expect.assertions(1);

    const entry = await entriesRepository.createEntry({ text: "raw text", category: "note" });
    const updated = await entriesRepository.updateEntry(entry.id, {
      text: "edited text",
      title: "Custom title",
    });

    expect(updated.title).toBe("Custom title");
  });

  it("throws for unknown entry", async () => {
    expect.assertions(1);

    await expect(
      entriesRepository.updateEntry("missing", { text: "nope" }),
    ).rejects.toThrow("Entry missing not found");
  });
});
