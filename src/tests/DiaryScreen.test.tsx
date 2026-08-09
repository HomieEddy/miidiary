import React from "react";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";

const mockConfirmWipeAll = jest.fn();
const mockDeleteOne = jest.fn();
const mockUpdateEntry = jest.fn();
const mockListChronological = jest.fn();

let mockUseEntriesOpts: { autoLoad?: boolean; category?: string } = {};

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
    isFavorite: false,
    dueDate: null,
    isUrgent: false,
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

jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheetModal: () => null,
  BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => children,
  BottomSheetBackdrop: () => null,
}));

jest.mock("@/hooks/useEntries", () => ({
  useEntries: (opts: { autoLoad?: boolean; category?: string }) => {
    mockUseEntriesOpts = opts;
    return mockUseEntriesState;
  },
}));

jest.mock("@/components/ui/NewEntrySheet", () => {
  const ReactLocal = require("react");
  const { View: RNView } = require("react-native");
  return {
    NewEntrySheet: (props: { visible?: boolean }) =>
      props.visible === false
        ? null
        : ReactLocal.createElement(RNView, { testID: "new-entry-sheet" }),
  };
});

jest.mock("expo-router", () => ({
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
    listChronological: (...args: unknown[]) => mockListChronological(...args),
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

  it("renders filter chips and switching calls listChronological with the chosen category", async () => {
    // Simulate the hook contract: reloading queries the repository with the
    // category option the screen fed into useEntries.
    mockUseEntriesState.loadEntries.mockImplementation(async () => {
      await mockListChronological(mockUseEntriesOpts.category);
    });

    const { getAllByText, getByText } = render(<DiaryScreen />);

    expect(getByText("All")).toBeTruthy();
    expect(getAllByText("Diary").length).toBeGreaterThan(0);
    expect(getByText("Task")).toBeTruthy();
    expect(getAllByText("Note").length).toBeGreaterThan(0);

    fireEvent.press(getByText("Task"));

    expect(mockUseEntriesOpts.category).toBe("task");

    await act(async () => {
      await mockUseEntriesState.loadEntries();
    });

    expect(mockListChronological).toHaveBeenCalledWith("task");
  });

  it("opens the new entry sheet from the header button", () => {
    const { getByTestId, queryByTestId } = render(<DiaryScreen />);

    expect(queryByTestId("new-entry-sheet")).toBeNull();

    fireEvent.press(getByTestId("new-entry-btn"));

    expect(getByTestId("new-entry-sheet")).toBeTruthy();
  });
});
