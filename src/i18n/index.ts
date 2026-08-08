import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import en from "@/i18n/locales/en.json";
import fr from "@/i18n/locales/fr.json";

export type AppLocale = "en" | "fr";

type StorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
};

const memoryStorage = new Map<string, string>();
let storage: StorageLike = {
  getString: (key) => memoryStorage.get(key),
  set: (key, value) => {
    memoryStorage.set(key, value);
  },
};

if (Platform.OS !== "web") {
  try {
    const mmkvModule = require("react-native-mmkv") as { createMMKV: (input: { id: string }) => StorageLike };
    storage = mmkvModule.createMMKV({ id: "locale" });
  } catch {
    // Jest/native fallback uses in-memory storage.
  }
}

const LOCALE_KEY = "app_locale";

export const i18n = new I18n({ en, fr });
i18n.enableFallback = true;
i18n.defaultLocale = "en";

function readStoredLocale(): AppLocale {
  const saved = storage.getString(LOCALE_KEY);
  if (saved === "fr" || saved === "en") {
    return saved;
  }

  try {
    const languageCode = getLocales()[0]?.languageCode ?? "en";
    return languageCode === "fr" ? "fr" : "en";
  } catch {
    // Jest / unsupported environments: default to English.
    return "en";
  }
}

// Module-level source of truth so every consumer re-renders on change.
const listeners = new Set<() => void>();
let cachedLocale: AppLocale = readStoredLocale();
i18n.locale = cachedLocale;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AppLocale {
  return cachedLocale;
}

function setLocale(locale: AppLocale): void {
  storage.set(LOCALE_KEY, locale);
  cachedLocale = locale;
  i18n.locale = locale;
  listeners.forEach((listener) => listener());
}

export function useLocale(): {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
} {
  const locale = useSyncExternalStore(subscribe, getSnapshot);

  const setLocaleValue = useCallback((next: AppLocale) => {
    setLocale(next);
  }, []);

  const t = useMemo(() => i18n.t.bind(i18n), []);

  return { locale, setLocale: setLocaleValue, t };
}
