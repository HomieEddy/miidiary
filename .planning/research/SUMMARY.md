# Project Research Summary

**Project:** Dear Diary — Voice-Capture Diary App
**Domain:** Local-first mobile voice-capture diary with on-device AI (STT + NLP classification)
**Researched:** 2026-05-17
**Confidence:** HIGH (stack + architecture), MEDIUM (features + pitfalls due to bilingual accuracy unknowns)

## Executive Summary

Dear Diary is a privacy-first, zero-cloud mobile app that lets users record voice memos, automatically transcribes them via on-device Whisper, classifies them as Diary/Task/Note using a small local LLM, and stores everything encrypted on-device with SQLCipher. Its key differentiator is bilingual support (English/Quebec French) and the promise that "your data never leaves your phone." The recommended stack is React Native 0.83+ (New Architecture) + Expo SDK 55+, with whisper.rn for STT, react-native-executorch + SmolLM2 1.7B for NLP classification, and expo-sqlite + SQLCipher + Drizzle ORM for encrypted persistence.

The approach is build the product in 13 dependency-aware phases: start with the scaffolding and the core audio capture loop, add encrypted storage and the ML pipeline (STT → NLP) independently, then orchestrate them into a recording pipeline, layer on browse/edit screens, and finally add model management, background recording, and polish. This ordering ensures you can test audio recording and database persistence before any ML integration adds complexity.

**Key risks:** RAM exhaustion from concurrently loaded ML models (mitigate by lazy-loading the LLM and unloading Whisper after transcription), large model downloads on first launch causing abandonment (mitigate by starting with Whisper `tiny` and a keyword-classifier fallback, deferring the LLM download), and bilingual transcription accuracy being worse than expected (mitigate by testing with real Quebec French samples early and always allowing manual text correction). The project's zero-cloud constraint means all mitigations must be on-device — there is no cloud fallback option.

## Key Findings

### Recommended Stack

The stack is built around the Expo + React Native New Architecture ecosystem, required because all ML libraries depend on Fabric/JSI/TurboModules. Everything is off-the-shelf; no custom native modules needed.

**Core technologies:**

- **React Native 0.83+ (New Architecture):** Mobile UI framework — required by all ML libraries (whisper.rn, react-native-executorch)
- **Expo SDK 55+:** Managed development + EAS Build — standard for production RN; OTA updates available
- **Expo Router 4.x:** File-based navigation — convention-based, deep linking ready
- **TypeScript 5.x:** Type safety — required by Drizzle ORM and service interfaces
- **expo-audio 1.1.0+:** Audio recording + playback — built-in Expo SDK, supports background recording
- **whisper.rn 0.6.0:** On-device STT via whisper.cpp — most mature RN binding; Core ML on iOS
- **Whisper base multilingual (142 MB):** STT model — best speed/accuracy balance; 99 languages
- **react-native-executorch + SmolLM2 1.7B Q4 (~1 GB):** On-device LLM classification — Software Mansion-maintained; Hooks API; CoreML/Vulkan acceleration
- **expo-sqlite + SQLCipher:** Encrypted relational storage — industry standard for mobile encrypted SQLite
- **expo-secure-store:** Encryption key storage — iOS Keychain / Android Keystore
- **Drizzle ORM 0.40+:** Type-safe SQL queries — migration support, Expo dev tools plugin
- **expo-dev-client:** Local dev builds — required because Expo Go cannot run native ML modules
- **expo-haptics + react-native-reanimated:** Premium feel — haptics on record/stop, motion animations

**Alternatives considered & rejected:**
- op-sqlite over expo-sqlite: rejected — expo-sqlite has broader Expo ecosystem support
- WatermelonDB: rejected — sync protocol overhead not needed (no cloud)
- Fine-tuned BERT: rejected v1 — needs ML expertise and bilingual training data
- Cloud API fallback: rejected — violates zero-cloud constraint

