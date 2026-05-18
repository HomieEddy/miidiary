# Feature Landscape

**Domain:** Voice-capture mobile diary app with local-first, on-device AI
**Researched:** 2026-05-17

## Table Stakes

Features users expect. Missing any of these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Instant recording start | "One tap record" is the core promise; any delay breaks the flow | Low | Use expo-audio `record()` — no prepare needed if preset configured |
| Background recording | User might lock phone or switch apps mid-thought | Medium | expo-audio v1.1.0+ with `enableBackgroundRecording: true` |
| Accurate speech-to-text | Transcription is the primary output; errors frustrate users | Medium | Use whisper `base` multilingual (142 MB); user can edit text |
| Offline functionality | Zero-cloud requirement; must work in airplane mode | Low | Dependency-free once models are downloaded |
| Browse past entries | Archive access is fundamental | Low | SQLite query + FlatList |
| Search entries | Users must find past thoughts | Low | SQLite FTS5 on text column |
| Edit transcribed text | STT is never 100% accurate; corrections must be allowed | Low | Inline text editing on entry review screen |
| Replay audio | Users may want to hear original recording | Low | expo-audio playback from stored URI |
| Delete entries | Basic data management | Low | Soft delete (preserve until explicit purge) |
| Privacy/encryption | Core value prop; must be transparent | Medium | SQLCipher + key in secure store; no cloud calls ever |

## Differentiators

Features that set the product apart. Not expected, highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Auto-classification (Diary/Task/Note) | "Record and forget" — thoughts auto-sorted | High | NLP classifier on transcribed text; LLM prompt approach recommended |
| Bilingual EN/FR-CA | Zero competitors handle Quebec French well | High | Requires multilingual whisper model + bilingual-capable LLM |
| High-fidelity haptic feedback | Premium tactile feel; Apple Notes-level polish | Low | expo-haptics on record start/stop |
| Zero cloud (earned trust) | "Your data never leaves your phone" | Low | Architectural constraint, not a feature — but marketable |
| Instant startup (cold start < 2s) | Models are pre-loaded; only DB init blocks | Medium | Splash screen while DB decrypts; models load progressively |
| FTS5 full-text search | Fast on-device search across all entries | Medium | SQLite FTS5 via expo-sqlite FTS config |
| Category filtering | Browse by Diary / Task / Note tabs | Low | SQL query with category index |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Cloud backup/sync | Violates privacy-first design; adds complexity, attack surface, compliance burden | Local-only; export as JSON if user wants backup |
| Social sharing | Personal diary utility; sharing creates privacy expectations conflict | Let OS share sheet handle it if user insists |
| Web/desktop client | Scope creep; real-time sync would be needed | Mobile-only for v1; revisit if user demand justifies sync architecture |
| Photos/video attachments | Scope creep; adds storage pressure, complexity | Text + audio only; voice is the medium |
| User accounts / login | Unnecessary for local-only app; suggests cloud dependency | Device-local identity; settings stored in SQLite |
| Real-time transcription (streaming) | Adds VAD complexity, audio stream management, partial result UI | Record → process-on-stop; simpler, same UX for "record and forget" |
| Multiple recording formats | Users don't care; adds testing surface | AAC/M4A only (default expo-audio format) |

## Feature Dependencies

```
Record Screen      ─┐
                    ├── Audio Capture Service ──┐
Browse Screen     ─┤                            │
                    │                            ├── Entry Service (pipeline) ──┐
Review Screen     ─┤                            │                              │
                    │                            │                              ├── Entry Repository ── SQLCipher DB
Settings Screen   ─┘                            │                              │
                                                ├── STT Service ── whisper.rn  │
                                                ├── NLP Classifier ── LLM       │
                                                └── Model Manager ── downloads  │
                                                                                └── Audio File Manager
```

**Hard dependencies:**
- Entry Service requires: Audio Capture (for input) + STT (to transcribe) + NLP (to classify) + Repository (to save)
- Browse requires: Repository (to read)
- Review requires: Repository (to read/update) + Audio File Manager (to play audio)
- Settings requires: Model Manager (to manage/download models)

**Parallelizable work:**
- Audio Capture + Repository can be built independently (no dependency between them)
- STT + NLP can be built in parallel (separate model runtimes, separate services)
- Browse + Review can be built in parallel (related but separable)

## MVP Recommendation

**Prioritize for v1 (must-ship):**
1. Single-button voice capture with instant recording start
2. Background recording (phone can lock, recording continues)
3. On-device STT (whisper multilingual)
4. Encrypted local storage (SQLCipher)
5. Automatic Diary/Task/Note classification
6. Browse entries by category
7. Edit transcribed text
8. Replay audio
9. Delete entries

**Defer to v1.1:**
- FTS5 full-text search (Phase 8 — high value but not blocking launch)
- Settings screen / model management (Phase 10 — needed for production but not v1)
- Background recording UI polish (Phase 11)
- Animations and haptic polish (Phase 13)

**Cut entirely for MVP:**
- Advanced audio waveform visualization
- Multiple languages beyond EN/FR
- Export/import functionality
- Widgets or Siri/Assistant integration

## Sources

- Competitor analysis: Apple Voice Memos, Otter.ai (cloud), Dio (AI diary), Day One (text journal)
- Feature priorities derived from PROJECT.md requirements list
- Anti-feature rationale from "zero cloud dependency" constraint + "privacy-first" positioning
