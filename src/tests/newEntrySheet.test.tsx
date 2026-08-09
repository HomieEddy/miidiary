import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { NewEntrySheet } from "@/components/ui/NewEntrySheet";
import type { EntryRecord } from "@/types/entry";

const mockCreateEntry = jest.fn();
const mockOnClose = jest.fn();
const mockOnCreated = jest.fn();

const mockCreatedEntry: EntryRecord = {
  id: "entry-new-1",
  text: "Buy oat milk",
  category: "note",
  createdAt: "2026-08-09T10:00:00.000Z",
  updatedAt: "2026-08-09T10:00:00.000Z",
  title: "Buy oat milk",
  previewText: "Buy oat milk",
  queryKey: "note|entry-new-1",
  isCompleted: false,
  isFavorite: false,
  dueDate: null,
  isUrgent: false,
  classificationConfidence: null,
  classificationRationale: null,
  classificationSource: null,
};

jest.mock("@gorhom/bottom-sheet", () => {
  const ReactLocal = require("react");
  const { View } = require("react-native");
  const MockBottomSheetModal = ReactLocal.forwardRef(
    (props: { children?: React.ReactNode }, ref: React.Ref<unknown>) => {
      ReactLocal.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: jest.fn(),
        snapToIndex: jest.fn(),
        snapToPosition: jest.fn(),
        expand: jest.fn(),
        collapse: jest.fn(),
        close: jest.fn(),
      }));
      return ReactLocal.createElement(View, null, props.children);
    },
  );
  MockBottomSheetModal.displayName = "BottomSheetModal";
  return {
    BottomSheetModal: MockBottomSheetModal,
    BottomSheetScrollView: (props: { children?: React.ReactNode }) =>
      ReactLocal.createElement(View, null, props.children),
    BottomSheetBackdrop: () => null,
    __esModule: true,
  };
});

jest.mock("@/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key, locale: "en", setLocale: jest.fn() }),
  i18n: { t: (key: string) => key },
}));

jest.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ isDark: false }),
}));

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    createEntry: (...args: unknown[]) => mockCreateEntry(...args),
  },
}));

describe("NewEntrySheet", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateEntry.mockResolvedValue(mockCreatedEntry);
  });

  it("renders heading, text input, category pills and save button", () => {
    const { getByLabelText, getByTestId, getByText } = render(
      <NewEntrySheet visible onClose={mockOnClose} onCreated={mockOnCreated} />,
    );

    expect(getByText("sheet.newEntryTitle")).toBeTruthy();
    expect(getByLabelText("sheet.newEntryText")).toBeTruthy();
    expect(getByText("sheet.categoryDiary")).toBeTruthy();
    expect(getByText("sheet.categoryTask")).toBeTruthy();
    expect(getByText("sheet.categoryNote")).toBeTruthy();
    expect(getByTestId("new-entry-save-btn")).toBeTruthy();
  });

  it("saves text with the default note category and closes via onCreated", async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <NewEntrySheet visible onClose={mockOnClose} onCreated={mockOnCreated} />,
    );

    fireEvent.changeText(getByPlaceholderText("sheet.newEntryText"), "Buy oat milk");
    fireEvent.press(getByTestId("new-entry-save-btn"));

    await waitFor(() => {
      expect(mockCreateEntry).toHaveBeenCalledWith({ text: "Buy oat milk", category: "note" });
      expect(mockOnCreated).toHaveBeenCalledWith(mockCreatedEntry);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("uses the selected category pill when saving", async () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <NewEntrySheet visible onClose={mockOnClose} onCreated={mockOnCreated} />,
    );

    fireEvent.changeText(getByPlaceholderText("sheet.newEntryText"), "Water the plants");
    fireEvent.press(getByText("sheet.categoryTask"));
    fireEvent.press(getByTestId("new-entry-save-btn"));

    await waitFor(() => {
      expect(mockCreateEntry).toHaveBeenCalledWith({ text: "Water the plants", category: "task" });
      expect(mockOnCreated).toHaveBeenCalledWith(mockCreatedEntry);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("disables the save button while saving", async () => {
    let releaseCreate: ((entry: EntryRecord) => void) | undefined;
    mockCreateEntry.mockImplementation(
      () =>
        new Promise<EntryRecord>((resolve) => {
          releaseCreate = resolve;
        }),
    );

    const { getByPlaceholderText, getByTestId } = render(
      <NewEntrySheet visible onClose={mockOnClose} onCreated={mockOnCreated} />,
    );

    fireEvent.changeText(getByPlaceholderText("sheet.newEntryText"), "Slow save");
    fireEvent.press(getByTestId("new-entry-save-btn"));

    await waitFor(() => {
      expect(getByTestId("new-entry-save-btn").props.accessibilityState).toMatchObject({
        busy: true,
        disabled: true,
      });
    });

    releaseCreate?.(mockCreatedEntry);

    await waitFor(() => {
      expect(mockOnCreated).toHaveBeenCalledWith(mockCreatedEntry);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("shows a save error and keeps the sheet open when createEntry rejects", async () => {
    mockCreateEntry.mockRejectedValue(new Error("boom"));
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <NewEntrySheet visible onClose={mockOnClose} onCreated={mockOnCreated} />,
    );

    fireEvent.changeText(getByPlaceholderText("sheet.newEntryText"), "Doomed entry");
    fireEvent.press(getByTestId("new-entry-save-btn"));

    await waitFor(() => {
      expect(getByText("sheet.saveFailed")).toBeTruthy();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
