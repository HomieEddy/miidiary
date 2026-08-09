import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { EntryDetailSheet } from "@/components/ui/EntryDetailSheet";
import type { EntryRecord } from "@/types/entry";

const mockEntry: EntryRecord = {
  id: "e1",
  text: "Hello world",
  category: "note",
  createdAt: "2026-08-09T10:00:00.000Z",
  updatedAt: "2026-08-09T10:00:00.000Z",
  title: "Hello",
  previewText: "Hello world",
  queryKey: "q1",
  isCompleted: false,
  isFavorite: false,
  dueDate: null,
  isUrgent: false,
  classificationConfidence: null,
  classificationRationale: null,
  classificationSource: null,
};

jest.mock("react-native-svg", () => ({
  SvgXml: "SvgXmlMock",
  __esModule: true,
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "Light", Medium: "Medium", Heavy: "Heavy" },
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockBottomSheetModal = React.forwardRef(
    (props: { children?: React.ReactNode }, ref: React.Ref<unknown>) => {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: jest.fn(),
        snapToIndex: jest.fn(),
        snapToPosition: jest.fn(),
        expand: jest.fn(),
        collapse: jest.fn(),
        close: jest.fn(),
      }));
      return React.createElement(View, null, props.children);
    },
  );
  MockBottomSheetModal.displayName = "BottomSheetModal";
  return {
    BottomSheetModal: MockBottomSheetModal,
    BottomSheetScrollView: (props: { children?: React.ReactNode }) =>
      React.createElement(View, null, props.children),
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

describe("EntryDetailSheet", () => {
  it("shows a save error and keeps the sheet in edit mode when onSave rejects", async () => {
    const onSave = jest.fn().mockRejectedValue(new Error("boom"));
    const { getByText } = render(
      <EntryDetailSheet
        entry={mockEntry}
        mode="edit"
        visible
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.press(getByText("sheet.save"));

    await waitFor(() => expect(getByText("sheet.saveFailed")).toBeTruthy());
    expect(onSave).toHaveBeenCalledTimes(1);

    // Still in edit mode: the save button and inputs remain present.
    expect(getByText("sheet.save")).toBeTruthy();
    expect(getByText("diary.cancel")).toBeTruthy();
  });

  it("calls onSave with the draft patch and shows no error on success", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByText, queryByText } = render(
      <EntryDetailSheet
        entry={mockEntry}
        mode="edit"
        visible
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    fireEvent.press(getByText("sheet.save"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ text: "Hello world", category: "note" }),
    );
    expect(queryByText("sheet.saveFailed")).toBeNull();
  });

  it("renders a favorite heart in view mode and toggles isFavorite through onSave", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText } = render(
      <EntryDetailSheet
        entry={{ ...mockEntry, isFavorite: false }}
        mode="view"
        visible
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    // Not a favorite yet: heart advertises "favorite".
    const heart = getByLabelText("sheet.favorite");
    fireEvent.press(heart);

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ isFavorite: true }));
  });

  it("advertises unfavorite when the entry is already a favorite", () => {
    const { getByLabelText } = render(
      <EntryDetailSheet
        entry={{ ...mockEntry, isFavorite: true }}
        mode="view"
        visible
        onClose={jest.fn()}
        onSave={jest.fn()}
      />,
    );

    getByLabelText("sheet.unfavorite");
  });

  it("renders due-date chips and includes the selected due date in the save patch", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByText } = render(
      <EntryDetailSheet
        entry={mockEntry}
        mode="edit"
        visible
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    expect(getByText("sheet.dueLabel")).toBeTruthy();
    expect(getByText("sheet.dueNone")).toBeTruthy();
    expect(getByText("sheet.dueToday")).toBeTruthy();
    expect(getByText("sheet.dueTomorrow")).toBeTruthy();
    expect(getByText("sheet.dueWeek")).toBeTruthy();

    fireEvent.press(getByText("sheet.dueTomorrow"));

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expectedDueDate = [
      tomorrow.getFullYear(),
      String(tomorrow.getMonth() + 1).padStart(2, "0"),
      String(tomorrow.getDate()).padStart(2, "0"),
    ].join("-");

    fireEvent.press(getByText("sheet.save"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ dueDate: expectedDueDate, isUrgent: false }),
    );
  });

  it("includes isUrgent in the save patch after toggling the urgent switch", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText } = render(
      <EntryDetailSheet
        entry={mockEntry}
        mode="edit"
        visible
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

    const urgentSwitch = getByLabelText("sheet.urgentLabel");
    fireEvent.press(urgentSwitch);
    fireEvent.press(getByLabelText("sheet.save"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ isUrgent: true }));
  });
});
