import { Platform } from "react-native";

const mockList = jest.fn();
const mockWrite = jest.fn();
const mockShare = jest.fn();
const mockPrintToFile = jest.fn();

jest.mock("@/services/entriesRepository", () => ({
  entriesRepository: { listChronological: (...args: unknown[]) => mockList(...args) },
}));

jest.mock("expo-file-system", () => ({
  Paths: { cache: { uri: "file:///cache" } },
  File: class {
    uri = "file:///cache/dear-diary-2026-01-01.json";
  },
  writeAsStringAsync: (...args: unknown[]) => mockWrite(...args),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: (...args: unknown[]) => mockShare(...args),
}));

jest.mock("expo-print", () => ({
  printToFileAsync: (...args: unknown[]) => mockPrintToFile(...args),
  printAsync: jest.fn(),
}));

import { exportJson, exportPdf } from "@/services/exportService";

const SAMPLE_ENTRIES = [
  {
    id: "entry-1",
    text: "Morning run by the river",
    title: "Morning run by the river",
    category: "diary",
    isCompleted: false,
    isFavorite: false,
    dueDate: null,
    isUrgent: false,
    createdAt: "2026-08-07T12:00:00.000Z",
    updatedAt: undefined,
  },
];

describe("exportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockList.mockResolvedValue(SAMPLE_ENTRIES);
  });

  it("exports entries as a shareable JSON file", async () => {
    await exportJson();

    expect(mockWrite).toHaveBeenCalledWith(
      expect.stringContaining(".json"),
      expect.stringContaining('"count": 1'),
    );
    expect(mockShare).toHaveBeenCalledWith(
      expect.stringContaining(".json"),
      expect.objectContaining({ mimeType: "application/json" }),
    );
  });

  it("exports a shareable PDF file", async () => {
    mockPrintToFile.mockResolvedValue({ uri: "file:///cache/dear-diary-2026-01-01.pdf" });

    await exportPdf();

    expect(mockPrintToFile).toHaveBeenCalledWith(
      expect.objectContaining({ html: expect.stringContaining("Morning run") }),
    );
    expect(mockShare).toHaveBeenCalledWith(
      expect.stringContaining(".pdf"),
      expect.objectContaining({ mimeType: "application/pdf" }),
    );
  });
});
