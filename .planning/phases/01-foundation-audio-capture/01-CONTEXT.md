# Phase 1: Foundation & Audio Capture - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the core record → visualize → (stub) transcribe → discard loop with haptic feedback. Users can tap a single button to start recording instantly, see real-time Skia waveform visualization, experience Rive mic-to-equalizer morphing animations, receive tactile haptic feedback, and have interruptions (calls, notifications) handled gracefully. Audio is ephemeral — raw files are discarded after the (stubbed) transcription step.

This phase does NOT include:
- Actual speech-to-text (Phase 3)
- Persistent storage (Phase 2)
- Entry browse/list (Phase 2)

Requirements: VOIC-01, VOIC-02, VOIC-03, VOIC-04, VOIC-05, VOIC-06, VOIC-07, UX-02, UX-03, UX-06

</domain>

<decisions>
## Implementation Decisions

### Audio Recording Configuration
- **D-01:** Record in 16kHz mono WAV format — standard Whisper STT input, small ephemeral files, no codec complexity.
- **D-02:** Use default system microphone input with fixed gain (no auto gain control) — avoids AGC leveling out quiet speech.
- **D-03:** Unlimited recording duration until user taps stop.

### Recording Interaction & Haptics
- **D-04:** Single tap to start recording, single tap to stop. No long-press or hold patterns.
- **D-05:** Haptic patterns: Medium impact on start, Success notification on stop, Warning notification on error.
- **D-06:** Button animation: Reanimated spring scale pulse (1.0 → 1.15) on tap, settles into active state with pulsing glow ring.

### Waveform Visualization (Skia)
- **D-07:** Smooth gradient path style — not vertical bars or circular. Skia Path with gradient fill.
- **D-08:** Positioned centered below the recording button, ~60% screen width.
- **D-09:** Primary pink (#FF6B9E) gradient with 30-100% opacity based on amplitude.

### Interruption Handling
- **D-10:** Phone calls: auto-pause recording, resume automatically when call ends.
- **D-11:** Notifications/alarms: continue recording, suppress audio interrupt. Add a haptic buzz marker in the waveform at the interruption point.

### Transcription Stub (Phase 1)
- **D-12:** Show "Processing transcription..." state with 1-3s simulated delay, then display placeholder text: "This is a simulated transcription. Actual STT arrives in Phase 3."
- **D-13:** Entry stored in-memory only — Realm integration deferred to Phase 2.

### Rive Mic-to-Equalizer Animation
- **D-14:** Idle state: mic icon with ambient Rive blobs (gentle idle animation).
- **D-15:** Morph sequence (idle → recording): mic shrinks to dot, ambient blobs flow inward and morph into 3-5 fluid equalizer bars. Reverse on stop.
- **D-16:** Equalizer bars: 3-5 rounded vertical bars, primary pink gradient, continuous GPU animation during recording.

### the agent's Discretion
- Exact Expo Audio API implementation details (AVAudioSession, AudioRecord configuration).
- Rive .riv file design specifics (state machine inputs, blend modes).
- Skia canvas dimensions and exact path drawing implementation.
- Timer display format (mm:ss) during recording.
- Waveform update frequency (frame rate target for Skia canvas).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Requirements
- `.planning/PROJECT.md` — Architecture lock table, key decisions, zero-cloud constraint
- `.planning/REQUIREMENTS.md` — VOIC-01 through VOIC-07, UX-02, UX-03, UX-06 definitions
- `.planning/ROADMAP.md` — Phase 1 success criteria, dependency on Phase 0
- `.planning/STATE.md` — Current project state and phase progress

### Design System
- `.planning/UI-SPEC.md` — Colors, typography, components, motion design system
- `theme/tailwind.config.js` — Color tokens, font families, border radii, shadows
- `theme/colors.ts` — Runtime color constants, category badge colors
- `theme/typography.ts` — Font family names and weight constants

### Reference UI
- `AGENTS.md` — Coding conventions (§2), architecture diagrams (§7), hard rules
- `ui-export-react/home.tsx` — Home screen reference layout with recording button placement

### Existing Code (Phase 0 deliverables)
- `src/app/(tabs)/index.tsx` — Home screen route (recording UI mounts here)
- `src/app/_layout.tsx` — Root layout with font loading, splash screen
- `src/screens/HomeScreen.tsx` — Home screen component (placeholder → recording UI)
- `src/assets/icons/solar.ts` — Solar SVG icon constants (for recording UI iconography)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `theme/tailwind.config.js` — Color tokens and font families ready for recording UI styling
- `src/assets/icons/solar.ts` — Icon constants for any non-Rive icon needs
- `src/app/(tabs)/index.tsx` — Home screen route where recording button lives
- `src/screens/HomeScreen.tsx` — Will be refactored from "Coming Soon" to recording UI

### Established Patterns
- NativeWind utility classes exclusively — no StyleSheet.create
- Zustand for global state, non-reactive isolates for live transcription
- Expo Router file-based navigation

### Integration Points
- Recording button mounts in `HomeScreen.tsx` (replaces placeholder)
- Waveform canvas renders in the same view, below the recording button
- Audio capture service lives in `src/services/audioCaptureService.ts`
- Recording state lives in `src/stores/recordingStore.ts` (Zustand slice)
- Recording hook lives in `src/hooks/useAudioCapture.ts`
- Rive animation renders via `@rive/react-native` — initially a simple state machine
- Incoming call handling hooks into system-level event listeners (expo-task-manager)
- Stub transcription output feeds into `src/stores/entriesStore.ts` (in-memory only)

</code_context>

<specifics>
## Specific Ideas

- Recording button should feel "satisfying" — spring scale + haptics + Rive morph is the key moment.
- Ambient blobs in idle state keep the home screen alive and invite interaction.
- Primary pink (#FF6B9E) is the recording theme color — keep it consistent across waveform, equalizer, glow ring.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation & Audio Capture*
*Context gathered: 2026-05-17*
