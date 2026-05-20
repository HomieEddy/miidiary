export type AccuracyCase = {
  id: string;
  language: "en" | "fr-CA";
  referenceText: string;
  transcribedText: string;
};

export type AccuracySummary = {
  language: "en" | "fr-CA";
  averageWer: number;
  passed: boolean;
  caseCount: number;
};

const LANGUAGE_THRESHOLDS: Record<"en" | "fr-CA", number> = {
  en: 0.2,
  "fr-CA": 0.25,
};

function normalize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function levenshtein(a: string[], b: string[]): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    dp[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    dp[0][j] = j;
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

export function calculateWer(referenceText: string, transcribedText: string): number {
  const referenceTokens = normalize(referenceText);
  const transcribedTokens = normalize(transcribedText);

  if (referenceTokens.length === 0) {
    return transcribedTokens.length === 0 ? 0 : 1;
  }

  const distance = levenshtein(referenceTokens, transcribedTokens);
  return distance / referenceTokens.length;
}

export function evaluateAccuracy(cases: AccuracyCase[]): AccuracySummary[] {
  const byLanguage: Record<"en" | "fr-CA", AccuracyCase[]> = {
    en: [],
    "fr-CA": [],
  };

  for (const item of cases) {
    byLanguage[item.language].push(item);
  }

  const summaries: AccuracySummary[] = [];
  for (const language of ["en", "fr-CA"] as const) {
    const casesForLanguage = byLanguage[language];
    if (casesForLanguage.length === 0) {
      summaries.push({
        language,
        averageWer: 1,
        passed: false,
        caseCount: 0,
      });
      continue;
    }

    const totalWer = casesForLanguage.reduce((sum, current) => {
      return sum + calculateWer(current.referenceText, current.transcribedText);
    }, 0);
    const averageWer = totalWer / casesForLanguage.length;

    summaries.push({
      language,
      averageWer,
      passed: averageWer <= LANGUAGE_THRESHOLDS[language],
      caseCount: casesForLanguage.length,
    });
  }

  return summaries;
}
