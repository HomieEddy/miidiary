import { Platform } from "react-native";

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
    const mmkvModule = require("react-native-mmkv") as {
      createMMKV: (input: { id: string }) => StorageLike;
    };
    storage = mmkvModule.createMMKV({ id: "app" });
  } catch {
    // Jest/native fallback uses in-memory storage.
  }
}

/** Simple string-keyed app preferences (onboarding flag, recent searches). */
export function getPref(key: string): string | undefined {
  return storage.getString(key);
}

export function setPref(key: string, value: string): void {
  storage.set(key, value);
}
