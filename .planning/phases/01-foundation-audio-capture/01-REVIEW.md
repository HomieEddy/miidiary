---
phase: 01-foundation-audio-capture
reviewed: 2026-05-18T12:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/utils/recordingPresets.ts
  - src/services/audioCaptureService.ts
  - src/services/interruptionService.ts
  - src/stores/recordingStore.ts
  - src/components/ui/GlowRing.tsx
  - src/components/ui/RecorderButton.tsx
  - src/components/ui/RecordingTimer.tsx
  - src/components/ui/PromptText.tsx
  - src/screens/HomeScreen.tsx
  - src/utils/cn.ts
  - src/stores/entriesStore.ts
  - src/services/transcriptionStub.ts
  - src/components/ui/WaveformCanvas.tsx
  - src/hooks/useAudioCapture.ts
  - src/hooks/useTranscription.ts
  - src/components/ui/ProcessingState.tsx
  - src/components/ui/TranscriptionResult.tsx
  - src/components/ui/ErrorBanner.tsx
findings:
  critical: 2
  warning: 8
  info: 4
  total: 14
status: issues_found
---

# Phase 1: Foundation & Audio Capture — Code Review Report

**Reviewed:** 2026-05-18T12:00:00Z
**Depth:** Standard
**Files Reviewed:** 18
**Status:** Issues found (14 total — 2 critical, 8 warnings, 4 info)

## Summary

This review of 18 source files from the Phase 1 audio capture implementation found **2 critical state management bugs** that block the transcription flow entirely, plus several quality and convention violations. The audio service layer is generally well-structured, but the hook/store integration has two severe defects: (1) the success path of `processRecording` never resets the `isProcessing` flag, causing the app to hang permanently in a "processing" state, and (2) the error path immediately overrides the error status with `setProcessing(false)`, masking errors from the UI. The `RecordingTimer` has a wasteful 100ms interval thrash cycle from including `duration` in its effect dependency array. Several violations of AGENTS.md conventions (inline styles, hardcoded colors, commented-out code) were also found.

---

## Critical Issues

### CR-01: Missing `setProcessing(false)` in transcription success path — app stuck in "processing" state forever

**File:** `src/hooks/useTranscription.ts:29`
**Issue:** The `processRecording` function only calls `setProcessing(false)` inside the `catch` block (line 29). On success, `isProcessing` remains `true` permanently. This cascades:

1. `ProcessingState` on HomeScreen shows `visible={isProcessing && status !== 'recording'}` → `true && true` → `true` — displays "Processing transcription..." indefinitely.
2. `TranscriptionResult` receives `visible={!isRecording && !isProcessing && status === 'idle'}` → `true && false && false` → `false` — never shows.
3. `RecorderButton.handlePress` guards with `if (isProcessing) return;` — the user can never start a new recording.

The app enters a permanent deadlock after any successful transcription.

**Fix:** Call `setProcessing(false)` after `addEntry` succeeds in `processRecording`:

```typescript
// src/hooks/useTranscription.ts — lines 13-19
const text = await stubTranscription(audioUri);

addEntry({
  text,
  category: 'note',
  createdAt: new Date().toISOString(),
});

setProcessing(false);  // <-- ADD THIS: transition out of processing state
```

The `cleanupTempFile` block (lines 21-26) should be moved after `setProcessing(false)` or kept as-is since it's fire-and-forget.

---

### CR-02: `setProcessing(false)` in catch block immediately overrides error status, masking error banner

**File:** `src/hooks/useTranscription.ts:27-29`
**Issue:** In the catch block, `setError('Transcription failed')` sets `status` to `'error'`, but the subsequent `setProcessing(false)` on line 29 calls `set({ isProcessing: false, status: 'idle' })` which **overwrites** the error status back to `'idle'`. This means:

1. Store state after catch block: `errorMessage: 'Transcription failed'`, `status: 'idle'`, `isProcessing: false`.
2. HomeScreen renders `ErrorBanner` with `visible={status === 'error'}` → `false` → banner never shows.
3. The user receives no visual feedback that transcription failed.

**Fix:** Reorder the calls so `setProcessing(false)` doesn't mask the error, or add a guard in `setProcessing` in the store:

```typescript
// Fix option A: reorder and keep error status last
try {
  // ...
} catch (err) {
  setProcessing(false);
  setError('Transcription failed');  // Error set last — status = 'error' wins
}
```

