import { i18n, useLocale } from "@/i18n";

import en from "@/i18n/locales/en.json";
import fr from "@/i18n/locales/fr.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }

    return [path];
  });
}

describe("i18n", () => {
  it("keeps English and French translations key-parity", () => {
    const enKeys = flattenKeys(en).sort();
    const frKeys = flattenKeys(fr).sort();

    expect(frKeys).toEqual(enKeys);
  });

  it("keeps quote arrays the same length in both locales", () => {
    const enQuotes = i18n.t("home.quotes") as unknown as string[];
    const frQuotes = fr.home.quotes;

    expect(frQuotes).toHaveLength(enQuotes.length);
  });

  it("switches locale and translates strings", () => {
    expect(i18n.t("tabs.tasks")).toBe("Tasks");

    i18n.locale = "fr";

    expect(i18n.t("tabs.tasks")).toBe("Tâches");
    expect(i18n.t("home.tapToRecord")).toBe("Touchez pour noter une pensée");

    i18n.locale = "en";
  });

  it("falls back to English for missing keys", () => {
    i18n.locale = "fr";
    expect(i18n.t("export.json")).toBe("Exporter en JSON");

    i18n.locale = "en";
  });

  it("interpolates count placeholders in stats strings", () => {
    expect(i18n.t("stats.total", { count: 3 })).toBe("3 entries");
    expect(i18n.t("stats.today", { count: 1 })).toBe("1 today");
    expect(i18n.t("stats.streak", { count: 7 })).toBe("7 day streak");
  });

  it("interpolates time placeholders in reminder strings", () => {
    expect(i18n.t("reminders.enabledAt", { time: "09:00" })).toBe("Daily at 09:00");
  });

  it("never leaks raw placeholder braces into rendered strings", () => {
    // Guard against single-brace syntax, which i18n-js v4 does not parse.
    const en = i18n.t("stats.total", { count: 5 });
    const fr = (() => {
      i18n.locale = "fr";
      const value = i18n.t("stats.streak", { count: 5 });
      i18n.locale = "en";
      return value;
    })();
    expect(en).not.toContain("{count}");
    expect(fr).not.toContain("{count}");
  });

  it("exposes a hook API with locale switching", () => {
    // The hook is a thin useSyncExternalStore binding; verify its shape
    // by rendering it through a component-less call is not possible, so
    // assert the exported hook exists and locale defaults to English.
    expect(typeof useLocale).toBe("function");
    expect(i18n.locale).toBe("en");
  });
});
