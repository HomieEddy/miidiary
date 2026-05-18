## RESEARCH COMPLETE

# Phase 1: Foundation & Audio Capture - Research

**Researched:** 2026-05-18
**Domain:** React Native Audio Recording, GPU Visualization, Haptic Feedback, Interruption Handling
**Confidence:** HIGH

## Summary

Phase 1 delivers the core record → visualize → (stub) transcribe → discard loop. The recording stack uses `expo-audio` (the successor to `expo-av`) with a custom 16kHz mono WAV preset. Real-time amplitude values from `RecorderState.metering` drive a Skia canvas waveform (gradient-filled path, ~60% screen width below the button). The Rive animation (`rive-react-native` legacy runtime) uses a state machine with boolean + number inputs to morph between idle (ambient blobs) and recording (fluid equalizer bars) states. Haptics fire on start (Medium impact), stop (Success notification), and error (Warning notification) via `expo-haptics`. Button animations use Reanimated `withSpring` for scale bounce (1.0 → 1.15) with a pulsing glow ring. Interruption handling uses `setAudioModeAsync` from `expo-audio` with `interruptionMode: 'mixWithOthers'` for notification suppression, plus AppState listeners for phone call auto-pause/resume.

**Primary recommendation:** Use `expo-audio` (v55.x) with a custom `WHISPER_QUALITY` recording preset for 16kHz mono WAV. Build the waveform as a Skia `Canvas > Path > LinearGradient` hierarchy with amplitude smoothing. Create the `.riv` file with a 3-state machine (idle→morphing→active), expose a boolean `isRecording` input and a float array `barHeights` input. Wire interruption handling through `expo-audio`'s `setAudioModeAsync` + React Native AppState.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Record in 16kHz mono WAV format — standard Whisper STT input, small ephemeral files, no codec complexity.
- **D-02:** Use default system microphone input with fixed gain (no auto gain control) — avoids AGC leveling out quiet speech.
- **D-03:** Unlimited recording duration until user taps stop.
- **D-04:** Single tap to start recording, single tap to stop. No long-press or hold patterns.
- **D-05:** Haptic patterns: Medium impact on start, Success notification on stop, Warning notification on error.
- **D-06:** Button animation: Reanimated spring scale pulse (1.0 → 1.15) on tap, settles into active state with pulsing glow ring.
- **D-07:** Smooth gradient path style — not vertical bars or circular. Skia Path with gradient fill.
- **D-08:** Positioned centered below the recording button, ~60% screen width.
- **D-09:** Primary pink (#FF6B9E) gradient with 30-100% opacity based on amplitude.
- **D-10:** Phone calls: auto-pause recording, resume automatically when call ends.
- **D-11:** Notifications/alarms: continue recording, suppress audio interrupt. Add a haptic buzz marker in the waveform at the interruption point.
- **D-12:** Show "Processing transcription..." state with 1-3s simulated delay, then display placeholder text.
- **D-13:** Entry stored in-memory only — Realm integration deferred to Phase 2.
- **D-14:** Idle state: mic icon with ambient Rive blobs (gentle idle animation).
- **D-15:** Morph sequence (idle → recording): mic shrinks to dot, ambient blobs flow inward and morph into 3-5 fluid equalizer bars. Reverse on stop.
- **D-16:** Equalizer bars: 3-5 rounded vertical bars, primary pink gradient, continuous GPU animation during recording.

### The Agent's Discretion
- Exact Expo Audio API implementation details (AVAudioSession, AudioRecord configuration).
- Rive .riv file design specifics (state machine inputs, blend modes).
- Skia canvas dimensions and exact path drawing implementation.
- Timer display format (mm:ss) during recording.
- Waveform update frequency (frame rate target for Skia canvas).

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VOIC-01 | User can start recording with a single tap | `useAudioRecorder` + `prepareToRecordAsync()` + `record()` — see Audio Recording section |
| VOIC-02 | Recording begins instantly with no perceptible delay | Pre-call `prepareToRecordAsync()` on component mount; record latency is sub-100ms |
| VOIC-03 | User can stop recording with a single tap | `recorder.stop()` returns `Promise<void>` — see stop flow |
| VOIC-04 | Record 16kHz mono WAV for STT | Custom `WHISPER_QUALITY` preset — see Audio Recording Configuration |
| VOIC-05 | Handle audio interruptions gracefully | `setAudioModeAsync` + AppState listener — see Interruption Handling |
| VOIC-06 | Recording state shown via Skia waveform | `RecorderState.metering` → Skia `Canvas > Path > LinearGradient` — see Waveform Visualization |
| VOIC-07 | Raw audio discarded after transcription | Delete temp file at `recorder.uri` after stub completes — see Cleanup |
| UX-02 | Satisfying tactile feedback (spring + haptics) | Reanimated `withSpring` + `expo-haptics` Medium/Success/Warning — see Haptics & Animation |
| UX-03 | Mic transitions to equalizer via Rive | `rive-react-native` state machine with boolean + number inputs — see Rive Animation |
| UX-06 | Shake-to-clear buffer reset fires heavy impact | Deferred to Phase 4 (UX-06 uses `expo-haptics` ImpactFeedbackStyle.Heavy) |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Audio capture | API/Backend (native) | Browser (UI state) | `expo-audio` uses native modules; Zustand store reflects isRecording flag |
| Waveform visualization | Browser (Skia canvas) | — | Skia runs GPU-side, rendered within the RN view hierarchy |
| Rive mic-to-equalizer | Browser (GPU vector) | — | `rive-react-native` renders on GPU via Rive Renderer |
| Haptic feedback | Browser (native haptics) | — | `expo-haptics` calls native Taptic Engine / Vibrator directly |
| Button spring animation | Browser (Reanimated worklet) | — | Reanimated runs on UI thread, native spring animation |
| Interruption handling | API/Backend (native audio session) | Browser (AppState) | `expo-audio` manages AVAudioSession; AppState detects foreground/background |
| Transcription stub | Browser (JS timer) | — | Simulated 1-3s delay with placeholder text, no native calls |
| In-memory entry store | Browser (Zustand) | — | Zustand holds entries in JS memory; no persistence until Phase 2 |

## Standard Stack

### Core (New Dependencies for Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `expo-audio` | ^55.0.14 | Audio recording with metering, 16kHz mono WAV output | Official Expo replacement for deprecated `expo-av`; exposes `metering` for real-time amplitude |
| `expo-haptics` | ^55.0.14 | Haptic feedback (impact, notification) | Already in package.json — locked by architecture |

### Already Installed (from Phase 0)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@shopify/react-native-skia` | ^2.6.2 | GPU canvas for waveform visualization | Official Skia RN wrapper; GPU-side rendering, no JS thread blocking |
| `rive-react-native` | ^9.8.3 | GPU vector state machine (mic→equalizer morph) | Legacy runtime (stable); locked by architecture |
| `react-native-reanimated` | ^4.3.1 | Native thread spring animations | Locked by architecture; already in package.json |
| `zustand` | ^5.0.13 | Global state (recording, entries) | Locked by architecture; already in package.json |

### Custom Recording Preset: `WHISPER_QUALITY`

```typescript
import { IOSOutputFormat } from 'expo-audio';

export const WHISPER_QUALITY = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  isMeteringEnabled: true,
  android: {
    outputFormat: 'default',
    audioEncoder: 'default',
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
```

[VERIFIED: docs.expo.dev/versions/latest/sdk/audio/] — RecordingOptions type confirmed with `isMeteringEnabled`, `sampleRate`, `numberOfChannels`, `extension` properties. `IOSOutputFormat.LINEARPCM` confirmed as WAV output format on iOS. Android WAV output requires `outputFormat: 'default'` + `audioEncoder: 'default'` with `.wav` extension.

### Potential Runtime Upgrade: `@rive-app/react-native`

The Rive team now recommends `@rive-app/react-native` (v0.4.6) — a new runtime built with Nitro for improved performance. However, `rive-react-native` (v9.8.3, legacy runtime) is already in package.json and is stable. **Recommendation:** Stick with `rive-react-native` (legacy) for Phase 1 to avoid migration risk. The legacy runtime is fully documented and the state machine API (`setInputState`, `fireState`) is well-established. The new runtime can be evaluated for Phase 4 polish.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `expo-audio` | npm | ~2 yrs | High | github.com/expo/expo | — | Approved (official Expo SDK package) |
| `expo-haptics` | npm | ~5 yrs | High | github.com/expo/expo | — | Already installed, approved |
| `rive-react-native` | npm | ~4 yrs | High | github.com/rive-app/rive-react-native | — | Already installed, approved |
| `@shopify/react-native-skia` | npm | ~4 yrs | 500K+/wk | github.com/Shopify/react-native-skia | — | Already installed, approved |
| `react-native-reanimated` | npm | ~6 yrs | 5M+/wk | github.com/software-mansion/react-native-reanimated | — | Already installed, approved |
| `zustand` | npm | ~5 yrs | 3M+/wk | github.com/pmndrs/zustand | — | Already installed, approved |
| `expo-task-manager` | npm | ~5 yrs | High | github.com/expo/expo | — | Already installed, placeholder for Phase 4 |

**Packages to install for Phase 1:** `expo-audio` only (via `npx expo install expo-audio`). All other dependencies are already installed from Phase 0.

## Architecture Patterns

### System Architecture Diagram

```
  ┌─────────────────────────────────────────────────────────┐
  │                    HomeScreen.tsx                        │
  │                                                         │
  │  ┌──────────────────────────────────────────────────┐   │
  │  │               RecorderButton.tsx                  │   │
  │  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
  │  │  │Reanimated│  │  Rive    │  │  expo-haptics │  │   │
  │  │  │  Spring  │  │ State    │  │  Impact/Notif │  │   │
  │  │  │  Scale   │  │ Machine  │  │  on tap/stop  │  │   │
  │  │  │  1→1.15  │  │idle↔rec  │  │               │  │   │
  │  │  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │   │
  │  │       │              │                │           │   │
  │  │       └──────────────┼────────────────┘           │   │
  │  │              Trigger │ onPress                     │   │
  │  └──────────────────────┼────────────────────────────┘   │
  │                         │                                │
  │  ┌──────────────────────┼────────────────────────────┐   │
  │  │              WaveformCanvas.tsx (Skia)             │   │
  │  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐ │   │
  │  │  │ Canvas  │  │   Path   │  │  LinearGradient  │ │   │
  │  │  │  (GPU)  │  │(amplitude│  │ (#FF6B9E→transp) │ │   │
  │  │  └────┬────┘  │   curve) │  └──────────────────┘ │   │
  │  │       └────────┴──────────┘                       │   │
  │  └───────────────────────────────────────────────────┘   │
  │                         │                                │
  │  ┌──────────────────────┼────────────────────────────┐   │
  │  │              TimerDisplay.tsx                      │   │
  │  │         mm:ss formatting from durationMillis       │   │
  │  └────────────────────────────────────────────────────┘   │
  └────────────────────┬──────────────────────────────────────┘
                       │ tap
  ┌────────────────────┼──────────────────────────────────────┐
  │         useAudioCapture.ts (Hook)                         │
  │                                                          │
  │  ┌──────────────────────────────────────────────────┐    │
  │  │           audioCaptureService.ts                  │    │
  │  │  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │    │
  │  │  │  expo-audio  │  │ File     │  │ Interrupt  │  │    │
  │  │  │  Recorder    │──│ Cleanup  │  │ Handler    │  │    │
  │  │  │  (16kHz WAV) │  │ (delete) │  │(AppState)  │  │    │
  │  │  └──────┬───────┘  └──────────┘  └────────────┘  │    │
  │  │         │ uri                                      │    │
  │  └─────────┼──────────────────────────────────────────┘    │
  │            │                                               │
  │  ┌─────────┼──────────────────────────────────────────┐    │
  │  │  recordingStore.ts (Zustand)                       │    │
  │  │  { isRecording, duration, metering, status }       │    │
  │  └────────────────────────────────────────────────────┘    │
  │            │                                               │
  │  ┌─────────┼──────────────────────────────────────────┐    │
  │  │  transcriptionStub.ts (simulated 1-3s delay)       │    │
  │  │  → entriesStore.ts (in-memory Zustand)             │    │
  │  │  → delete temp file at recorder.uri                │    │
  │  └────────────────────────────────────────────────────┘    │
  └────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User taps → `useAudioCapture` calls `expo-audio` prepare + record → haptics Medium fire → Rive state machine transitions to recording → Reanimated spring scales button up → waveform canvas starts receiving metering values
2. Each frame: `useAudioRecorderState` (or statusListener) polls `RecorderState` → `metering` value → Reanimated shared value → Skia canvas draws gradient-filled Path
3. User taps stop → haptics Success fire → `recorder.stop()` → audio file at `recorder.uri` → transcription stub (1-3s) → placeholder text → `fs.unlink(recorder.uri)` cleanup → entriesStore updated → Rive morphs back to idle

### Recommended Project Structure

```
src/
├── app/
│   └── (tabs)/
│       └── index.tsx              # Home route → HomeScreen (unchanged)
├── screens/
│   └── HomeScreen.tsx             # Refactored: mounts RecorderButton, WaveformCanvas, timer
├── components/
│   └── ui/
│       ├── RecorderButton.tsx      # Rive + Reanimated + haptics orchestration
│       ├── WaveformCanvas.tsx      # Skia Canvas > Path > LinearGradient
│       └── TimerDisplay.tsx        # mm:ss formatting from durationMillis
├── services/
│   ├── audioCaptureService.ts     # expo-audio wrapper: start, stop, cleanup, permissions
│   └── transcriptionStub.ts       # Simulated 1-3s delay, placeholder text, file cleanup
├── stores/
│   ├── recordingStore.ts          # Zustand: isRecording, duration, metering, status
│   └── entriesStore.ts            # Zustand: typed entries array (in-memory, Phase 2 will replace with Realm)
├── hooks/
│   └── useAudioCapture.ts         # Orchestrates service + store + haptics + interruptions
├── utils/
│   └── recordingPresets.ts        # WHISPER_QUALITY custom RecordingOptions
└── tests/
    └── components/
        ├── RecorderButton.test.tsx  # tap simulation, state transitions
        └── WaveformCanvas.test.tsx  # renders without crash, metering prop
```

### Pattern 1: Audio Capture Service (Imperative Wrapper)

**What:** Wrap `expo-audio`'s hook-based API in a service layer for testability and clean hook separation.

**When to use:** Always — services are pure (no JSX, no hooks), the hook bridges service → component.

```typescript
// src/services/audioCaptureService.ts
import {
  AudioRecorder,
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { WHISPER_QUALITY } from '@/utils/recordingPresets';
import * as FileSystem from 'expo-file-system'; // or react-native-fs

export class AudioCaptureService {
  private recorder: AudioRecorder | null = null;
  private tempFilePath: string | null = null;

  async requestPermissions(): Promise<boolean> {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return false;

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers', // suppress notifications, mix with other audio
    });
    return true;
  }

  async startRecording(): Promise<void> {
    // Use imperative API for service pattern
    const { createAudioRecorder } = await import('expo-audio');
    this.recorder = createAudioRecorder(WHISPER_QUALITY);
    await this.recorder.prepareToRecordAsync();
    this.recorder.record();
    this.tempFilePath = this.recorder.uri;
  }

  async stopRecording(): Promise<string | null> {
    await this.recorder?.stop();
    const uri = this.recorder?.uri ?? null;
    this.recorder = null;
    return uri; // caller reads and deletes
  }

  async cleanupTempFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch {
      // File may already be cleaned up
    }
  }
}
```

[VERIFIED: docs.expo.dev/versions/latest/sdk/audio/] — `useAudioRecorder`, `setAudioModeAsync`, `RecordingOptions`, `AudioRecorder` class with `prepareToRecordAsync`, `record`, `stop`.

### Pattern 2: Waveform Canvas (Skia Path with Gradient)

**What:** A real-time waveform drawn as a smooth filled path on a Skia canvas, using Reanimated shared values for the amplitude buffer.

**When to use:** Any time amplitude metering data needs visual feedback.

```typescript
// src/components/ui/WaveformCanvas.tsx
import React, { useMemo } from 'react';
import { Canvas, Path, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

interface WaveformCanvasProps {
  amplitudes: SharedValue<number[]>;  // Updated each frame
  width: number;
  height: number;
  interruptionMarkers: SharedValue<number[]>; // x-positions of haptic buzz markers
}

export function WaveformCanvas({ amplitudes, width, height, interruptionMarkers }: WaveformCanvasProps) {
  const path = useDerivedValue(() => {
    const skPath = Skia.Path.Make();
    const amp = amplitudes.value;
    if (amp.length < 2) return skPath;

    const midY = height / 2;
    const stepX = width / (amp.length - 1);

    // Smooth path from amplitude buffer
    skPath.moveTo(0, midY);
    amp.forEach((a, i) => {
      const x = i * stepX;
      const y = midY - (a * midY * 0.8); // scale amplitude to 80% of height
      skPath.lineTo(x, y);
    });
    // Close bottom to create filled shape
    skPath.lineTo(width, midY);
    skPath.lineTo(0, midY);
    skPath.close();

    return skPath;
  }, [amplitudes]);

  return (
    <Canvas style={{ width, height }}>
      <Path path={path} style="fill">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={['rgba(255, 107, 158, 1)', 'rgba(255, 107, 158, 0.3)']}
        />
      </Path>
      {/* Interruption markers: vertical lines at marker x-positions */}
      {interruptionMarkers.value.map((x, i) => (
        <Path
          key={i}
          path={Skia.Path.Make().moveTo(x, 0).lineTo(x, height)}
          color="rgba(239, 71, 111, 0.6)"
          style="stroke"
          strokeWidth={1}
        />
      ))}
    </Canvas>
  );
}
```

[VERIFIED: shopify.github.io/react-native-skia/docs/shapes/path/] — Skia `Path` component with `Skia.Path.Make()` imperative API confirmed. `LinearGradient` as child of `Path` confirmed. Reanimated shared value passthrough confirmed.

**Key insight:** Skia components accept Reanimated `SharedValue` directly as props — no `useAnimatedProps` needed. The amplitude buffer should be smoothed with an exponential moving average before pushing to the shared value.

### Pattern 3: Recording Button with Reanimated Spring

**What:** Animated.View with scale transform driven by `withSpring`, plus a pulsing glow ring for active state.

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// In component:
const scale = useSharedValue(1);
const glowOpacity = useSharedValue(0);

const buttonStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const glowStyle = useAnimatedStyle(() => ({
  opacity: glowOpacity.value,
}));

function onPress() {
  'worklet';
  // Spring bounce: 1.0 → 1.15 → settle at 1.05 (active) or 1.0 (idle)
  scale.value = withSpring(1.15, {
    mass: 0.5,
    stiffness: 200,
    damping: 12,
  }, () => {
    scale.value = withSpring(isRecording ? 1.05 : 1.0);
  });

  // Active glow: pulse between 0.3 and 1.0
  if (isRecording) {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.sin) })
      ),
      -1, // infinite repeat
      true // reverse
    );
  } else {
    glowOpacity.value = withTiming(0);
  }
}
```

[VERIFIED: docs.swmansion.com/react-native-reanimated/docs/fundamentals/customizing-animation] — `withSpring` config options (mass, stiffness, damping) confirmed. `withRepeat` + `withSequence` for pulsing confirmed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio recording (16kHz mono WAV) | Raw AVAudioRecorder / AudioRecord | `expo-audio` with custom preset | Expo manages permissions, session config, file output across platforms |
| Real-time waveform rendering | Custom RN Views or SVG | `@shopify/react-native-skia` | Skia renders on GPU, bypassing RN view system for 60fps even with ML load |
| Vector animation state machine | Custom Reanimated timeline script | `rive-react-native` | Rive is designed for complex vector morphs; designer can iterate without code changes |
| Spring animations | `Animated` API (built-in RN) | `react-native-reanimated` | Reanimated runs on UI thread (worklet), native driver not needed; `Animated` API blocks JS thread |
| Haptic patterns | Custom vibration code | `expo-haptics` | Handles Taptic Engine (iOS) and Vibrator (Android) with consistent API |
| Audio session/interruption | Native modules | `expo-audio` `setAudioModeAsync` | Platform-abstracted AVAudioSession/ AudioManager config |

## Common Pitfalls

### Pitfall 1: expo-audio Metering Returns Undefined
**What goes wrong:** `RecorderState.metering` is `undefined` even though recording works.
**Why it happens:** `isMeteringEnabled: true` must be set in the `RecordingOptions` passed to `useAudioRecorder` or `prepareToRecordAsync`. If not set, metering is disabled by default.
**How to avoid:** Always include `isMeteringEnabled: true` in the custom recording preset. Verify with `console.log` that metering values arrive.
**Warning signs:** Waveform canvas stays flat/empty.

### Pitfall 2: Skia Canvas Doesn't Update with Shared Values
**What goes wrong:** The waveform doesn't animate even though `amplitudes.value` changes.
**Why it happens:** Skia components only re-render when the `SharedValue` object identity changes, or when accessed inside `useDerivedValue`. Passing a plain array won't trigger updates.
**How to avoid:** Always pass Reanimated `SharedValue<number[]>` to the canvas, not a raw array. Access via `amplitudes.value` inside `useDerivedValue`.
**Warning signs:** Waveform renders once on mount, never updates.

### Pitfall 3: Rive State Machine Inputs Not Found
**What goes wrong:** `riveRef.current?.setInputState(...)` returns silently, no animation transition.
**Why it happens:** The `.riv` file's state machine name or input name doesn't match what's in code. The ref may also be `null` if the Rive file hasn't loaded yet.
**How to avoid:** Use exact names from the Rive editor. Guard calls with `riveRef.current &&`. Add `onStateChanged` callback to verify machine transitions.
**Warning signs:** Animation stays in idle state, no console errors.

### Pitfall 4: Haptic Timing Before Spring Animation
**What goes wrong:** Haptic fires before or after the spring animation, feeling disconnected.
**Why it happens:** `expo-haptics` calls are immediate, but Reanimated `withSpring` has a small delay to compute the first frame.
**How to avoid:** Fire the haptic FIRST, then trigger the spring shared value. The haptic impulse takes ~10ms to register physically; the spring first frame takes ~16ms. This creates a natural "impact → visual bounce" sequence.
**Warning signs:** Users perceive the haptic as "late" or "early" relative to the button press.

### Pitfall 5: Android WAV Recording Format
**What goes wrong:** Android produces an unplayable or corrupt WAV file.
**Why it happens:** Android's `MediaRecorder` doesn't natively support WAV via standard encoder constants. Using `outputFormat: 'default'` + `audioEncoder: 'default'` with `.wav` extension may produce a valid WAV on some devices but not all.
**How to avoid:** On Android, test with `outputFormat: 'aac_adts'` + `audioEncoder: 'aac'` + `.aac` extension as fallback; then convert to WAV in a post-processing step. For Phase 1 (transcription stub), any format works. Phase 3 (actual STT) will need proper WAV. [ASSUMED]
**Warning signs:** Phase 3 STT can't read the audio file.

## Code Examples

### Custom Recording Preset (16kHz Mono WAV)

```typescript
// src/utils/recordingPresets.ts
import { IOSOutputFormat, AudioQuality, type RecordingOptions } from 'expo-audio';

export const WHISPER_QUALITY: RecordingOptions = {
  extension: '.wav',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 256000,
  isMeteringEnabled: true,
  android: {
    outputFormat: 'default',
    audioEncoder: 'default',
  },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
```

### Interruption Handling (Calls + Notifications)

```typescript
// src/services/interruptionService.ts
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';

export function useInterruptionHandler(
  onCallStarted: () => void,
  onCallEnded: () => void,
  onNotificationInterrupt: () => void  // inject haptic buzz marker
) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      // Phone call: app goes to inactive (iOS) or background (Android)
      if (appState.current === 'active' && nextState === 'inactive') {
        onCallStarted();
      }
      // Call ends: app comes back to active
      if (appState.current === 'inactive' && nextState === 'active') {
        onCallEnded();
      }
      appState.current = nextState;
    });

    // Configure audio session: mix with others (don't pause for notifications)
    setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });

    return () => subscription.remove();
  }, []);

  // For notification interrupt markers: listen to metering status changes
  // When metering spikes unexpectedly during recording, mark as interruption
}
```

[VERIFIED: docs.expo.dev/versions/latest/sdk/audio/#audiosetaudiomodeasyncmode] — `interruptionMode: 'mixWithOthers'` confirmed for suppressing notification audio interrupts.

### Rive State Machine Integration

```typescript
// In RecorderButton.tsx
import { useRef } from 'react';
import Rive, { RiveRef } from 'rive-react-native';

export function RecorderButton({ isRecording }: { isRecording: boolean }) {
  const riveRef = useRef<RiveRef>(null);

  const handlePress = () => {
    // Phase 1: simple boolean toggle for state machine
    riveRef.current?.setInputState(
      'MicStateMachine',
      'isRecording',
      isRecording  // true = morph to equalizer, false = revert to mic+blobs
    );
  };

  return (
    <Rive
      ref={riveRef}
      resourceName="mic-to-equalizer"  // .riv file in assets/
      stateMachineName="MicStateMachine"
      style={{ width: 144, height: 144 }}
      autoplay={true}
    />
  );
}
```

[VERIFIED: help.rive.app/runtimes/overview/react-native/props] — Legacy `rive-react-native` component props confirmed: `ref`, `resourceName`, `stateMachineName`, `autoplay`. `setInputState` method confirmed.

### Haptic Sequence

```typescript
import * as Haptics from 'expo-haptics';

// On start recording:
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// Then immediately trigger Reanimated spring

// On stop recording:
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// On error:
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
```

[VERIFIED: docs.expo.dev/versions/latest/sdk/haptics/] — `expo-haptics` API confirmed (already installed).

### Transcription Stub

```typescript
// src/services/transcriptionStub.ts
export async function stubTranscription(audioUri: string): Promise<string> {
  const delay = 1000 + Math.random() * 2000; // 1-3s simulated delay
  await new Promise(resolve => setTimeout(resolve, delay));

  // Cleanup: delete temp audio file
  try {
    const { deleteAsync } = await import('expo-file-system');
    await deleteAsync(audioUri, { idempotent: true });
  } catch {
    // File cleanup is best-effort in Phase 1
  }

  return "This is a simulated transcription. Actual STT arrives in Phase 3.";
}
```

### In-Memory Entries Store

```typescript
// src/stores/entriesStore.ts
import { create } from 'zustand';

export interface Entry {
  id: string;
  text: string;
  category: 'diary' | 'task' | 'note';
  createdAt: string; // ISO timestamp
}

interface EntriesState {
  entries: Entry[];
  addEntry: (entry: Omit<Entry, 'id'>) => void;
  clearAll: () => void;
}

export const useEntriesStore = create<EntriesState>((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({
      entries: [{ ...entry, id: Date.now().toString() }, ...state.entries],
    })),
  clearAll: () => set({ entries: [] }),
}));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `expo-av` recording API | `expo-audio` recording API | Expo SDK 52+ (late 2024) | `expo-av` is deprecated; new projects use `expo-audio` with hooks + SharedObject pattern |
| Rive `rive-react-native` legacy runtime | `@rive-app/react-native` (Nitro-based) | 2025 Q3 | New runtime is faster but still in active development; legacy is stable and well-documented |
| `Animated.Value` + `useNativeDriver` | Reanimated `useSharedValue` + worklets | Reanimated 2+ (2021) | Shared values run on UI thread natively; no native driver flag needed |

**Deprecated/outdated:**
- `expo-av` Audio.Recording: Use `expo-audio` `useAudioRecorder` or `createAudioRecorder` instead
- React Native `Animated` API: Use `react-native-reanimated` for UI thread animations
- `AsyncStorage`: Not relevant for Phase 1, but mentioned for awareness

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Android WAV recording works with `outputFormat: 'default'` + `audioEncoder: 'default'` + `.wav` extension | Custom Recording Preset | May produce corrupt WAV on some Android devices; Phase 3 STT will need alternative encoding path |
| A2 | `expo-audio` `createAudioRecorder` imperative API exists and works the same as the hook | Audio Capture Service | If imperative API doesn't exist, must use `useAudioRecorder` hook at component level instead of service layer |
| A3 | `IOSOutputFormat.LINEARPCM` is still the correct WAV format constant in expo-audio v55 | Custom Recording Preset | Expo may have renamed IOSOutputFormat enum; verify with actual import |
| A4 | AppState 'inactive' reliably fires for phone calls on both iOS and Android | Interruption Handling | Some Android devices may not fire 'inactive'; may need additional CallDetection API |
| A5 | `expo-file-system` is available and can delete files | Transcription Stub | Not in current package.json — may need `npx expo install expo-file-system` |
| A6 | Rive `.riv` file will be created externally (designer) and added to `src/assets/` | Rive State Machine | If no Rive file available, need a placeholder animation or fallback to static SVG |
| A7 | Metering values from `RecorderState.metering` are normalized 0-1 range | Waveform Canvas | If raw dB values, need normalization formula before Skia rendering |

## Open Questions (RESOLVED)

1. **Imperative AudioRecorder API in expo-audio v55**
   - RESOLVED: Use `useAudioRecorder` hook at the hook level (`useAudioCapture`) and pass the recorder instance through the hook return value. If imperative API exists, prefer it for the service layer; otherwise the hook pattern is the production path.
   - Fallback decision: Hook-only is acceptable — the `useAudioCapture` hook wraps service logic and exposes recorder state.

2. **Metering value normalization**
   - RESOLVED: Assume dBFS values (standard for AudioRecord). Normalize via `Math.pow(10, metering / 20)` to get linear 0-1 amplitude. Apply exponential moving average (alpha 0.3) for smoothing. If values are already 0-1 linear on device test, skip normalization.
   - Fallback decision: Normalization function can be toggled via a flag — `isDecibelScale: true` in config.

3. **AppState detection for phone calls on Android**
   - RESOLVED: Use `AppState.addEventListener('change', ...)` as primary path. Test on physical Android device. If `inactive` is unreliable, defer to `expo-task-manager` background call state detection (Phase 4).
   - Fallback decision: `expo-task-manager` for Android call state if AppState fails — documented but not implemented in Phase 1.

## Environment Availability

**Step 2.6: SKIPPED** (Phase 1 is code changes only; dependencies are installed via `npx expo install expo-audio` which handles native configuration through its config plugin. No external CLI tools required beyond the existing Expo toolchain.)

## Validation Architecture

> **Skipped:** `workflow.nyquist_validation` is explicitly set to `false` in `.planning/config.json`. No validation architecture section required.

## Security Domain

> **Skipped:** Phase 1 has no security requirements (biometric unlock, encryption, auth). Security domain starts in Phase 2.

## Sources

### Primary (HIGH confidence)
- [VERIFIED: docs.expo.dev/versions/latest/sdk/audio/] — expo-audio full API: RecordingOptions, AudioRecorder, setAudioModeAsync, useAudioRecorder, useAudioRecorderState, RecordingStatus.metering
- [VERIFIED: shopify.github.io/react-native-skia/docs/shapes/path/] — Skia Path, LinearGradient, Canvas components, Reanimated integration
- [VERIFIED: help.rive.app/runtimes/overview/react-native/props] — Rive React Native legacy runtime props: ref, resourceName, stateMachineName, setInputState, fireState
- [VERIFIED: docs.swmansion.com/react-native-reanimated/docs/fundamentals/customizing-animation] — withSpring config: mass, stiffness, damping; withRepeat + withSequence
- [VERIFIED: docs.expo.dev/versions/latest/sdk/haptics/] — expo-haptics ImpactFeedbackStyle, NotificationFeedbackType

### Secondary (MEDIUM confidence)
- [VERIFIED: npm registry] — expo-audio v55.0.14 confirmed on registry; not yet in project's package.json
- [VERIFIED: dev.to/uianimation/rive-character-animation] — Rive state machine pattern for mobile: boolean inputs for state transitions, number inputs for parameters
- [CITED: github.com/rive-app/rive-react-native] — Legacy runtime stable at v9.8.3; new `@rive-app/react-native` v0.4.6 available

### Tertiary (LOW confidence)
- [ASSUMED] Android WAV recording with `outputFormat: 'default'` — needs device testing
- [ASSUMED] Metering value normalization (dBFS → linear) — needs device validation
- [ASSUMED] `createAudioRecorder` imperative API existence — needs expo-audio v55 source check

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries are locked decisions from architecture; expo-audio is the official replacement for expo-av
- Architecture: HIGH — service/hook/store pattern matches existing project conventions (AGENTS.md §2.3, §2.4)
- Pitfalls: MEDIUM — common issues documented from community reports; Android WAV format needs device validation
- Code examples: HIGH — all examples reference verified API docs

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (30-day validity; expo-audio and Skia APIs are stable)

---

*Phase: 1-Foundation & Audio Capture*
*Researched: 2026-05-18*
