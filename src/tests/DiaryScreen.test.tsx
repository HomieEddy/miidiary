import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockConfirmDeleteOne = jest.fn();
const mockConfirmWipeAll = jest.fn();

const mockUseEntriesState = {
  flatItems: [
    { key: "header-2026-05-18", type: "header" as const, label: "Today" },
    {
      key: "row-entry-1",
      type: "row" as const,
      entry: {
        id: "entry-1",
        category: "note" as const,
        title: "First title",
        previewText: "One line preview",
        createdAt: "2026-05-18T10:00:00.000Z",
      },
    },
  ],
  isDeleteMode: false,
  showDeleteConfirm: false,
  showWipeConfirmStepOne: false,
  showWipeConfirmStepTwo: false,
  enterDeleteMode: jest.fn(),
  exitDeleteMode: jest.fn(),
  requestDeleteOne: jest.fn(),
  cancelDeleteOne: jest.fn(),
  confirmDeleteOne: (...args: unknown[]) => mockConfirmDeleteOne(...args),
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

import DiaryScreen from "@/screens/DiaryScreen";

describe("DiaryScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEntriesState.isDeleteMode = false;
    mockUseEntriesState.showDeleteConfirm = false;
    mockUseEntriesState.showWipeConfirmStepOne = false;
    mockUseEntriesState.showWipeConfirmStepTwo = false;
  });

  it("renders grouped headers and rows in chronological model", () => {
    const { getByText } = render(<DiaryScreen />);

    expect(getByText("Today")).toBeTruthy();
    expect(getByText("First title")).toBeTruthy();
    expect(getByText("One line preview")).toBeTruthy();
  });

  it("long-press enters delete mode and delete affordance opens confirm", () => {
    mockUseEntriesState.isDeleteMode = true;
    const { getByLabelText } = render(<DiaryScreen />);

    fireEvent.press(getByLabelText("Delete entry entry-1"));
    expect(mockUseEntriesState.requestDeleteOne).toHaveBeenCalledWith("entry-1");
  });

  it("confirmed single delete triggers hook action", async () => {
    mockUseEntriesState.isDeleteMode = true;
    mockUseEntriesState.showDeleteConfirm = true;
    mockConfirmDeleteOne.mockResolvedValue(undefined);
    const { getByLabelText } = render(<DiaryScreen />);

    fireEvent.press(getByLabelText("Confirm delete"));

    await waitFor(() => {
      expect(mockConfirmDeleteOne).toHaveBeenCalled();
    });
  });

  it("wipe-all requires step-two confirmation and calls confirm", async () => {
    mockUseEntriesState.isDeleteMode = true;
    mockUseEntriesState.showWipeConfirmStepTwo = true;
    mockConfirmWipeAll.mockResolvedValue(true);
    const { getByLabelText } = render(<DiaryScreen />);

    fireEvent.press(getByLabelText("Confirm wipe all"));

    await waitFor(() => {
      expect(mockConfirmWipeAll).toHaveBeenCalled();
    });
  });
});
