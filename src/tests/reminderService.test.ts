import { Platform } from "react-native";

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockSchedule = jest.fn();
const mockCancel = jest.fn();
const mockGetAll = jest.fn();

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissions(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissions(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockSchedule(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancel(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) => mockGetAll(...args),
  SchedulableTriggerInputTypes: { DAILY: "daily" },
}));

import {
  disableDailyReminder,
  enableDailyReminder,
  getScheduledReminder,
  REMINDER_IDENTIFIER,
} from "@/services/reminderService";

describe("reminderService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({ status: "granted" });
    mockGetAll.mockResolvedValue([]);
    mockCancel.mockResolvedValue(undefined);
  });

  it("schedules a daily trigger at the requested time", async () => {
    await enableDailyReminder(9, 30);

    expect(mockSchedule).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: REMINDER_IDENTIFIER,
        trigger: expect.objectContaining({ type: "daily", hour: 9, minute: 30 }),
      }),
    );
  });

  it("requests permission when not yet granted and bails if denied", async () => {
    mockGetPermissions.mockResolvedValue({ status: "undetermined" });
    mockRequestPermissions.mockResolvedValue({ status: "denied" });

    const enabled = await enableDailyReminder(9, 0);

    expect(mockRequestPermissions).toHaveBeenCalled();
    expect(enabled).toBe(false);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it("cancels the existing reminder before rescheduling", async () => {
    await enableDailyReminder(12, 30);
    await enableDailyReminder(19, 0);

    expect(mockCancel).toHaveBeenCalledWith(REMINDER_IDENTIFIER);
    expect(mockSchedule).toHaveBeenCalledTimes(2);
  });

  it("hydrates settings from the OS-scheduled reminder", async () => {
    mockGetAll.mockResolvedValue([
      {
        identifier: REMINDER_IDENTIFIER,
        trigger: { type: "daily", hour: 7, minute: 45 },
      },
    ]);

    const settings = await getScheduledReminder();

    expect(settings).toEqual({ enabled: true, hour: 7, minute: 45 });
  });

  it("returns null when nothing is scheduled", async () => {
    expect(await getScheduledReminder()).toBeNull();
  });

  it("disables by cancelling the reminder", async () => {
    await disableDailyReminder();

    expect(mockCancel).toHaveBeenCalledWith(REMINDER_IDENTIFIER);
  });
});
