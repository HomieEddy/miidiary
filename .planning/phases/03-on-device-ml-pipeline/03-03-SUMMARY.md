---
phase: 03-on-device-ml-pipeline
plan: 03
summary_date: 2026-05-18
commits:
  - 508939e
  - 7380eaa
  - 6de8d95
requirements_covered: [TRAN-06, BACK-01, BACK-02]
status: partial
---

# Phase 3 Plan 03: Pipeline Orchestration Summary (Partial)

Started pipeline reliability hardening by tracking pending audio URIs through processing lifecycle boundaries.

## Completed Work

1. Added pending-processing URI tracking API on audio capture service.
2. Wired pending-processing registration at recording stop handoff.
3. Finalized pending-processing completion on both success and failure paths.
4. Added replay of pending recordings on app mount/resume pathway.
5. Added BackgroundFetch + TaskManager service wiring to run pending replay and model sync hooks.
6. Added AppState active-resume hook to replay pending recordings when app returns to foreground.
7. Added test coverage for pending-processing registration and background task behavior (including restricted and idempotent registration paths).
8. Added background model download orchestration for missing Whisper binaries using modern `File.downloadFileAsync` fallback paths.
9. Added dedicated model manager tests covering resolve, download sync, and failure fallback behavior.
10. Added a WER-based transcription validation harness for EN/FR acceptance scoring (`TRAN-04`, `TRAN-05` measurement tooling).

## Key Files

- src/services/audioCaptureService.ts
- src/hooks/useAudioCapture.ts
- src/hooks/useTranscription.ts
- src/screens/HomeScreen.tsx
- src/services/backgroundTaskService.ts
- src/services/modelManager.ts
- src/services/transcriptionValidationService.ts
- src/tests/useAudioCapture.test.ts
- src/tests/useTranscription.test.ts
- src/tests/backgroundTaskService.test.ts
- src/tests/modelManager.test.ts
- src/tests/transcriptionValidationService.test.ts

## Verification

Command:

npm run test -- src/tests/backgroundTaskService.test.ts src/tests/useTranscription.test.ts src/tests/useAudioCapture.test.ts src/tests/transcriptionService.test.ts src/tests/classificationService.test.ts -i
npm run test -- src/tests/backgroundTaskService.test.ts src/tests/useTranscription.test.ts src/tests/useAudioCapture.test.ts -i
npm run test -- src/tests/modelManager.test.ts src/tests/backgroundTaskService.test.ts src/tests/transcriptionService.test.ts src/tests/useTranscription.test.ts -i
npm run test -- src/tests/transcriptionValidationService.test.ts src/tests/modelManager.test.ts src/tests/backgroundTaskService.test.ts -i

Result:

- 5 test suites passed
- 25 tests passed
- 3 test suites passed
- 18 tests passed
- 4 test suites passed
- 21 tests passed
- 3 test suites passed
- 12 tests passed

## Remaining Work

- Complete terminal cleanup/retention policy for pending processing set.
- Add on-device E2E validation for background fetch execution windows and interruption-resume behavior.
- Add download integrity checks (checksum/versioning) for model binaries.
