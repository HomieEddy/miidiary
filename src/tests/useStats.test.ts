import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockList = jest.fn();

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: { listChronological: (...args: unknown[]) => mockList(...args) },
}));

import { useStats } from "@/hooks/useStats";
import type { EntryRecord } from "@/types/entry";

function makeEntry(overrides: Partial<EntryRecord>): EntryRecord {
  return {
    id: `entry-${Math.random().toString(36).slice(2)}`,
    text: "test",
    title: "test",
    category: "diary",
    isCompleted: false,
    createdAt: new Date().toISOString(),
    previewText: "test",
    queryKey: "test",
    ...overrides,
  } as EntryRecord;
}

function daysAgo(days: number, hour = 10): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

describe("useStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("counts entries, today's entries, and category distribution", async () => {
    mockList.mockResolvedValue([
      makeEntry({ category: "diary", createdAt: daysAgo(0) }),
      makeEntry({ category: "diary", createdAt: daysAgo(0) }),
      makeEntry({ category: "task", createdAt: daysAgo(1) }),
      makeEntry({ category: "note", createdAt: daysAgo(2) }),
    ]);

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.stats).not.toBeNull());

    expect(result.current.stats).toMatchObject({
      total: 4,
      todayCount: 2,
      byCategory: { diary: 2, task: 1, note: 1 },
    });
  });

  it("computes a streak across consecutive days including today", async () => {
    mockList.mockResolvedValue([
      makeEntry({ createdAt: daysAgo(0) }),
      makeEntry({ createdAt: daysAgo(1) }),
      makeEntry({ createdAt: daysAgo(2) }),
    ]);

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.stats?.streakDays).toBe(3));
  });

  it("breaks the streak on a gap day", async () => {
    mockList.mockResolvedValue([
      makeEntry({ createdAt: daysAgo(0) }),
      makeEntry({ createdAt: daysAgo(2) }),
    ]);

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.stats?.streakDays).toBe(1));
  });

  it("counts a streak starting yesterday when today has no entries", async () => {
    mockList.mockResolvedValue([
      makeEntry({ createdAt: daysAgo(1) }),
      makeEntry({ createdAt: daysAgo(2) }),
    ]);

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.stats?.streakDays).toBe(2));
  });

  it("returns zero streak for stale entries only", async () => {
    mockList.mockResolvedValue([makeEntry({ createdAt: daysAgo(5) })]);

    const { result } = renderHook(() => useStats());

    await waitFor(() => expect(result.current.stats?.streakDays).toBe(0));
  });

  it("reload refreshes stats", async () => {
    mockList.mockResolvedValue([makeEntry({ createdAt: daysAgo(0) })]);
    const { result } = renderHook(() => useStats());
    await waitFor(() => expect(result.current.stats?.total).toBe(1));

    mockList.mockResolvedValue([]);
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.stats?.total).toBe(0);
  });
});
