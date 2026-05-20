import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockConfirmWipeAll = jest.fn();
const mockDeleteOne = jest.fn();
const mockUpdateEntry = jest.fn();

const mockUseEntriesState = {
  flatItems: [
    { key: "header-2026-05-18", type: "header" as const, label: "Today" },
    {
      key: "row-entry-1",
      type: "row" as const,
      entry: {
        id: "entry-1",
        text: "Some text",
        category: "note" as const,
        title: "First title",
        previewText: "One line preview",
        updatedAt: "2026-05-18T10:00:00.000Z",
        createdAt: "2026-05-18T10:00:00.000Z",
        queryKey: "note|entry-1",
        isCompleted: false,
        classificationConfidence: null,
        classificationRationale: null,
        classificationSource: null,
      },
    },
  ],
  searchQuery: "",
  setSearchQuery: jest.fn(),
  searchResults: null,
  showWipeConfirmStepOne: false,
  showWipeConfirmStepTwo: false,
  loadEntries: jest.fn().mockResolvedValue(undefined),
  toggleComplete: jest.fn(),
  requestWipeAll: jest.fn(),
  cancelWipeAll: jest.fn(),
  continueWipeAll: jest.fn(),
  confirmWipeAll: (...args: unknown[]) => mockConfirmWipeAll(...args),
};

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

jest.mock("@/hooks/useEntries", () => ({
  useEntries: () => mockUseEntriesState,
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const ReactLocal = require("react");
    ReactLocal.useEffect(() => {
      return effect();
    }, []);
  },
}));

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    deleteOne: (...args: unknown[]) => mockDeleteOne(...args),
    updateEntry: (...args: unknown[]) => mockUpdateEntry(...args),
  },
}));

import DiaryScreen from "@/screens/DiaryScreen";

describe("DiaryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEntriesState.showWipeConfirmStepOne = false;
    mockUseEntriesState.showWipeConfirmStepTwo = false;
  });

  it("renders grouped headers and rows in chronological model", async () => {
    const { getByText } = render(<DiaryScreen />);

    await waitFor(() => {
      expect(getByText("Today")).toBeTruthy();
      expect(getByText("First title")).toBeTruthy();
      expect(getByText("One line preview")).toBeTruthy();
    });
  });

  it("shows wipe-all trigger and calls hook request", () => {
    const { getByLabelText } = render(<DiaryScreen />);

    fireEvent.press(getByLabelText("Open wipe all"));
    expect(mockUseEntriesState.requestWipeAll).toHaveBeenCalled();
  });

  it("wipe-all requires step-two confirmation and calls confirm", async () => {
    mockUseEntriesState.showWipeConfirmStepTwo = true;
    mockConfirmWipeAll.mockResolvedValue(true);
    const { getByLabelText } = render(<DiaryScreen />);

    fireEvent.press(getByLabelText("Confirm wipe all"));

    await waitFor(() => {
      expect(mockConfirmWipeAll).toHaveBeenCalled();
    });
  });
});
