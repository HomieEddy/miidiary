import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";

const mockConfirmWipeAll = jest.fn();

const mockUseEntriesState = {
  showWipeConfirmStepOne: false,
  showWipeConfirmStepTwo: false,
  requestWipeAll: jest.fn(),
  cancelWipeAll: jest.fn(),
  continueWipeAll: jest.fn(),
  confirmWipeAll: (...args: unknown[]) => mockConfirmWipeAll(...args),
};

jest.mock("@/hooks/useEntries", () => ({
  useEntries: () => mockUseEntriesState,
}));

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: {
    listChronological: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("expo-sharing", () => ({ isAvailableAsync: jest.fn() }));
jest.mock("expo-print", () => ({ printAsync: jest.fn(), printToFileAsync: jest.fn() }));
jest.mock("expo-file-system", () => ({
  Paths: { cache: { uri: "file:///cache" } },
  File: class {
    uri = "file:///cache/export.json";
  },
  writeAsStringAsync: jest.fn(),
}));
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue(undefined),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

import DigestsScreen from "@/screens/DigestsScreen";

describe("DigestsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEntriesState.showWipeConfirmStepOne = false;
    mockUseEntriesState.showWipeConfirmStepTwo = false;
  });

  it("shows settings wipe-all entry point", () => {
    const { getByLabelText } = render(<DigestsScreen />);

    fireEvent.press(getByLabelText("Open wipe all from settings"));
    expect(mockUseEntriesState.requestWipeAll).toHaveBeenCalled();
  });

  it("confirms wipe-all from settings step two", async () => {
    mockUseEntriesState.showWipeConfirmStepTwo = true;
    mockConfirmWipeAll.mockResolvedValue(true);

    const { getByLabelText } = render(<DigestsScreen />);
    fireEvent.press(getByLabelText("Confirm wipe all from settings"));

    await waitFor(() => {
      expect(mockConfirmWipeAll).toHaveBeenCalled();
    });
  });
});