**Full details:** [STACK.md](./STACK.md)

### Expected Features

**Must have (table stakes):**
- Instant recording start ("one tap record") — expo-audio `record()` with preset configured
- Background recording — expo-audio `enableBackgroundRecording: true`; phone can lock, recording continues
- Accurate STT — Whisper base multilingual; user can edit text
- Offline functionality — zero-cloud; must work in airplane mode
- Browse past entries — SQLite + FlatList
- Search entries — SQLite FTS5
- Edit transcribed text — inline editing on review screen
- Replay audio — expo-audio playback from stored URI
- Delete entries — soft delete with purge
- Privacy/encryption — SQLCipher + secure store; transparent to user

**Should have (differentiators):**
- Auto-classification (Diary/Task/Note) — "record and forget"; thoughts auto-sorted via LLM
- Bilingual EN/FR-CA — zero competitors handle Quebec French well
- High-fidelity haptic feedback — premium tactile feel on record start/stop
- Zero cloud (earned trust) — marketable architectural constraint
- Instant startup (< 2s cold start) — models pre-loaded; splash while DB decrypts
- FTS5 full-text search — fast on-device search
- Category filtering — browse by Diary/Task/Note tabs

**Defer (v1.1+):**
- Advanced audio waveform visualization
- Multiple languages beyond EN/FR
- Export/import functionality
- Widgets or Siri/Assistant integration
- Background processing with notification (v2)
- Real-time streaming transcription (v2+)

**Anti-features (explicitly excluded):**
- Cloud backup/sync — violates privacy-first design
- Social sharing — personal diary utility
- Web/desktop client — scope creep
- Photos/video attachments — voice is the medium
- User accounts / login — unnecessary for local-only
- Real-time streaming transcription — adds VAD complexity; not needed for "record and forget"

**Full details:** [FEATURES.md](./FEATURES.md)

### Architecture Approach

The architecture follows a strict layered pattern: **Presentation (Expo Router screens) → Hooks → Service Layer (business logic) → Persistence (Repository)**. Services are singletons with event emitters, initialized at boot. The primary data flow is a sequential pipeline: Audio Capture → STT → NLP → Persist. Error isolation is built in — each stage handles its own failures independently, so a failed transcription doesn't lose the audio file.

**Major components:**
1. **Audio Capture Service** — wraps expo-audio; manages recording lifecycle; handles background recording state machine (idle → recording → stopping → idle)
2. **STT Service** — wraps whisper.rn; transcribes audio files to text; model loaded once and cached for app lifetime
3. **NLP Classifier Service** — wraps react-native-executorch; classifies text as diary/task/note via LLM prompt; lazy-loaded on first classification
4. **Model Manager** — downloads/caches ML models on first launch; version-aware cache keys; never bundles models in app binary
5. **Entry Service** — pipeline orchestrator; coordinates Audio → STT → NLP → persist; isolated error handling per stage
6. **Entry Repository** — CRUD on encrypted SQLite via Drizzle ORM; soft-delete pattern; FTS5 search index
7. **Audio File Manager** — saves/retrieves/cleans up audio files at `/audio/{uuid}.m4a`; orphan cleanup on cancel
8. **Boot/Init Service** — sequential startup: permissions → DB → models → app ready; splash screen with progress

**Key patterns:** Singleton with EventEmitter, Repository pattern for data access, Pipeline orchestration with error isolation, Model weak-reference cache (load once, keep for app lifetime).

**Full details:** [ARCHITECTURE.md](./ARCHITECTURE.md)

### Critical Pitfalls

**Top 5 pitfalls to address in roadmap and planning:**

1. **Concurrent ML Models Exhaust Device RAM** — Whisper (~400 MB) + LLM (~700 MB) + app heap (~200 MB) = ~1.3 GB. On 4 GB devices, the OS may kill the app. **Mitigation:** Lazy-load NLP model; unload Whisper after transcription; profile on iPhone 11/12/SE and Pixel 5/6a; add RAM-aware model selection (use `tiny` STT on low-RAM devices).

