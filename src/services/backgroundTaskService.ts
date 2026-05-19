import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

type BackgroundProcessors = {
  processPendingRecordings?: () => Promise<void>;
  syncModels?: () => Promise<boolean>;
};

const TRANSCRIPTION_TASK = "miidiary.background.transcription";

let registered = false;
let processors: BackgroundProcessors = {};

TaskManager.defineTask(TRANSCRIPTION_TASK, async () => {
  try {
    let hasNewData = false;

    if (processors.processPendingRecordings) {
      await processors.processPendingRecordings();
      hasNewData = true;
    }

    if (processors.syncModels) {
      const synced = await processors.syncModels();
      hasNewData = hasNewData || synced;
    }

    return hasNewData
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export function setBackgroundProcessors(next: BackgroundProcessors): void {
  processors = {
    ...processors,
    ...next,
  };
}

export async function initializeBackgroundProcessing(): Promise<void> {
  if (registered) {
    return;
  }

  const status = await BackgroundFetch.getStatusAsync();
  if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TRANSCRIPTION_TASK);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TRANSCRIPTION_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }

  registered = true;
}

export async function unregisterBackgroundProcessing(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TRANSCRIPTION_TASK);
  if (isRegistered) {
    await BackgroundFetch.unregisterTaskAsync(TRANSCRIPTION_TASK);
  }
  registered = false;
}

export function __resetBackgroundTaskServiceForTests(): void {
  registered = false;
  processors = {};
}
