import { classificationService } from "@/services/classificationService";

describe("classificationService", () => {
  it("classifies task-oriented text as task", async () => {
    const result = await classificationService.classifyEntry({
      text: "Need to call Alex tomorrow and schedule follow up",
    });

    expect(result.category).toBe("task");
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
    expect(result.source).toMatch(/model|heuristic/);
  });

  it("classifies reflective text as diary", async () => {
    const result = await classificationService.classifyEntry({
      text: "Today I felt grateful and reflected on what happened",
    });

    expect(result.category).toBe("diary");
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("falls back to note when no strong signal exists", async () => {
    const result = await classificationService.classifyEntry({
      text: "Short fragment",
    });

    expect(result.category).toBe("note");
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("uses heuristic fallback for empty text", async () => {
    const result = await classificationService.classifyEntry({ text: "   " });

    expect(result.category).toBe("note");
    expect(result.source).toBe("heuristic");
    expect(result.rationale).toContain("Fallback");
  });
});
