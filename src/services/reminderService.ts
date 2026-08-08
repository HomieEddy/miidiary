import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export const REMINDER_IDENTIFIER = "daily-spark-reminder";

export interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const REMINDER_PRESETS: { labelKey: string; hour: number; minute: number }[] = [
  { labelKey: "reminders.presetMorning", hour: 9, minute: 0 },
  { labelKey: "reminders.presetMidday", hour: 12, minute: 30 },
  { labelKey: "reminders.presetEvening", hour: 19, minute: 0 },
];

const isSupported = Platform.OS !== "web";

if (isSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function enableDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isSupported) {
    return false;
  }

  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;

  if (status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== "granted") {
    return false;
  }

  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {
    // No scheduled reminder yet — ignore.
  });

  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_IDENTIFIER,
    content: {
      title: "Daily Spark",
      body: "What made you smile today? Take a moment to capture it.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  return true;
}

export async function disableDailyReminder(): Promise<void> {
  if (!isSupported) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {
    // No scheduled reminder — ignore.
  });
}

/** Restores reminder state from what the OS still has scheduled. */
export async function getScheduledReminder(): Promise<ReminderSettings | null> {
  if (!isSupported) {
    return null;
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminder = scheduled.find((item) => item.identifier === REMINDER_IDENTIFIER);

  if (!reminder?.trigger) {
    return null;
  }

  const trigger = reminder.trigger as { type?: string; hour?: number; minute?: number };
  if (trigger.hour === undefined || trigger.minute === undefined) {
    return null;
  }

  return { enabled: true, hour: trigger.hour, minute: trigger.minute };
}
