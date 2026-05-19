---
phase: 03-on-device-ml-pipeline
reviewed: 2026-05-19T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - jest.config.js
  - package.json
  - src/components/ui/ProcessingState.tsx
  - src/hooks/useAudioCapture.ts
  - src/hooks/useTranscription.ts
  - src/models/EntryRealm.ts
  - src/services/audioCaptureService.ts
  - src/services/classificationService.ts
  - src/services/entriesRepository.ts
  - src/services/modelManager.ts
  - src/services/realmService.ts
  - src/services/transcriptionService.ts
  - src/stores/recordingStore.ts
  - src/tests/audioCaptureService.test.ts
  - src/tests/classificationService.test.ts
  - src/tests/transcriptionService.test.ts
  - src/tests/ui.test.tsx
  - src/tests/useAudioCapture.test.ts
  - src/tests/useTranscription.test.ts
  - src/types/entry.ts
findings:
  critical: 1
  warning: 4
  info: 2
  total: 7
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-05-19
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

Reviewed the exact Phase 3 file list provided. The main risk areas are temporary audio lifecycle handling, state consistency during recording failures, and Realm key mismatch recovery behavior. No direct injection/auth bypass vulnerabilities were found in this scope, but one privacy-sensitive issue was found where raw audio can persist after processing.

## Critical Issues

### CR-01: Temporary audio may be retained after processing

**File:** `src/hooks/useTranscription.ts:67`
**Issue:** Cleanup only runs when `tempPath !== audioUri`. In the normal flow, `tempPath` is often the same URI as the processed file, so cleanup is skipped and raw audio can remain on disk. This conflicts with the zero-retention expectation for raw recordings.

**Fix:** Always delete the processed file URI (or both paths when different) after successful processing.

```ts
const cleanupTargets = new Set<string>();
if (audioUri) cleanupTargets.add(audioUri);
const tempPath = audioCaptureService.getTempFilePath();
if (tempPath) cleanupTargets.add(tempPath);

for (const target of cleanupTargets) {
  await audioCaptureService.cleanupTempFile(target);
}
```

## Warnings

### WR-01: Failed stop can leave UI/store in recording state

**File:** `src/hooks/useAudioCapture.ts:75`
**Issue:** When `stopRecording()` returns `null`, the function sets an error and returns, but never calls `setRecording(false)`. If recording was active, UI/state can remain inconsistent.

**Fix:** Set recording false in the failure branch before returning.

```ts
if (!uri) {
  setRecording(false);
  setProcessing(false);
  setProcessingStage('idle');
  setError('Recording failed');
  return undefined;
}
```

### WR-02: Recorder/polling cleanup missing on stop failure path

**File:** `src/services/audioCaptureService.ts:83`
**Issue:** `stopRecording()` returns `null` in `catch`, but does not clear `pollingInterval` or reset `recorder`. This can leave a live interval and stale recorder reference after failure.

**Fix:** Reuse cleanup logic in `catch`.

```ts
async stopRecording(): Promise<string | null> {
  try {
    // existing success path
  } catch {
    await this.cleanupAfterError();
    return null;
  }
}
```

### WR-03: Realm key mismatch recovery can become unrecoverable loop

**File:** `src/services/realmService.ts:20`
**Issue:** On metadata/key mismatch, code resets keychain (`resetRealmKey`) and throws, but does not clear key metadata. Subsequent calls can keep failing with the same mismatch condition.

**Fix:** Clear both sides of key material/metadata atomically before throwing or regenerate immediately.

```ts
if ((metadata && !existingKey) || (!metadata && existingKey)) {
  await resetRealmKey();
  setRealmKeyMetadata(null);
  throw new Error('Realm key metadata mismatch');
}
```

### WR-04: Store transitions can produce impossible status combinations

**File:** `src/stores/recordingStore.ts:53`
**Issue:** `setPaused(false)` always sets status to `recording`, and `setProcessing(false)` always sets status to `idle`, regardless of whether recording is active. Independent setter calls can produce invalid state transitions.

**Fix:** Derive status from full state snapshot instead of single-flag toggles.

```ts
setPaused: (val) => set((state) => ({
  isPaused: val,
  status: val ? 'call-paused' : state.isRecording ? 'recording' : 'idle',
}));
```

## Info

### IN-01: Idle label in processing component is misleading

**File:** `src/components/ui/ProcessingState.tsx:20`
**Issue:** `idle` maps to `"Processing transcription..."`, which can display contradictory messaging during fast stage transitions.

**Fix:** Change idle label to neutral text (or hide text when stage is idle).

### IN-02: UI test name does not match assertion behavior

**File:** `src/tests/ui.test.tsx:108`
**Issue:** Test claims to verify `bg-background` class but only asserts `root` truthiness. This is a weak assertion and can hide style regressions.

**Fix:** Assert the intended class/prop explicitly (or rename test to reflect current behavior).

---

_Reviewed: 2026-05-19T00:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: standard_
