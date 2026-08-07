import { useCallback, useMemo, useSyncExternalStore } from "react";
import { Platform, useColorScheme } from "react-native";

type ThemeOverride = "system" | "dark" | "light";

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
    storage = mmkvModule.createMMKV({ id: "theme" });
  } catch {
    // Jest/native fallback uses in-memory storage.
  }
}

const THEME_KEY = "theme_override";

function readStoredOverride(): ThemeOverride {
  const saved = storage.getString(THEME_KEY);
  if (saved === "dark" || saved === "light" || saved === "system") {
    return saved;
  }
  return "system";
}

// Single module-level source of truth so every useTheme() consumer
// (root layout, settings screens) shares the same override state.
const listeners = new Set<() => void>();
let cachedOverride: ThemeOverride = readStoredOverride();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeOverride {
  return cachedOverride;
}

function setOverride(mode: ThemeOverride): void {
  storage.set(THEME_KEY, mode);
  cachedOverride = mode;
  listeners.forEach((listener) => listener());
}

export function useTheme(): {
  isDark: boolean;
  themeOverride: ThemeOverride;
  setThemeOverride: (mode: ThemeOverride) => void;
} {
  const systemScheme = useColorScheme();
  const themeOverride = useSyncExternalStore(subscribe, getSnapshot);

  const setThemeOverride = useCallback((mode: ThemeOverride) => {
    setOverride(mode);
  }, []);

  const isDark = useMemo(() => {
    if (themeOverride === "dark") {
      return true;
    }

    if (themeOverride === "light") {
      return false;
    }

    return systemScheme === "dark";
  }, [systemScheme, themeOverride]);

  return {
    isDark,
    themeOverride,
    setThemeOverride,
  };
}
