import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { DigestCards } from "@/components/ui/DigestCards";
import type { EntryRecord } from "@/types/entry";

const mockListChronological = jest.fn();

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    listChronological: (...args: unknown[]) => mockListChronological(...args),
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
}));

function makeEntry(overrides: Partial<EntryRecord>): EntryRecord {
  const base: EntryRecord = {
    id: `entry-${Math.random().toString(36).slice(2)}`,
    text: "test",
    title: "test",
    category: "diary",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    previewText: "test",
    queryKey: "k",
    isCompleted: false,
    isFavorite: false,
    dueDate: null,
    isUrgent: false,
    classificationConfidence: null,
    classificationRationale: null,
    classificationSource: null,
  };
  return { ...base, ...overrides };
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

describe("DigestCards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders weekly and monthly cards with computed counts", async () => {
    mockListChronological.mockResolvedValue([
      makeEntry({ category: "diary", createdAt: daysAgo(0) }),
      makeEntry({ category: "diary", createdAt: daysAgo(1) }),
      makeEntry({ category: "task", createdAt: daysAgo(3) }),
      makeEntry({ category: "note", createdAt: daysAgo(20) }),
    ]);

    const { getByText, getByTestId } = render(<DigestCards />);

    await waitFor(() => {
      expect(getByText("Weekly Wrap-up")).toBeTruthy();
      expect(getByText("Monthly Reflection")).toBeTruthy();
    });
    // Last 7 days: the 3 recent entries.
    expect(getByTestId("digest-weekly-count").props.children).toBe(3);
    // Category insight for the week.
    expect(getByText("Mostly Diary")).toBeTruthy();
    // Monthly count includes every entry in the current calendar month.
    const monthlyCount = getByTestId("digest-monthly-count").props.children;
    expect(Number(monthlyCount)).toBeGreaterThanOrEqual(3);
  });

  it("shows zero counts when there are no entries", async () => {
    mockListChronological.mockResolvedValue([]);

    const { getByTestId, getByText } = render(<DigestCards />);

    await waitFor(() => {
      expect(getByTestId("digest-weekly-count").props.children).toBe(0);
    });
    expect(getByText(/thoughts this week/)).toBeTruthy();
    expect(getByText(/thoughts this month/)).toBeTruthy();
  });

  it("keeps zeros while the data is still loading", () => {
    mockListChronological.mockReturnValue(new Promise(() => {}));

    const { getByTestId, getByText } = render(<DigestCards />);

    expect(getByTestId("digest-weekly-count").props.children).toBe(0);
    expect(getByText("Weekly Wrap-up")).toBeTruthy();
  });
});