```typescript
// Fix option B: make setProcessing not override error status
// In recordingStore.ts
setProcessing: (val) => set((state) => ({
  isProcessing: val,
  status: val ? 'processing' : (state.status === 'error' ? 'error' : 'idle'),
})),
```

---

## Warnings

### WR-01: Timer thrashing in RecordingTimer — interval destroyed and recreated every 100ms

**File:** `src/components/ui/RecordingTimer.tsx:42`
**Issue:** The `useEffect` deps array is `[isRecording, isPaused, duration]`. Every 100ms the interval fires, calls `setDuration(elapsed)` via the store, which updates `duration`, triggers a re-render, runs the effect cleanup (clearing the current interval), and creates a new interval. This creates 10 unnecessary destroy/create cycles per second. The `duration` dependency also makes `startTime` drift slightly on each cycle.

```typescript
useEffect(() => {
    if (isRecording && !isPaused) {
      const startTime = Date.now() - duration;  // uses dep, but it's always current
      intervalRef.current = setInterval(() => {
        // ...
      }, 100);
    }
    // ...
  }, [isRecording, isPaused, duration]);  // duration churns every 100ms
```

**Fix:** Remove `duration` from deps. Use a ref to track the actual start time:

```typescript
const startTimeRef = useRef(0);

useEffect(() => {
  if (isRecording && !isPaused) {
    const now = Date.now();
    const currentDuration = useRecordingStore.getState().duration;
    startTimeRef.current = now - currentDuration;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      useRecordingStore.getState().setDuration(elapsed);
    }, 100);
  } else if (!isRecording) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    useRecordingStore.getState().setDuration(0);
  }
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [isRecording, isPaused]);  // no duration dependency
```

---

### WR-02: Inline style on Rive component — violates AGENTS.md "NO inline styles"

**File:** `src/components/ui/RecorderButton.tsx:86`
**Issue:** AGENTS.md §2.4 explicitly states: "NO inline styles — use NativeWind className exclusively." The Rive component uses `style={{ width: 144, height: 144 }}` instead of NativeWind classes.

**Fix:** Apply dimensions via NativeWind className on the wrapping `Animated.View` or use `className="w-[144px] h-[144px]"` on the Rive element. NativeWind's arbitrary value syntax supports this.

---

### WR-03: Hardcoded color `#FF6B9E` instead of theme token

**File:** `src/components/ui/RecorderButton.tsx:95`
**Issue:** The SVG icon overlay uses `color="#FF6B9E"`. This duplicates the primary color value (`theme/colors.ts` line 4). If the theme color changes, this must be updated manually. Should reference `colors.primary`.

**Fix:** Import `colors` from theme and use `color={colors.primary}`:

```typescript
import { colors } from '@/theme/colors';
// ...
<SvgXml xml={isRecording ? RECORDING_ICON : IDLE_ICON} width={72} height={72} color={colors.primary} />
```

---

### WR-04: Identical ternary branches in RecordingTimer — dead code

**File:** `src/components/ui/RecordingTimer.tsx:63`
**Issue:** Both branches produce identical output: `{isPaused ? formatTime(duration) : formatTime(duration)}`. The `isPaused` state has no visual effect on the rendered time text. This suggests a missed conditional rendering path (e.g., showing a pause icon or dimmed text when paused).

**Fix:** Use a single formatTime call, or add distinct visual treatment for paused state:

```typescript
<Text className={`font-sans text-4xl font-bold text-center tracking-wider ${isPaused ? 'text-muted-foreground' : 'text-foreground'}`}>
  {formatTime(duration)}
</Text>
```

---

### WR-05: Invalid `interruptionMode` property for expo-audio's `setAudioModeAsync`

**Files:**
- `src/services/audioCaptureService.ts:31`
- `src/services/interruptionService.ts:14`

**Issue:** The `setAudioModeAsync` call uses `interruptionMode: 'mixWithOthers'`, but this is **not a valid property** in the expo-audio API. The correct parameters are `interruptionModeIOS: InterruptionModeIOS` and `interruptionModeAndroid: InterruptionModeAndroid`. The current call is silently ignored — interruption behavior is not being configured.

**Fix:**

```typescript
await setAudioModeAsync({
  allowsRecording: true,
  playsInSilentMode: true,
  interruptionModeIOS: 'mixWithOthers',       // or 'doNotMix' / 'duckOthers'
  interruptionModeAndroid: 'duckOthers',       // or 'doNotMix' / 'mixWithOthers'
});
```

