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
    classificationConfidence: null,
    classificationRationale: null,
    classificationSource: null,
  },
];

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

jest.mock("@shopify/flash-list", () => {
  const ReactLocal = require("react");
  const { View } = require("react-native");

  return {
    FlashList: ({ data, renderItem }: { data: unknown[]; renderItem: (props: { item: unknown }) => React.ReactNode }) => (
      <View>
        {data.map((item, index) => (
          <ReactLocal.Fragment key={index}>{renderItem({ item })}</ReactLocal.Fragment>
        ))}
      </View>
    ),
  };
});

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
});
