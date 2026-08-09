import { renderHook, act, waitFor } from "@testing-library/react-native";
import { entriesRepository } from "@/services/entriesRepository";
import { useEntries } from "@/hooks/useEntries";
import { useEntriesStore } from "@/stores/entriesStore";

const mockGetRealmInstance = jest.fn();
const mockRandomUUID = jest.fn();

jest.mock("expo-crypto", () => ({
  randomUUID: (...args: unknown[]) => mockRandomUUID(...args),
}));

jest.mock("@/services/realmService", () => ({
  getRealmInstance: (...args: unknown[]) => mockGetRealmInstance(...args),
}));

/**
 * End-to-end diary flow against the REAL repository (in-memory realm
 * double), the real useEntries hook and the real entries store:
 * capture → browse → search → wipe → restore. Replaces the dead Detox
 * scaffold as the browse/review regression net (C1).
 */
describe("diary flow integration", () => {
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
          map: <T,>(mapper: (record: Record<string, unknown>) => T): T[] =>
            sortByQueryKey(records).map(mapper),
        });

        return {
          length: list.length,
          filtered: (query: string, value: string) => {
            if (query.includes("category")) {
              return buildResult(list.filter((item) => item.category === value));
            }
            if (query.includes("text ==")) {
              return buildResult(list.filter((item) => item.text === value));
            }
            const lowered = value.toLowerCase();
            return buildResult(
              list.filter((item) => String(item.text).toLowerCase().includes(lowered)),
            );
          },
          sorted: () => sortByQueryKey(list),
          map: <T,>(mapper: (record: Record<string, unknown>) => T): T[] =>
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
    mockRandomUUID.mockImplementation(() => `uuid-${++counter}`);
    mockGetRealmInstance.mockResolvedValue(buildRealmMock());
    useEntriesStore.getState().clearAll();
  });

  it("captures entries, browses them, searches, wipes and restores", async () => {
    // Capture two entries through the repository.
    const first = await entriesRepository.createEntry({ text: "Buy groceries", category: "task" });
    const second = await entriesRepository.createEntry({ text: "Today was a good day", category: "diary" });

    // Browse: the hook lists them newest-first.
    const { result } = renderHook(() => useEntries());
    await waitFor(() => {
      expect(result.current.entries).toHaveLength(2);
    });
    expect(result.current.entries[0].id).toBe(second.id);

    // Search finds the diary entry by text.
    await act(async () => {
      result.current.setSearchQuery("good day");
    });
    await waitFor(() => {
      expect(result.current.searchResults?.[0].id).toBe(second.id);
    });

    // Wipe clears the repository, the hook and the shared store.
    await act(async () => {
      await entriesRepository.wipeAll();
      useEntriesStore.getState().clearAll();
      await result.current.loadEntries();
    });
    expect(result.current.entries).toHaveLength(0);

    // Restore (undo) brings the deleted entry back under its original id.
    const restored = await entriesRepository.restoreEntry(first);
    expect(restored.id).toBe(first.id);
    const browsed = await entriesRepository.listChronological();
    expect(browsed).toHaveLength(1);
    expect(browsed[0].text).toBe("Buy groceries");
  });

  it("task completion round-trips through the repository", async () => {
    const task = await entriesRepository.createEntry({ text: "Finish the report", category: "task" });

    await entriesRepository.toggleComplete(task.id);
    const browsed = await entriesRepository.listChronological();
    expect(browsed[0].isCompleted).toBe(true);

    await entriesRepository.toggleComplete(task.id);
    expect((await entriesRepository.listChronological())[0].isCompleted).toBe(false);
  });
});
