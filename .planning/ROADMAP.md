# Roadmap: Dear Diary

## Overview

Dear Diary transforms voice capture into organized entries — from a single tap to record, through on-device transcription and auto-classification, to browsing your diary entries, tasks, and reference notes — all offline, all encrypted, with zero cloud. Audio is ephemeral: discarded immediately after transcription. The build progresses through 5 phases: starting with project scaffolding and dependency setup, then the audio capture foundation, encrypted persistence, the on-device ML pipeline (STT + NLP), and finally the full browse/edit experience with polish.

## Phases

- [ ] **Phase 0: Project Scaffolding** - React Native Expo app initialized with all dependencies, theme system, and a basic render test
- [x] **Phase 1: Foundation & Audio Capture** - Core record → visualize → transcribe → discard loop with haptic feedback
- [x] **Phase 2: Encrypted Storage & Basic Browse** - SQLCipher database, entry persistence, and chronological entry list
- [ ] **Phase 3: On-Device ML Pipeline** - On-device speech-to-text (EN/FR) and auto-classification (Diary/Task/Note)
- [ ] **Phase 4: Browse, Review, Tasks & Polish** - Search, filter, edit entries, task management, motion animations, dark mode

## Phase Details

### Phase 0: Project Scaffolding
**Goal**: A clean, runnable React Native Expo app with every locked dependency installed, the theme system wired up, Expo Router navigation in place, and a basic render test passing
**Mode**: mvp
**Depends on**: Nothing
**Requirements**: SCAFFOLD-01, SCAFFOLD-02, SCAFFOLD-03, SCAFFOLD-04
**Success Criteria** (what must be TRUE):
   1. `npx expo start` launches the app on iOS simulator or Android emulator with no errors
   2. Home screen renders with correct theme (background #FDF8F0, proper font loading)
   3. All locked dependencies listed in the architecture lock table are installed and importable (no missing native module errors)
   4. Expo Router file-based routing works — navigating to an empty `/diary` route shows the diary screen
   5. `npx expo run:ios` / `npx expo run:android` completes a successful native prebuild without errors
   6. Basic Jest render test (`library/ui.test.tsx`) passes — verifies the app shell renders without crashing
**Plans**: 3 plans

**Wave Structure**: 1 → 2 → 3

Plans:
- [ ] 00-01-PLAN.md — Initialize Expo project (CNG + prebuild), install all locked dependencies, configure NativeWind v4 Babel plugin + CSS entry, create src/ directory structure, bundle font TTF files
- [ ] 00-02-PLAN.md — Wire theme system (app.json brand colors, tailwind.config.js registration, tsconfig path aliases), create root layout with useFonts font loading + SplashScreen, build Expo Router tab navigation with UI-SPEC tab bar (Solar icons, border-4, offset shadow, pink skew underline), 4 placeholder screens
- [ ] 00-03-PLAN.md — Configure Jest (jest-expo preset, @/ path mapping), write basic render test (ui.test.tsx) verifying app shell rendering and theme class application

### Phase 1: Foundation & Audio Capture
**Goal**: Users can capture voice recordings with tactile feedback, see live audio visualization, and have interruptions handled gracefully — audio is ephemeral, discarded after transcription
**Mode**: mvp
**Depends on**: Phase 0
**Requirements**: VOIC-01, VOIC-02, VOIC-03, VOIC-04, VOIC-05, VOIC-06, VOIC-07, UX-02, UX-03, UX-06
**Success Criteria** (what must be TRUE):
   1. User can open the app and see a clean home screen with a single recording button
   2. User can tap the button once to instantly start recording (zero perceptible delay) with haptic feedback
   3. User can see recording state clearly via Skia waveform visualization during capture
   4. User can tap the button once to stop recording — audio is queued for transcription
   5. Raw audio file is discarded immediately after transcription completes (Phase 1 stubs the pipeline; actual STT integration in Phase 3)
   6. Incoming calls or notifications during recording are handled gracefully — no crash or data loss
**Plans**: 3 plans

**Wave Structure**: 1 → 2 → 3

**UI hint**: yes

Plans:
- [x] 01-01-PLAN.md — Audio recording engine (expo-audio 16kHz mono WAV, recordingStore, interruption handler) + recording UI (Rive RecorderButton with Reanimated spring + haptics, GlowRing, RecordingTimer, PromptText) + HomeScreen refactor from placeholder
- [x] 01-02-PLAN.md — Skia WaveformCanvas (gradient-filled path), stub transcription (1-3s delay + cleanup), in-memory entriesStore, cn() utility, deps (expo-file-system, clsx, tailwind-merge)
- [x] 01-03-PLAN.md — Orchestration hooks (useAudioCapture, useTranscription), state UI (ProcessingState, TranscriptionResult, ErrorBanner), HomeScreen refactor with full pipeline, shake-to-clear stub (UX-06)

### Phase 2: Encrypted Storage & Basic Browse
**Goal**: Users can save entries with full encryption, view all entries in a chronological list, and delete data — all offline
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, STOR-06, SEC-01, SEC-02, BROW-01
**Success Criteria** (what must be TRUE):
   1. All entries survive app restart — persisted in an encrypted Realm database
   2. Encryption keys are stored in iOS Keychain / Android Keystore via react-native-keychain
   3. No data is ever sent to external servers — app functions fully in airplane mode with no degraded behavior
   4. User can view a chronological flash-list of all saved entry titles (text only, no audio)
   5. User can delete individual entries or wipe all data from settings
   6. Realm queries on timestamp and category return in under 10ms via deterministic single-key indexing
   7. App is locked behind biometric authentication on launch (expo-local-authentication)
**Plans**: 2 plans

**UI hint**: yes

Plans:
- [ ] 02-01: Realm encrypted database setup (Realm schema with deterministic indexing on timestamp/category, MMKV + Keychain key management)
- [ ] 02-02: Entry repository CRUD + chronological list screen (flash-list) + delete flow + offline validation + biometric unlock
- [x] 02-01: Realm encrypted database setup (Realm schema with deterministic indexing on timestamp/category, MMKV + Keychain key management)
- [x] 02-02: Entry repository CRUD + chronological list screen (flash-list) + delete flow + offline validation + biometric unlock

### Phase 3: On-Device ML Pipeline
**Goal**: Recorded speech is automatically transcribed and classified into Diary/Task/Note — all on-device, all offline, in English and French
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: TRAN-01, TRAN-02, TRAN-03, TRAN-04, TRAN-05, CLAS-01, CLAS-02, CLAS-03, UX-03
**Success Criteria** (what must be TRUE):
  1. After recording stops, speech is transcribed to text automatically using on-device STT — no internet required
  2. User can see transcription progress while it processes (meaningful progress indicator)
  3. Transcribed text is accurate for both English and Canadian/Quebec French speech
  4. Transcribed text is automatically classified on-device as Diary Entry, Task, or Reference Note
  5. User can manually override the auto-classification if it's incorrect
**Plans**: TBD

Plans:
- [ ] 03-01: STT service (Whisper model download/cache, whisper.rn integration, bilingual transcription, progress reporting)
- [ ] 03-02: NLP classifier service (Executorch + SmolLM2 model download, classification prompt, keyword heuristic fallback)
- [ ] 03-03: Pipeline orchestration (Entry Service: coordinate record → STT → NLP → persist with per-stage error isolation)

### Phase 4: Browse, Review, Tasks & Polish
**Goal**: Users can search, filter, edit entries, manage tasks, and experience a polished app with smooth animations, Thought Shredder transition, and dark mode
**Mode**: mvp
**Depends on**: Phase 2, Phase 3
**Requirements**: BROW-02, BROW-03, BROW-04, BROW-05, UX-01, UX-04, UX-05, UX-07, UX-08, UX-09, TASK-01, TASK-02, TEST-01, TEST-02
**Success Criteria** (what must be TRUE):
   1. User can filter entries by type (Diary / Task / Reference Note) using tab navigation (with success haptic on swipe)
   2. User can search entry text content with fast on-device results
   3. User can open any entry to read full text (audio is not persisted — text-only after transcription)
   4. User can edit entry text and change the classification
   5. User can view entries classified as Tasks in a dedicated task view and mark them complete/incomplete
   6. "Thought Shredder" transition plays on recording stop: card downscales, cracks along pause cuts, staggered layout animation separates into categories
   7. App has smooth motion animations throughout (Reanimated native worklet thread — locked at max refresh even under ML load), progressive skeletal shimmer reveals, and dark/light mode adaptation
**Plans**: TBD

**UI hint**: yes

Plans:
- [ ] 04-01: Browse & search screen (category tabs with Realm FTS, Reanimated category tab bar, flash-list entry list, entry detail)
- [ ] 04-02: Edit & task management (inline text editing, classification override, task complete/incomplete toggle, pinch-to-merge with haptics)
- [ ] 04-03: Thought Shredder transition + animation polish (Reanimated staggered layout & spring worklets, Moti exit animations, NativeWind skeletal shimmer, Rive state machine integration, dark/light mode)
- [ ] 04-04: Integration tests (Jest + RTL: sentence slicing, bilingual token mapping) + E2E tests (Detox: swipe gestures, shake-to-clear, mock audio pipelines)

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Project Scaffolding | 0/3 | Planned | - |
| 1. Foundation & Audio Capture | 3/3 | Complete | 2026-05-18 |
| 2. Encrypted Storage & Basic Browse | 2/2 | Complete | 2026-05-18 |
| 3. On-Device ML Pipeline | 0/3 | Not started | - |
| 4. Browse, Review, Tasks & Polish | 0/4 | Not started | - |
