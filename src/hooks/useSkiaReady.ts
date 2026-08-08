import { useSyncExternalStore } from "react";
import { Platform } from "react-native";

/**
 * Web-only Skia runtime readiness. The Skia singleton captures
 * `global.CanvasKit` at module evaluation time, so any module importing
 * Skia (victory-native charts) must evaluate after LoadSkiaWeb resolves.
 * Consumers mount Skia-dependent components only when ready; native is
 * always ready.
 */
const listeners = new Set<() => void>();
let cachedReady = Platform.OS !== "web";

function notify(): void {
  cachedReady = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): boolean {
  return cachedReady;
}

export function useSkiaReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export async function ensureSkiaWeb(): Promise<void> {
  if (Platform.OS !== "web" || cachedReady) {
    return;
  }

  try {
    // canvaskit.wasm is served from public/ (see public/canvaskit.wasm).
    const { LoadSkiaWeb } = await import("@shopify/react-native-skia/lib/module/web");
    await LoadSkiaWeb({ locateFile: () => "canvaskit.wasm" });
  } catch {
    // Charts degrade gracefully if the wasm fails to load.
  } finally {
    notify();
  }
}
