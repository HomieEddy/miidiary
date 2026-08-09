import { useLayoutEffect } from "react";
import { useStartProfiler } from "@shopify/react-native-performance";

/**
 * Start a Shopify performance-profiler flow for the current screen.
 *
 * The profiler state machine only seeds the app_boot flow for the first
 * screen that mounts a `PerformanceMeasureView`; every later screen must
 * announce its own navigation start or the render pass throws a
 * `ScreenProfilerNotStartedError` (logged, non-fatal).
 *
 * Uses `useLayoutEffect` because layout effects complete before any
 * passive effect — the child `PerformanceMeasureView` records its mount
 * in a passive effect, so the flow must exist by then.
 */
export function useScreenProfiler(source?: string): void {
  const startProfiler = useStartProfiler();

  useLayoutEffect(() => {
    startProfiler({ source });
  }, [startProfiler, source]);
}
