import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";

const mockToggleComplete = jest.fn();

const mockUseEntriesState = {
  entries: [
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
  ],
  loadEntries: jest.fn().mockResolvedValue(undefined),
  toggleComplete: (...args: unknown[]) => mockToggleComplete(...args),
};

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Medium: "medium" },
}));

jest.mock("@/hooks/useEntries", () => ({
  useEntries: () => mockUseEntriesState,
}));

jest.mock("expo-router", () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const ReactLocal = require("react");
    ReactLocal.useEffect(() => {
      return effect();
    }, []);
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
