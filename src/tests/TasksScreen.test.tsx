import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

const mockToggleComplete = jest.fn();
const mockListChronological = jest.fn();

const mockEntries = [
  {
    id: "task-1",
    text: "Buy milk",
    category: "task" as const,
    createdAt: "2026-05-20T12:00:00.000Z",
    updatedAt: "2026-05-20T12:00:00.000Z",
    title: "Buy milk",
    previewText: "Buy milk",
    queryKey: "task|1",
    isCompleted: false,
    isFavorite: false,
    dueDate: null,
    isUrgent: false,
    classificationConfidence: null,
    classificationRationale: null,
    classificationSource: null,
  },
];

/** Local yyyy-mm-dd for today + offsetDays (matches the repository's dueDate format). */
function localYmd(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Medium: "medium" },
}));

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    listChronological: (...args: unknown[]) => mockListChronological(...args),
    toggleComplete: (...args: unknown[]) => mockToggleComplete(...args),
  },
}));

import TasksScreen from "@/screens/TasksScreen";

describe("TasksScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListChronological.mockResolvedValue(mockEntries);
    mockToggleComplete.mockResolvedValue(undefined);
  });

  it("renders task card and toggles completion", async () => {
    const { getByLabelText, getAllByText } = render(<TasksScreen />);

    await waitFor(() => {
      expect(getAllByText("Buy milk").length).toBeGreaterThan(0);
    });

    fireEvent.press(getByLabelText("Toggle task task-1"));
    expect(mockToggleComplete).toHaveBeenCalledWith("task-1");
  });

  it("renders urgent chip and due label from fixture fields", async () => {
    const urgentDueEntry = {
      ...mockEntries[0],
      id: "task-2",
      title: "File taxes",
      previewText: "File taxes",
      text: "File taxes",
      queryKey: "task|2",
      isUrgent: true,
      dueDate: localYmd(0),
    };
    mockListChronological.mockResolvedValue([...mockEntries, urgentDueEntry]);

    const { getAllByText } = render(<TasksScreen />);

    await waitFor(() => {
      expect(getAllByText("Urgent").length).toBeGreaterThan(0);
      expect(getAllByText("Due today").length).toBeGreaterThan(0);
    });
  });
});
