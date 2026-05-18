# Roadmap: Dear Diary

## Overview

Dear Diary transforms voice capture into organized entries — from a single tap to record, through on-device transcription and auto-classification, to browsing your diary entries, tasks, and reference notes — all offline, all encrypted, with zero cloud. The build progresses through 4 coarse phases: first the audio capture foundation, then encrypted persistence, followed by the on-device ML pipeline (STT + NLP), and finally the full browse/edit experience with polish.

## Phases

- [ ] **Phase 1: Foundation & Audio Capture** - Project scaffold and the core record/playback loop with haptic feedback
- [ ] **Phase 2: Encrypted Storage & Basic Browse** - SQLCipher database, entry persistence, and chronological entry list
- [ ] **Phase 3: On-Device ML Pipeline** - On-device speech-to-text (EN/FR) and auto-classification (Diary/Task/Note)
- [ ] **Phase 4: Browse, Review, Tasks & Polish** - Search, filter, edit entries, task management, motion animations, dark mode

## Phase Details

### Phase 1: Foundation & Audio Capture
**Goal**: Users can instantly capture voice recordings with tactile feedback, replay them, and have interruptions handled gracefully
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: VOIC-01, VOIC-02, VOIC-03, VOIC-04, VOIC-05, VOIC-06, UX-02
**Success Criteria** (what must be TRUE):
  1. User can open the app and see a clean home screen with a single recording button
  2. User can tap the button once to instantly start recording (zero perceptible delay) with haptic feedback
  3. User can see recording state clearly (waveform, timer, or visual indicator) during capture
  4. User can tap the button once to stop recording, then replay the captured audio
  5. Incoming calls or notifications during recording are handled gracefully — no crash or data loss
**Plans**: TBD

**UI hint**: yes

Plans:
- [ ] 01-01: Project scaffolding, Expo Router navigation, theme system, splash screen
- [ ] 01-02: Audio capture service (record, stop, file save) + recording UI (button, waveform/timer indicator, haptics)
- [ ] 01-03: Audio playback service + interruption handling (calls, notifications) + audio file management

### Phase 2: Encrypted Storage & Basic Browse
**Goal**: Users can save recordings with full encryption, view all entries in a chronological list, and delete data — all offline
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, BROW-01
**Success Criteria** (what must be TRUE):
  1. All entries survive app restart — persisted in an encrypted local database
  2. Encryption keys are stored in platform secure storage (iOS Keychain / Android Keystore)
  3. No data is ever sent to external servers — app functions fully in airplane mode with no degraded behavior
  4. User can view a chronological list of all saved entries
  5. User can delete individual entries or wipe all data from settings
**Plans**: TBD

**UI hint**: yes

Plans:
- [ ] 02-01: SQLCipher encrypted database setup (Drizzle ORM schemas, expo-secure-store key management, migrations)
- [ ] 02-02: Entry repository CRUD + chronological list screen + delete flow + offline validation

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
**Goal**: Users can search, filter, edit entries, manage tasks, and experience a polished app with smooth animations and dark mode
**Mode**: mvp
**Depends on**: Phase 2, Phase 3
**Requirements**: BROW-02, BROW-03, BROW-04, BROW-05, TASK-01, TASK-02, UX-01, UX-04
**Success Criteria** (what must be TRUE):
  1. User can filter entries by type (Diary / Task / Reference Note) using tab navigation
  2. User can search entry text content with fast on-device results
  3. User can open any entry to read full text and replay the original audio recording
  4. User can edit entry text and change the classification
  5. User can view entries classified as Tasks in a dedicated task view and mark them complete/incomplete
  6. App has smooth motion animations throughout (transitions, list interactions) and automatically adapts to system dark/light mode
**Plans**: TBD

**UI hint**: yes

Plans:
- [ ] 04-01: Browse & search screen (category tabs, FTS5 search, entry detail view with audio replay)
- [ ] 04-02: Edit & task management (inline text editing, classification override, task complete/incomplete toggle)
- [ ] 04-03: Animation polish & theming (react-native-reanimated motion animations, system dark/light mode adaptation)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Audio Capture | 0/3 | Not started | - |
| 2. Encrypted Storage & Basic Browse | 0/2 | Not started | - |
| 3. On-Device ML Pipeline | 0/3 | Not started | - |
| 4. Browse, Review, Tasks & Polish | 0/3 | Not started | - |
