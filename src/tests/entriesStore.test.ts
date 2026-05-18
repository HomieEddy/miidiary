import { useEntriesStore } from "@/stores/entriesStore";

describe("entriesStore", () => {
  beforeEach(() => {
    useEntriesStore.getState().clearAll();
  });

  it("has empty initial state", () => {
    expect(useEntriesStore.getState().entries).toEqual([]);
  });

  it("addEntry prepends entry and generates unique id", () => {
    useEntriesStore.getState().addEntry({
      text: "Test entry",
      category: "note",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    const state = useEntriesStore.getState();
    expect(state.entries).toHaveLength(1);
    expect(state.entries[0].text).toBe("Test entry");
    expect(state.entries[0].category).toBe("note");
    expect(state.entries[0].id).toMatch(/^entry-/);
  });

  it("getLatestEntry returns most recent entry", () => {
    useEntriesStore.getState().addEntry({
      text: "First",
      category: "note",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    useEntriesStore.getState().addEntry({
      text: "Second",
      category: "note",
      createdAt: "2026-01-02T00:00:00.000Z",
    });
    const latest = useEntriesStore.getState().getLatestEntry();
    expect(latest?.text).toBe("Second");
  });

  it("getLatestEntry returns undefined when empty", () => {
    expect(useEntriesStore.getState().getLatestEntry()).toBeUndefined();
  });

  it("entries are ordered newest-first", () => {
    useEntriesStore.getState().addEntry({
      text: "First",
      category: "note",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    useEntriesStore.getState().addEntry({
      text: "Second",
      category: "note",
      createdAt: "2026-01-02T00:00:00.000Z",
    });
    const entries = useEntriesStore.getState().entries;
    expect(entries[0].text).toBe("Second");
    expect(entries[1].text).toBe("First");
  });

  it("clearAll empties the entries array", () => {
    useEntriesStore.getState().addEntry({
      text: "Test",
      category: "note",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    useEntriesStore.getState().clearAll();
    expect(useEntriesStore.getState().entries).toEqual([]);
  });
});
