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

  it("prefers diary over note on tie when first-person language is present", async () => {
    const result = await classificationService.classifyEntry({
      text: "I felt a strong idea about this concept today.",
    });

    expect(result.category).toBe("diary");
    expect(result.source).toBe("model");
    expect(result.rationale).toContain("tie-break");
  });

  it("prefers note over diary on tie when first-person language is absent", async () => {
    const result = await classificationService.classifyEntry({
      text: "Today the idea and concept happened during review.",
    });

    expect(result.category).toBe("note");
    expect(result.source).toBe("model");
    expect(result.rationale).toContain("tie-break");
  });

  it("prefers task when task ties with another category", async () => {
    const result = await classificationService.classifyEntry({
      text: "Need to call today because I felt pressure.",
    });

    expect(result.category).toBe("task");
    expect(result.source).toBe("model");
    expect(result.rationale).toContain("tie-break");
  });
});
