import * as BackgroundTask from "expo-background-task";
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
    if (processors.processPendingRecordings) {
      await processors.processPendingRecordings();
    }

    if (processors.syncModels) {
      await processors.syncModels();
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
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

  const status = await BackgroundTask.getStatusAsync();
  if (status === BackgroundTask.BackgroundTaskStatus.Restricted) {
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TRANSCRIPTION_TASK);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(TRANSCRIPTION_TASK, {
      minimumInterval: 15,
    });
  }

  registered = true;
}

export async function unregisterBackgroundProcessing(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(TRANSCRIPTION_TASK);
  if (isRegistered) {
    await BackgroundTask.unregisterTaskAsync(TRANSCRIPTION_TASK);
  }
  registered = false;
}

export function __resetBackgroundTaskServiceForTests(): void {
  registered = false;
  processors = {};
}
