const mockGetRealmInstance = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-crypto", () => ({
  randomUUID: (...args: unknown[]) => mockRandomUUID(...args),
}));

jest.mock("@/services/realmService", () => ({
  getRealmInstance: (...args: unknown[]) => mockGetRealmInstance(...args),
}));

import { entriesRepository } from "@/services/entriesRepository";

describe("taskCompletion", () => {
  const store = new Map<string, Record<string, unknown>>();

  function buildRealmMock(): Record<string, unknown> {
    return {
      write: (fn: () => void) => fn(),
      create: (_name: string, payload: Record<string, unknown>) => {
        store.set(payload.id as string, payload);
      },
      objects: () => ({
        length: store.size,
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
      return `task-${counter}`;
    });
    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
  });

  it("toggles isCompleted true then false", async () => {
    expect.assertions(2);

    const entry = await entriesRepository.createEntry({ text: "pay rent", category: "task" });
    await entriesRepository.toggleComplete(entry.id);

    const first = await entriesRepository.listChronological("task");
    expect(first[0]?.isCompleted).toBe(true);

    await entriesRepository.toggleComplete(entry.id);
    const second = await entriesRepository.listChronological("task");
    expect(second[0]?.isCompleted).toBe(false);
  });

  it("no-ops for unknown ids", async () => {
    expect.assertions(1);

    await expect(entriesRepository.toggleComplete("missing-id")).resolves.toBeUndefined();
  });
});
