import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useEntries } from "@/hooks/useEntries";
import { useEntriesStore } from "@/stores/entriesStore";

const mockListChronological = jest.fn();
const mockSearchEntries = jest.fn();
const mockWipeAll = jest.fn();
const mockReauthenticate = jest.fn();

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    listChronological: (...args: unknown[]) => mockListChronological(...args),
    searchEntries: (...args: unknown[]) => mockSearchEntries(...args),
    wipeAll: (...args: unknown[]) => mockWipeAll(...args),
  },
}));

jest.mock("@/services/localAuthService", () => ({
  reauthenticateForDestructiveAction: (...args: unknown[]) => mockReauthenticate(...args),
}));

const sampleEntries = [
  {
    id: "entry-1",
    text: "First",
    category: "diary",
    createdAt: "2026-08-08T10:00:00.000Z",
    updatedAt: "2026-08-08T10:00:00.000Z",
    title: "First",
    previewText: "First",
    queryKey: "d-20260808-entry-1",
    isCompleted: false,
    isFavorite: false,
    dueDate: null,
    isUrgent: false,
    classificationConfidence: null,
    classificationRationale: null,
    classificationSource: null,
  },
] as const;

describe("useEntries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockListChronological.mockResolvedValue([]);
    mockSearchEntries.mockResolvedValue([]);
    useEntriesStore.getState().clearAll();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("ignores stale search results after the query is cleared", async () => {
    let resolveSearch: ((value: typeof sampleEntries) => void) | null = null;
    mockSearchEntries.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
    );

    const { result } = renderHook(() => useEntries());

    await act(async () => {
      result.current.setSearchQuery("wip");
    });

    // Debounce elapses; the search is now in flight.
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Query cleared while the request is still pending.
    await act(async () => {
      result.current.setSearchQuery("");
    });

    // The stale request resolves AFTER the clear.
    await act(async () => {
      resolveSearch?.(sampleEntries as unknown as typeof sampleEntries);
    });

    expect(result.current.searchResults).toBeNull();
    expect(mockSearchEntries).toHaveBeenCalledTimes(1);
  });

  it("wipe clears the shared store so all consumers update", async () => {
    mockReauthenticate.mockResolvedValue(true);
    mockWipeAll.mockResolvedValue(undefined);
    mockListChronological.mockResolvedValue([]);
    useEntriesStore.getState().setEntries([
      { id: "entry-1", text: "First", category: "diary", createdAt: "2026-08-08T10:00:00.000Z" },
    ]);

    const { result } = renderHook(() => useEntries({ autoLoad: false }));

    let wiped = false;
    await act(async () => {
      wiped = await result.current.confirmWipeAll();
    });

    expect(wiped).toBe(true);
    expect(mockWipeAll).toHaveBeenCalledTimes(1);
    expect(useEntriesStore.getState().entries).toEqual([]);
  });

  it("keeps wipe confirmation closed when re-auth fails", async () => {
    mockReauthenticate.mockResolvedValue(false);

    const { result } = renderHook(() => useEntries({ autoLoad: false }));

    let wiped: boolean | null = null;
    await act(async () => {
      wiped = await result.current.confirmWipeAll();
    });

    expect(wiped).toBe(false);
    expect(mockWipeAll).not.toHaveBeenCalled();
  });

  it("search results are scoped to the requested category", async () => {
    mockSearchEntries.mockResolvedValue([
      { ...sampleEntries[0], id: "a", category: "diary" },
      { ...sampleEntries[0], id: "b", category: "task" },
    ]);

    const { result } = renderHook(() => useEntries({ autoLoad: false, category: "diary" }));

    await act(async () => {
      result.current.setSearchQuery("hello");
    });
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(result.current.searchResults).toHaveLength(1);
    });
    expect(result.current.searchResults?.[0].id).toBe("a");
  });
});
