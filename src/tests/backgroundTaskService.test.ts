const mockRegisterTaskAsync = jest.fn();
const mockUnregisterTaskAsync = jest.fn();
const mockGetStatusAsync = jest.fn();
const mockIsTaskRegisteredAsync = jest.fn();

const mockTaskHandlers = new Map<string, () => Promise<number>>();

jest.mock("expo-background-task", () => ({
  registerTaskAsync: (...args: unknown[]) => mockRegisterTaskAsync(...args),
  unregisterTaskAsync: (...args: unknown[]) => mockUnregisterTaskAsync(...args),
  getStatusAsync: (...args: unknown[]) => mockGetStatusAsync(...args),
  BackgroundTaskStatus: {
    Restricted: 1,
    Available: 2,
  },
  BackgroundTaskResult: {
    Success: 1,
    Failed: 2,
  },
}));

jest.mock("expo-task-manager", () => ({
  defineTask: (name: string, handler: () => Promise<number>) => {
    mockTaskHandlers.set(name, handler);
  },
  isTaskRegisteredAsync: (...args: unknown[]) => mockIsTaskRegisteredAsync(...args),
}));

describe("backgroundTaskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsTaskRegisteredAsync.mockResolvedValue(false);
    mockGetStatusAsync.mockResolvedValue(2); // Available
    const service = require("@/services/backgroundTaskService") as typeof import("@/services/backgroundTaskService");
    service.__resetBackgroundTaskServiceForTests();
  });

  function loadService() {
    return require("@/services/backgroundTaskService") as typeof import("@/services/backgroundTaskService");
  }

  it("registers background task when available", async () => {
    const service = loadService();
    await service.initializeBackgroundProcessing();

    expect(mockRegisterTaskAsync).toHaveBeenCalledWith("miidiary.background.transcription", {
      minimumInterval: 15,
    });
  });

  it("does not register task when background processing is restricted", async () => {
    mockGetStatusAsync.mockResolvedValue(1); // Restricted
    const service = loadService();
    await service.initializeBackgroundProcessing();

    expect(mockRegisterTaskAsync).not.toHaveBeenCalled();
  });

  it("registers only once for repeated initialize calls", async () => {
    const service = loadService();
    await service.initializeBackgroundProcessing();
    await service.initializeBackgroundProcessing();

    expect(mockRegisterTaskAsync).toHaveBeenCalledTimes(1);
  });

  it("returns Success when pending recordings processor runs", async () => {
    const service = loadService();
    service.setBackgroundProcessors({ processPendingRecordings: async () => {} });
    await service.initializeBackgroundProcessing();

    const handler = mockTaskHandlers.get("miidiary.background.transcription");
    expect(handler).toBeDefined();
    await expect(handler?.()).resolves.toBe(1); // Success
  });

  it("returns Failed when processor throws", async () => {
    const service = loadService();
    service.setBackgroundProcessors({
      processPendingRecordings: async () => {
        throw new Error("boom");
      },
    });
    await service.initializeBackgroundProcessing();

    const handler = mockTaskHandlers.get("miidiary.background.transcription");
    await expect(handler?.()).resolves.toBe(2); // Failed
  });

  it("unregisters when task is registered", async () => {
    mockIsTaskRegisteredAsync.mockResolvedValue(true);
    const service = loadService();
    await service.unregisterBackgroundProcessing();

    expect(mockUnregisterTaskAsync).toHaveBeenCalledWith("miidiary.background.transcription");
  });
});
