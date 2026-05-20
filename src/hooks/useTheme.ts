import { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

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

try {
  const mmkvModule = require("react-native-mmkv") as { createMMKV: (input: { id: string }) => StorageLike };
  storage = mmkvModule.createMMKV({ id: "theme" });
} catch {
  // Jest/web fallback uses in-memory storage.
}

const THEME_KEY = "theme_override";

export function useTheme(): {
  isDark: boolean;
  themeOverride: ThemeOverride;
  setThemeOverride: (mode: ThemeOverride) => void;
} {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverrideState] = useState<ThemeOverride>("system");

  useEffect(() => {
    const saved = storage.getString(THEME_KEY);
    if (saved === "dark" || saved === "light" || saved === "system") {
      setThemeOverrideState(saved);
    }
  }, []);

  const setThemeOverride = (mode: ThemeOverride): void => {
    storage.set(THEME_KEY, mode);
    setThemeOverrideState(mode);
  };

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
