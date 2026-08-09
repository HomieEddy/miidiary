import { useEntriesStore, type Entry } from "@/stores/entriesStore";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: `entry-${Math.random().toString(36).slice(2)}`,
    text: "Test entry",
    category: "note",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("entriesStore", () => {
  beforeEach(() => {
    useEntriesStore.getState().clearAll();
  });

  it("has empty initial state", () => {
    expect(useEntriesStore.getState().entries).toEqual([]);
  });

  it("addPersistedEntry prepends entry", () => {
    useEntriesStore.getState().addPersistedEntry(makeEntry({ text: "First" }));
    useEntriesStore.getState().addPersistedEntry(makeEntry({ text: "Second" }));
    const state = useEntriesStore.getState();
    expect(state.entries).toHaveLength(2);
    expect(state.entries[0].text).toBe("Second");
    expect(state.entries[1].text).toBe("First");
  });

  it("addPersistedEntry replaces entry with same id", () => {
    const entry = makeEntry({ text: "Original" });
    useEntriesStore.getState().addPersistedEntry(entry);
    useEntriesStore.getState().addPersistedEntry({ ...entry, text: "Updated" });
    const state = useEntriesStore.getState();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].text).toBe("Updated");
  });

  it("keeps the most recent entry first (prepend order)", () => {
    useEntriesStore.getState().addPersistedEntry(makeEntry({ text: "First" }));
    useEntriesStore.getState().addPersistedEntry(makeEntry({ text: "Second" }));
    expect(useEntriesStore.getState().entries[0].text).toBe("Second");
  });

  it("entries are ordered newest-first", () => {
    useEntriesStore.getState().addPersistedEntry(makeEntry({ text: "First" }));
    useEntriesStore.getState().addPersistedEntry(makeEntry({ text: "Second" }));
    const entries = useEntriesStore.getState().entries;
    expect(entries[0].text).toBe("Second");
    expect(entries[1].text).toBe("First");
  });

  it("clearAll empties the entries array", () => {
    useEntriesStore.getState().addPersistedEntry(makeEntry());
    useEntriesStore.getState().clearAll();
    expect(useEntriesStore.getState().entries).toEqual([]);
  });
});
