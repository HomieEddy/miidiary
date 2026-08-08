import type { ReactElement } from "react";
import { lazy, Suspense } from "react";

// Lazy so victory-native/Skia modules evaluate only after the web wasm
// runtime is ready (the Skia singleton captures CanvasKit at import time).
const StatsCard = lazy(() => import("@/components/ui/StatsCard"));

export function LazyStatsCard(): ReactElement {
  return (
    <Suspense fallback={null}>
      <StatsCard />
    </Suspense>
  );
}