Apply same fix in `interruptionService.ts`.

---

### WR-06: Commented-out code in HomeScreen — violates AGENTS.md

**File:** `src/screens/HomeScreen.tsx:73-79`
**Issue:** AGENTS.md §4.3: "NEVER commit commented-out code." A stub for the Phase 3 shake-to-clear feature is left as a commented-out `useEffect` block. This should use a feature flag, a conditional import, or at minimum a task tracker reference rather than committed commented code.

**Fix:** Remove the commented block. Track the feature in the project's issue tracker or ROADMAP.md. If a stub is needed, use a no-op export:

```typescript
// In a separate file: src/hooks/useShakeToClear.stub.ts
export function useShakeToClear() {} // No-op until Phase 3

// In HomeScreen:
import { useShakeToClear } from '@/hooks/useShakeToClear';
useShakeToClear();
```

---

### WR-07: Weak entry ID generation — collision-prone

**File:** `src/stores/entriesStore.ts:24`
**Issue:** Entry IDs are generated with `Date.now() + Math.random().toString(36).slice(2, 8)`. Two entries created within the same millisecond have a small but real collision probability (~1 in 2.8 billion per ms). For a local-only diary app this is low risk, but it's a latent bug that will manifest under rapid entry creation (e.g., test automation, rapid-fire recording).

**Fix:** Use `crypto.randomUUID()` which is available in React Native via the `crypto` polyfill in expo-modules-core:

```typescript
import { randomUUID } from 'expo-crypto';
// ...
id: randomUUID(),
```

---

### WR-08: Unused `setStatus` import in `useTranscription`

**File:** `src/hooks/useTranscription.ts:8`
**Issue:** The destructured `setStatus` from `useRecordingStore()` is never used in the hook body. It's dead code that creates a false expectation for readers.

**Fix:** Remove `setStatus` from the destructuring:

```typescript
const { setProcessing, setError } = useRecordingStore();
```

---

## Info

### IN-01: Magic number in WaveformCanvas amplitude scaling

**File:** `src/components/ui/WaveformCanvas.tsx:36`
**Issue:** The value `0.8` in `const y = midY - (amp[i] * midY * 0.8)` is a magic number controlling how much of the canvas height the waveform occupies. This should be a named constant.

**Fix:**

```typescript
const AMPLITUDE_SCALE = 0.8;
const y = midY - (amp[i] * midY * AMPLITUDE_SCALE);
```

---

### IN-02: Redundant `isRecording` guard in WaveformCanvas

**File:** `src/components/ui/WaveformCanvas.tsx:48`
**Issue:** `HomeScreen` already conditionally renders `<WaveformCanvas>` only when `isRecording` is true (`{isRecording && <WaveformCanvas .../>}`). WaveformCanvas's internal `if (!isRecording) return null;` check on line 48 is redundant. Not harmful, but adds unnecessary store subscription.

**Fix:** Remove the internal guard and the `useRecordingStore` import since the parent already gates rendering:

```typescript
// Remove the entire guard and the import
```

---

### IN-03: No cleanup on unmount for singleton metering callback

**File:** `src/hooks/useAudioCapture.ts:31-42`
**Issue:** When the component using `useAudioCapture` unmounts (e.g., navigation away), the singleton `audioCaptureService` still holds the `onMetering` callback that references the unmounted component's `amplitudes` SharedValue. If recording continues, the old SharedValue is updated unnecessarily. Adding an effect cleanup that clears the metering callback on unmount would prevent this.

**Fix:**

```typescript
useEffect(() => {
  return () => {
    audioCaptureService.onMetering(() => {});  // Replace with no-op
  };
}, []);
```

---

### IN-04: SVG warning icon path coordinates may exceed viewBox

**File:** `src/components/ui/ErrorBanner.tsx:13`
**Issue:** The warning triangle SVG path contains coordinates (20.418, 17.876, 15.013) that are near the boundary of the 24×24 viewBox. The path `l-8.938 15.013` produces Y coordinates exceeding the viewport. The icon may render with visible clipping or incorrect proportions. Consider verifying the icon renders correctly on device.

**Fix:** Replace with a properly bounded 24×24 warning triangle SVG, or test rendering on target devices.

---

_Reviewed: 2026-05-18T12:00:00Z_
_Reviewer: gsd-code-reviewer (standard depth)_
_Depth: standard_
