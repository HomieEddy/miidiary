import {
  calculateWer,
  evaluateAccuracy,
} from "@/services/transcriptionValidationService";

describe("transcriptionValidationService", () => {
  it("calculates zero WER for exact match", () => {
    expect(calculateWer("hello world", "hello world")).toBe(0);
  });

  it("calculates non-zero WER for substitution/deletion", () => {
    const wer = calculateWer("buy milk and eggs", "buy milk eggs");
    expect(wer).toBeGreaterThan(0);
  });

  it("evaluates EN and FR summary thresholds", () => {
    const summaries = evaluateAccuracy([
      {
        id: "en-1",
        language: "en",
        referenceText: "Buy groceries after work",
        transcribedText: "Buy groceries after work",
      },
      {
        id: "fr-1",
        language: "fr-CA",
        referenceText: "Je dois appeler ma mere ce soir",
        transcribedText: "Je dois appeler ma mere ce soir",
      },
    ]);

    const enSummary = summaries.find((item) => item.language === "en");
    const frSummary = summaries.find((item) => item.language === "fr-CA");

    expect(enSummary?.passed).toBe(true);
    expect(frSummary?.passed).toBe(true);
  });
});
