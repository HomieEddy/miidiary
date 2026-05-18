---
phase: 1
plan: 01-03
subsystem: Audio Capture Pipeline
tags: [hooks, ui-components, orchestration, pipeline]
provides:
  - useAudioCapture — central recording orchestrator hook
  - useTranscription — transcription + entry creation hook
  - ProcessingState — animated processing indicator
  - TranscriptionResult — card with fade-in/out transcription display
  - ErrorBanner — slide-in error alert with retry
  - HomeScreen refactor — full record→visualize→transcribe→discard loop
requires:
  - recordingStore (Zustand)
  - audioCaptureService (singleton)
  - transcriptionStub (placeholder STT)
  - entriesStore (Zustand)
  - WaveformCanvas, GlowRing, RecorderButton, RecordingTimer, PromptText
affects: HomeScreen, Phase 3 (Shake-to-clear activation)
tech-stack:
  added:
    - Reanimated shared values (worklet-compatible amplitude buffer)
    - Expo Haptics (warning/notification feedback)
    - Reanimated spring + timing animations for card transitions
  patterns:
    - Orchestration hook pattern (hooks bridge UI ↔ services/stores)
    - Animated state components (opacity, translate, spring-in, fade-out)
    - Autodismiss + retry pattern for transient errors
key-files:
  created:
    - src/hooks/useAudioCapture.ts
    - src/hooks/useTranscription.ts
    - src/components/ui/ProcessingState.tsx
    - src/components/ui/TranscriptionResult.tsx
    - src/components/ui/ErrorBanner.tsx
    - src/theme/colors.ts (re-export)
  modified:
    - src/screens/HomeScreen.tsx (replaced entirely)
decisions:
  - useAudioCapture hook owns Reanimated shared value buffer (120 samples, 0.3 smoothing alpha)
  - useTranscription hook owns post-recording cleanup via audioCaptureService.getTempFilePath()
  - ErrorBanner auto-dismisses after 3s; press to retry clears error + triggers retry callback
  - TranscriptionResult shows for 4s then fades out and clears processing flag
  - UX-06 shake-to-clear stub added but inactive until Phase 3
duration: 8 min
completed: 2026-05-18
commits:
  - 4d31154 feat(audio-capture): create useAudioCapture and useTranscription hooks
  - f915c6d feat(components): add ProcessingState, TranscriptionResult, ErrorBanner UI components
  - 1f3042a feat(screens): refactor HomeScreen with full record→transcribe→discard pipeline
  - 93fcc9e chore(theme): add src/theme/colors.ts re-export for @/theme/colors import path
---

# Phase 1 Plan 03: Orchestration Hooks, State UI Components, HomeScreen Pipeline

Completed the core record → visualize → transcribe → discard loop by creating orchestration hooks, animated state UI components, and refactoring HomeScreen.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created src/theme/colors.ts re-export**
- **Found during:** Task 2 (ProcessingState creation)
- **Issue:** `@/theme/colors` import path resolves to `./src/theme/colors.ts` via tsconfig alias, but the canonical colors file lives at `theme/colors.ts` (project root). Import would fail at build time.
- **Fix:** Created `src/theme/colors.ts` as a re-export from `../../theme/colors.ts`. This follows AGENTS.md's expected `src/theme/` directory structure while resolving the alias mismatch.
- **Files modified:** `src/theme/colors.ts` (new)
- **Commit:** `93fcc9e`

## Requirements Fulfilled

| Requirement | Status |
|---|---|
| D-07: Real-time waveform visualization amplitude rendering | ✅ WaveformCanvas receives amplitudes from useAudioCapture |
| D-08: Waveform fills ~60% screen width | ✅ Handled by WaveformCanvas component |
| D-09: Gradient fill waveform | ✅ Handled by WaveformCanvas gradient path |
| D-11: Recording timer visible during recording | ✅ RecordingTimer component shown during recording |
| D-12: Audio cleanup after transcription | ✅ stubTranscription deletes file; useTranscription also cleans up temp path |
| VOIC-07: Ephemeral audio — no persistent files | ✅ Cleanup in both stubTranscription and useTranscription |

## Verification Results

All checks pass:

1. ✅ All 6 files exist (useAudioCapture.ts, useTranscription.ts, ProcessingState.tsx, TranscriptionResult.tsx, ErrorBanner.tsx, HomeScreen.tsx)
2. ✅ HomeScreen imports all 3 new state components + WaveformCanvas
3. ✅ HomeScreen uses both hooks (useAudioCapture, useTranscription)
4. ✅ Pipeline flow: stopRecording → processRecording chain verified
5. ✅ UX-06 shake-to-clear stub present (inactive)

## Key Design Decisions

- **useAudioCapture owns the SharedValue buffer** — 120-sample circular buffer with exponential smoothing (α=0.3) for clean waveform visualization. The Reanimated shared value is worklet-compatible and updated on the UI thread.
- **useTranscription separates concerns** — Post-recording processing (transcription → entry creation → cleanup) lives in a dedicated hook, keeping HomeScreen thin.
- **State UI components are animated** — ProcessingState fades, ErrorBanner slides in with spring easing, TranscriptionResult springs in and fades out after 4s. All use Reanimated worklet animations for 60fps.
- **HomeScreen is clean** — Down from 86 lines of inline logic to 59 lines of composed hooks + presentational components. No direct service calls remain.

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced.
