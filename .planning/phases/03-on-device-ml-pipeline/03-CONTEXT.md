# Phase 3: On-Device ML Pipeline - Context

**Gathered:** 2026-05-18
**Status:** Discussing

<domain>
## Phase Boundary

Implement on-device speech-to-text and auto-classification pipeline so recordings become categorized text entries fully offline.

This phase includes: Whisper STT integration, progress reporting, EN/FR-CA transcription behavior, on-device category classification (Diary/Task/Note), and orchestration from recording stop to persisted classified entry.

This phase does NOT include: advanced browse/edit/search (Phase 4), cloud services, or persistent raw audio storage.

Requirements: TRAN-01, TRAN-02, TRAN-03, TRAN-04, TRAN-05, TRAN-06, CLAS-01, CLAS-02, CLAS-03, UX-10, BACK-01, BACK-02
</domain>

<decisions>
## Implementation Decisions (Draft)

- D-01: Keep processing fully local and offline; no network dependency for STT/classification.
- D-02: Preserve ephemeral-audio rule: delete raw audio after transcription/classification completes.
- D-03: Keep existing Phase 2 encrypted persistence as sink for final text/category output.
- D-04: Use pipeline stage boundaries with explicit error isolation (record -> stt -> classify -> persist).

## Open Decisions for Discuss-Phase

- O-01: Whisper model strategy (single bilingual model vs language-specific models).
- O-02: Classification approach (prompted lightweight model vs deterministic heuristic fallback order).
- O-03: Progress UX contract granularity (coarse stage labels vs percentage per stage).
- O-04: Background completion semantics for interrupted app state (strict best effort vs guaranteed resume queue).
</decisions>

<specifics>
## Existing Anchors

- src/hooks/useTranscription.ts currently orchestrates stub transcription and persistence.
- src/services/transcriptionStub.ts is current stand-in for Phase 3 STT.
- src/services/entriesRepository.ts is already encrypted persistence backend.
- src/screens/HomeScreen.tsx + processing/error components are current UX surfaces.
</specifics>

<plan_split>
## Planned Work Split (from ROADMAP)

- 03-01: STT service (Whisper model download/cache, whisper.rn integration, bilingual transcription, progress reporting)
- 03-02: NLP classifier service (Executorch + SmolLM2 model download, classification prompt, keyword heuristic fallback)
- 03-03: Pipeline orchestration (Entry Service: coordinate record -> STT -> NLP -> persist with per-stage error isolation)
</plan_split>

---

*Phase: 03-on-device-ml-pipeline*
*Context gathered: 2026-05-18*