2. **Model Download Failures on First Launch** — 142 MB (Whisper) + ~1 GB (LLM) download on first launch. Users on cellular or slow connections will abandon. **Mitigation:** Start with Whisper `tiny` (75 MB); defer LLM download; show clear progress with time estimates; use expo-file-system download resumable; bundle a keyword-classifier fallback that works immediately.

3. **Bilingual STT Accuracy Worse Than Expected** — Quebec French vocabulary and code-switching (EN/FR mixed sentences) are underrepresented in Whisper's training data. **Mitigation:** Test with real Quebec French audio samples before committing; benchmark Whisper `small` vs `base` for FR accuracy; let users set language explicitly; always allow manual text correction; flag low-confidence entries for review.

4. **Background Recording Not Actually Reliable** — iOS/Android may terminate background recording services under memory pressure. User records 5 min, comes back to find 30s. **Mitigation:** Test on real devices (simulator doesn't reproduce); save audio in chunks every 30s so partial recordings survive; add "recording persisted" check on app foreground; document the constraint.

5. **SQLCipher Key Loss = Permanent Data Loss** — If user reinstalls app or key storage is cleared, all entries become unrecoverable. **Mitigation:** Warn users explicitly on first launch; offer encrypted one-way export; key derivation from optional user passphrase (advanced); OS-level backup preserves key if Keychain/Keystore is preserved.

**Full details:** [PITFALLS.md](./PITFALLS.md)

## Implications for Roadmap

Based on research, the product should be built in 13 dependency-aware phases. The ordering follows strict technical dependencies (you can't classify text without transcribing it first) and architectural layer separation (foundation → core loops → ML → orchestration → polish).

### Phase 1: Foundation (Scaffolding + Navigation)
**Rationale:** Every other phase depends on project structure. Expo Router must be configured before any screen work.
**Delivers:** Working Expo project with file-based routing, TypeScript, linting, basic navigation shell (tabs/groups)
**Addresses:** Nothing user-facing yet — this is pure infrastructure
**Avoids:** Pitfall 6 (slow startup) — establishes splash screen pattern from day one
**Depends on:** Nothing

### Phase 2: Audio Capture Core
**Rationale:** Recording audio is the primary input mechanism. Must be built first to validate the core loop and test on real devices.
**Delivers:** Working record button → microphone permission flow → audio file saved to disk → stop recording
**Uses:** expo-audio, expo-file-system, expo-haptics
**Implements:** Audio Capture Service (recording state machine)
**Avoids:** Pitfall 4 (background recording) — test early; Pitfall 11 (permission revocation) — check per-session
**Depends on:** Phase 1

### Phase 3: Audio Playback + File Management
**Rationale:** Users must hear what they recorded. Paired with Phase 2 because they share the audio subsystem.
**Delivers:** Audio file list → tap to play → expo-audio playback with progress; Audio File Manager
**Uses:** expo-audio (playback), expo-file-system
**Implements:** Audio File Manager
**Depends on:** Phase 2

### Phase 4: Encrypted Database + Entry Repository
**Rationale:** Storage is needed before we can save anything. Can be built in parallel with Phase 2/3.
**Delivers:** SQLCipher-encrypted SQLite database; Entry schema; Entry Repository CRUD; Drizzle ORM integration; key generation in secure store
**Uses:** expo-sqlite, SQLCipher, expo-secure-store, Drizzle ORM
**Implements:** Entry Repository, Database schema, Encryption module
**Avoids:** Pitfall 5 (key loss) — adds warning UX; Pitfall 8 (SQLCipher+expo-updates conflict) — test build immediately
**Depends on:** Phase 1

### Phase 5: STT Service (Speech-to-Text)
**Rationale:** Core ML component. Transcribes audio to text. Can be built in parallel with Phase 6 (NLP).
**Delivers:** Whisper model download; whisper.rn integration; file-based transcription; progress feedback
**Uses:** whisper.rn 0.6.0, Whisper base multilingual (142 MB)
**Implements:** STT Service, Model Manager (initial download)
**Avoids:** Pitfall 2 (model download) — progress with pause/resume; Pitfall 3 (bilingual accuracy) — test with Quebec FR samples
**Research flag:** Needs bilingual accuracy testing with real Quebec French audio samples. Use `/gsd-research-phase` to gather test samples and benchmark Whisper `tiny` vs `base` vs `small`.
**Depends on:** Phase 2 (needs audio files to transcribe)

### Phase 6: NLP Classifier Service
**Rationale:** Second ML component. Classifies transcribed text into Diary/Task/Note. Develops in parallel with Phase 5.
**Delivers:** SmolLM2 1.7B download; react-native-executorch integration; LLM prompt-based classification; keyword heuristic fallback
**Uses:** react-native-executorch, SmolLM2 1.7B Q4_K_M (~1 GB)
**Implements:** NLP Classifier Service, Keyword fallback classifier
**Avoids:** Pitfall 1 (RAM pressure) — lazy-load NLP model; Pitfall 9 (mixed language) — test code-switched samples
**Research flag:** Needs LLM model selection validation and inference benchmarking. Test SmolLM2 vs Llama 3.2 1B vs Gemma 3 1B for FR accuracy. Use `/gsd-research-phase` or `/gsd-spike`.
**Depends on:** Phase 3 (needs text to classify — but can be tested with mock text during dev)

### Phase 7: Entry Service (Pipeline Orchestrator)
**Rationale:** Wires everything together: Audio → STT → NLP → Persist. Core product loop.
**Delivers:** Full recording pipeline: tap record → talk → stop → spinner → entry appears in database; error isolation per stage
**Implements:** Entry Service (orchestrator pattern), Error recovery flows
**Addresses:** Core user flow — record, transcribe, classify, save
**Avoids:** Pitfall 10 (audio cleanup) — establishes orphan cleanup on cancel
**Depends on:** Phase 3 (audio playback), Phase 4 (storage), Phase 5 (STT), Phase 6 (NLP)

### Phase 8: Browse + Search Screen
**Rationale:** Users need to find past entries. Category filtering and FTS5 search are high-value and build on Phase 4/7.
**Delivers:** Entry list by category (Diary/Task/Note tabs); FTS5 full-text search; pull-to-refresh; empty states
**Uses:** expo-sqlite FTS5
**Implements:** Browse screen, Search hook, EntryCard component, CategoryBadge component
**Addresses:** Browse entries, Search entries, Category filtering
**Depends on:** Phase 4 (repository), Phase 7 (pipeline — entries to browse)

### Phase 9: Entry Review + Edit Screen
**Rationale:** Users edit transcription errors, change categories, replay audio. Builds on Phase 7.
**Delivers:** Entry detail view; inline text editing; category change; audio replay; delete action
**Implements:** Review screen, useEntry hook
**Addresses:** Edit transcribed text, Replay audio, Delete entries, Recategorize
**Depends on:** Phase 7 (pipeline), Phase 3 (audio playback)

### Phase 10: Settings Screen
**Rationale:** Model management, language toggle, storage info. Needed for production but not MVP.
**Delivers:** Model download/update UI; language selector (EN/FR); storage usage display; data management (delete audio, export)
**Implements:** Settings screen, Model Manager UI
**Addresses:** Model management, Language toggle
**Avoids:** Pitfall 7 (app size) — shows download progress; Pitfall 10 (audio cleanup) — shows storage + bulk delete
**Depends on:** Phase 5 (STT model), Phase 6 (NLP model)

### Phase 11: Model Manager — Production Lifecycle
**Rationale:** Production-grade model download experience. Separate from initial STT/NLP because it requires the download UI infrastructure from Phase 10.
**Delivers:** First-launch download screen with progress/time estimate; pause/resume; WiFi-only option; model version checking; failed download recovery
**Implements:** InitProgress component, Download manager (expo-file-system resumable)
**Avoids:** Pitfall 2 (download failures) — pause/resume, progress, WiFi-only
**Research flag:** Need to research download UX patterns and large-model-first-launch flows. Use `/gsd-research-phase`.
**Depends on:** Phase 10 (settings), Phase 5 (STT), Phase 6 (NLP)

### Phase 12: Background Recording Enhancement
**Rationale:** Production background recording reliability. Separation allows Phase 2 to ship with basic background support while this phase addresses edge cases.
**Delivers:** Chunked audio saving (every 30s); foreground restoration check; persistent recording notification (Android); interruption handling; navigation lock during recording
**Avoids:** Pitfall 4 (background recording reliability) — chunked saves; Pitfall 12 (gesture conflicts) — navigation lock
**Research flag:** Needs real device testing on iOS 26+ and Android 14+. Background recording behavior varies significantly by OS version.
**Depends on:** Phase 2 (audio capture)

### Phase 13: Animation + Haptic Polish
**Rationale:** Delight layer. High-fidelity animations and haptics turn the app from functional to premium. Deliberately last because all core flows must work first.
**Delivers:** Motion animations (react-native-reanimated) on transitions; haptic feedback on record/stop/browse interactions; splash screen polish; visual feedback for silent mode
**Uses:** react-native-reanimated, expo-haptics, expo-splash-screen
**Addresses:** High-fidelity haptic feedback, Instant startup (< 2s)
**Avoids:** Pitfall 13 (haptics on silent mode) — visual fallback
**Depends on:** Phase 7 (pipeline — core flows working)

### Phase Ordering Rationale

- **Phases 2/3 (audio) and 4 (database) are parallelizable** — they have no dependency on each other. This is the primary opportunity to shorten the build timeline by splitting work across two developers or workstreams.
- **Phases 5 (STT) and 6 (NLP) are parallelizable** — separate model runtimes, separate services. Both depend on Phase 2 but not on each other.
- **ML phases (5, 6) are intentionally deferred until after audio (2, 3) and storage (4)** — this lets you validate the core recording and persistence loops without ML complexity. You can test recording, playing, saving, and browsing with hardcoded mock data before investing in model integration.
- **Model Manager (11) is deferred to late** — the first-launch download experience is critical production UX but can be replaced with a simple "Loading..." during development. This avoids over-engineering the download flow before the models are stable.
- **Polish (13) is deliberately last** — animations and haptics should not delay the core product shipping. They add delight but don't change functional behavior.

### Research Flags

Phases needing deeper research during planning:
- **Phase 5 (STT):** Bilingual accuracy benchmarking — must test with real Quebec French audio samples. Need to source or generate a test set, measure WER for Whisper `tiny` vs `base` vs `small` multilingual.
- **Phase 6 (NLP):** LLM model selection — benchmark SmolLM2 1.7B vs Llama 3.2 1B vs Gemma 3 1B for 3-class classification accuracy on mixed-language text. Profile inference time on target devices.
- **Phase 11 (Model Manager):** Large-model-first-launch UX research — download patterns, pause/resume implementation, progress display conventions.
- **Phase 12 (Background Recording):** Real-device behavior research — test iOS 26+ and Android 14+ background recording termination patterns, OS-specific notification requirements.

Phases with standard patterns (likely skip `research-phase`):
- **Phases 1-4:** Foundation, audio capture, playback, database — all well-documented Expo SDK patterns. Read official docs during planning, no deep research needed.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified against official docs and active community repos. Expo SDK 55, whisper.rn 0.6.0, react-native-executorch all documented and maintained. |
| Features | MEDIUM | Table stakes and differentiators are well-researched against competitors (Apple Voice Memos, Otter.ai, Dio, Day One). Anti-features derived from PROJECT.md constraints. However, bilingual accuracy assumptions need validation. |
| Architecture | HIGH | Layered architecture is standard Expo pattern verified against official Expo local-first guide. Service patterns (singleton, repository, pipeline) are established mobile patterns. Directory structure follows Expo Router conventions. |
| Pitfalls | MEDIUM | RAM and download pitfalls are well-documented from Expo blog and community reports (HIGH confidence). Bilingual accuracy is based on general Whisper knowledge with no specific CA-FR benchmark found (LOW confidence — needs phase-specific validation). Background recording reliability based on community issue reports (MEDIUM confidence). |

**Overall confidence:** MEDIUM-HIGH — Stack and Architecture are well understood. Features and Pitfalls have known unknowns around bilingual accuracy that can only be resolved through hands-on testing.

### Gaps to Address

- **Bilingual accuracy data:** No benchmark exists for Whisper on Quebec French audio. Need to create or source a test set during Phase 5 planning. This could block STT timeline if accuracy is unacceptable.
- **Exact LLM model for classification:** Multiple viable options (SmolLM2, Llama 3.2, Gemma 3). Need to benchmark on target devices during Phase 6 — results may change model choice.
- **Target device RAM profiling:** RAM numbers in research (400 MB Whisper, 700 MB LLM) are estimates from Expo blog. Must profile on actual target devices (iPhone 11/12/SE, Pixel 5/6a, Galaxy A-series) during Phase 5/6.
- **SQLCipher + expo-updates build test:** Known build conflict. Must test immediately in Phase 4 to avoid blocking later phases. If conflict can't be resolved, may need to drop expo-updates (acceptable for local-only app).

## Sources

### Primary (HIGH confidence)
- [Expo SDK 55 docs](https://docs.expo.dev) — Expo ecosystem, SDK modules, config plugins
- [Expo Audio docs](https://docs.expo.dev/versions/unversioned/sdk/audio) — expo-audio recording, background support, config plugin
- [Expo SQLite docs](https://docs.expo.dev/versions/latest/sdk/sqlite) — SQLCipher integration, encryption config
- [Expo local-first guide](https://docs.expo.dev/guides/local-first/) — Architecture patterns for local-first Expo apps
- [whisper.rn v0.6.0](https://github.com/mybigday/whisper.rn) — React Native whisper.cpp binding, Core ML support, VAD
- [react-native-executorch blog](https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch) — On-device LLM inference, hardware constraints
- [Drizzle ORM + Expo](https://expo.dev/blog/modern-sqlite-for-react-native-apps) — Drizzle integration, migrations, dev tools

### Secondary (MEDIUM confidence)
- [react-native-ai (Callstack)](https://github.com/callstackincubator/ai) — Alternative on-device AI SDK, iOS-primary
- [local-llm-rn](https://github.com/hilum-labs/local-llm-rn) — GPU-accelerated LLM inference, device-aware model selection (newer library)
- [Variant Systems blog](https://variantsystems.io/blog/react-native-audio-recording-ai-pipeline) — Production background audio recording with expo-audio
- [OP-SQLite docs](https://op-engineering.github.io/op-sqlite/docs/installation/) — SQLCipher integration, compilation flags, build conflict guidance
- [Expo community issue #40945](https://github.com/expo/expo/issues/40945) — Background recording reliability, community solutions

### Tertiary (LOW confidence — needs validation)
- Whisper multilingual accuracy on Quebec French — No specific CA-FR benchmark found. Must test during Phase 5.
- LLM classification accuracy for mixed-language text — Inference based on multilingual model capabilities. Must benchmark during Phase 6.
- Target device RAM constraints — Estimates from Expo blog. Must profile on actual devices during Phase 5/6.

---

*Research completed: 2026-05-17*
*Ready for roadmap: yes*
