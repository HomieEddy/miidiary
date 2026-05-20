const mockRegisterTaskAsync = jest.fn();
const mockUnregisterTaskAsync = jest.fn();
const mockGetStatusAsync = jest.fn();
const mockIsTaskRegisteredAsync = jest.fn();

const mockTaskHandlers = new Map<string, () => Promise<string>>();

jest.mock("expo-background-fetch", () => ({
  registerTaskAsync: (...args: unknown[]) => mockRegisterTaskAsync(...args),
  unregisterTaskAsync: (...args: unknown[]) => mockUnregisterTaskAsync(...args),
  getStatusAsync: (...args: unknown[]) => mockGetStatusAsync(...args),
  BackgroundFetchStatus: {
    Restricted: 1,
    Available: 2,
  },
  BackgroundFetchResult: {
    NoData: "no-data",
    NewData: "new-data",
    Failed: "failed",
  },
}));

jest.mock("expo-task-manager", () => ({
  defineTask: (name: string, handler: () => Promise<string>) => {
    mockTaskHandlers.set(name, handler);
  },
  isTaskRegisteredAsync: (...args: unknown[]) => mockIsTaskRegisteredAsync(...args),
}));

describe("backgroundTaskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskHandlers.clear();
    jest.resetModules();
  });

  function loadService() {
    return require("@/services/backgroundTaskService") as typeof import("@/services/backgroundTaskService");
  }

  it("registers background task when available", async () => {
    const service = loadService();
    mockGetStatusAsync.mockResolvedValue(2);
    mockIsTaskRegisteredAsync.mockResolvedValue(false);

    await service.initializeBackgroundProcessing();

    expect(mockRegisterTaskAsync).toHaveBeenCalledWith(
      "miidiary.background.transcription",
      expect.objectContaining({
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      }),
    );
  });

  it("does not register task when background fetch is restricted", async () => {
    const service = loadService();
    mockGetStatusAsync.mockResolvedValue(1);

    await service.initializeBackgroundProcessing();

    expect(mockRegisterTaskAsync).not.toHaveBeenCalled();
  });

  it("registers only once for repeated initialize calls", async () => {
    const service = loadService();
    mockGetStatusAsync.mockResolvedValue(2);
    mockIsTaskRegisteredAsync.mockResolvedValue(false);

    await service.initializeBackgroundProcessing();
    await service.initializeBackgroundProcessing();

    expect(mockRegisterTaskAsync).toHaveBeenCalledTimes(1);
  });

  it("returns NewData when pending recordings processor runs", async () => {
    const service = loadService();
    const mockProcessPendingRecordings = jest.fn().mockResolvedValue(undefined);

    service.setBackgroundProcessors({ processPendingRecordings: mockProcessPendingRecordings });

    const task = mockTaskHandlers.get("miidiary.background.transcription");
    const result = await task?.();

    expect(mockProcessPendingRecordings).toHaveBeenCalled();
    expect(result).toBe("new-data");
  });

  it("returns Failed when processor throws", async () => {
    const service = loadService();
    service.setBackgroundProcessors({
      processPendingRecordings: jest.fn().mockRejectedValue(new Error("boom")),
    });

    const task = mockTaskHandlers.get("miidiary.background.transcription");
    const result = await task?.();

    expect(result).toBe("failed");
  });

  it("unregisters when task is registered", async () => {
    const service = loadService();
    mockIsTaskRegisteredAsync.mockResolvedValue(true);

    await service.unregisterBackgroundProcessing();

    expect(mockUnregisterTaskAsync).toHaveBeenCalledWith("miidiary.background.transcription");
  });
});
