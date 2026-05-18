# Requirements: Dear Diary

**Defined:** 2026-05-17
**Core Value:** Instant, private, offline voice capture that automatically organizes thoughts into the right place

## v1 Requirements

### Voice Capture

- [ ] **VOIC-01**: User can start recording with a single tap from the home screen
- [ ] **VOIC-02**: Recording begins instantly with no perceptible delay
- [ ] **VOIC-03**: User can stop recording with a single tap
- [ ] **VOIC-04**: App records audio suitable for on-device STT — quality prioritized for transcription clarity, not playback fidelity
- [ ] **VOIC-05**: App handles audio interruptions (calls, notifications) gracefully — no crash or data loss
- [ ] **VOIC-06**: Recording state shown clearly via Skia-accelerated voice visualization (amplitude waveform)
- [ ] **VOIC-07**: Raw audio file is discarded immediately after transcription completes — only text persists

### Transcription (STT)

- [ ] **TRAN-01**: Recorded audio is transcribed to text using react-native-whisper on-device STT
- [ ] **TRAN-02**: Transcription processes without internet connectivity
- [ ] **TRAN-03**: Transcription progress is visible to the user
- [ ] **TRAN-04**: English speech is transcribed accurately
- [ ] **TRAN-05**: French (Canadian/Quebec) speech is transcribed accurately
- [ ] **TRAN-06**: Raw audio file is deleted immediately after transcription and classification complete — only text entry persists

### Auto-Classification

- [ ] **CLAS-01**: Transcribed text is automatically classified as Diary entry, Task, or Reference Note
- [ ] **CLAS-02**: Classification runs entirely on-device
- [ ] **CLAS-03**: User can manually override the classification after processing

### Storage & Privacy

- [ ] **STOR-01**: All entries stored locally via Realm with encryption (MMKV + Keychain)
- [ ] **STOR-02**: Encryption keys stored in iOS Keychain / Android Keystore
- [ ] **STOR-03**: No data is ever sent to external servers or cloud
- [ ] **STOR-04**: App functions fully without internet connectivity
- [ ] **STOR-05**: User can delete individual entries or all data
- [ ] **STOR-06**: Deterministic single-key Realm indexing on timestamp and category — queries under 10ms

### Security & Biometrics

- [ ] **SEC-01**: App is locked behind biometric authentication (Face ID / fingerprint) on launch
- [ ] **SEC-02**: Biometric unlock uses expo-local-authentication

### Review & Browse

- [ ] **BROW-01**: User can view a chronological list of all entries (powered by @shopify/flash-list)
- [ ] **BROW-02**: User can filter entries by type (Diary / Task / Reference Note)
- [ ] **BROW-03**: User can search entry text content
- [ ] **BROW-04**: User can read full entry text (audio is not persisted — text-only after transcription)
- [ ] **BROW-05**: User can edit entry text and classification

### UX, Motion & Animations

- [ ] **UX-01**: "Thought Shredder" transition on recording stop — card downscales, cracks along pause cuts, staggered layout animation separates entries into categories
- [ ] **UX-02**: Recording button has satisfying tactile feedback (Reanimated spring + expo-haptics impact)
- [ ] **UX-03**: Microphone state transitions to fluid equalizer via Rive vector engine on GPU
- [ ] **UX-04**: Horizontal swipe for category change fires success haptic pattern
- [ ] **UX-05**: Pinch-to-merge core completion fires medium impact haptic pulse
- [ ] **UX-06**: Shake-to-clear buffer reset fires heavy impact haptic signal
- [ ] **UX-07**: UI animations execute on native thread (Reanimated worklets) — locked at max refresh even under ML load
- [ ] **UX-08**: Progressive skeletal shimmer reveals (NativeWind) while Realm queries evaluate async
- [ ] **UX-09**: UI adapts to system dark/light mode
- [ ] **UX-10**: Loading/processing states show meaningful progress

### Task Management (Minimal)

- [ ] **TASK-01**: Entries classified as Tasks appear in a task view
- [ ] **TASK-02**: User can mark tasks as complete/incomplete

### Background Processing

- [ ] **BACK-01**: Transcriptions can complete in background via expo-task-manager
- [ ] **BACK-02**: expo-background-fetch handles pending model downloads

### Testing & Verification

- [ ] **TEST-01**: Jest + @testing-library/react-native integration tests for sentence slicing and bilingual token mapping with strict string matrix assertions
- [ ] **TEST-02**: Detox E2E tests for physical swipe gestures, device shakes, and mock audio pipelines under heavy computational load

## v2 Requirements

- **MULT-01**: User can switch between English and French in settings — deferred; v1 auto-detects from speech
- **NOTF-01**: Daily reminder to capture a thought
- **EXPT-01**: Export entries to text/JSON
- **STAT-01**: Basic statistics (streaks, entry count, word count)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync or backup | Privacy-first design — local-only by requirement |
| User accounts / sign-in | No cloud, no need for identity |
| Social or sharing features | Personal utility — not a social app |
| AI chat assistant | Would distract from core capture loop |
| Photo/video attachments | Voice-only for v1; media adds complexity |
| Audio file persistence | Audio is ephemeral — discarded after transcription; only text is stored |
| Web or desktop clients | Mobile-only for v1 |
| Real-time collaboration | Personal app only |

## Traceability

### v1 Requirements Breakdown

| Category | Count | Requirement IDs |
|----------|-------|-----------------|
| Voice Capture | 7 | VOIC-01–07 |
| Transcription (STT) | 6 | TRAN-01–06 |
| Auto-Classification | 3 | CLAS-01–03 |
| Storage & Privacy | 6 | STOR-01–06 |
| Security & Biometrics | 2 | SEC-01–02 |
| Review & Browse | 5 | BROW-01–05 |
| UX, Motion & Animations | 10 | UX-01–10 |
| Task Management | 2 | TASK-01–02 |
| Background Processing | 2 | BACK-01–02 |
| Testing & Verification | 2 | TEST-01–02 |
| **Total** | **45** | |

### Phase Mapping

| Requirement | Phase | Status |
|-------------|-------|--------|
| VOIC-01-07 | Phase 1 | Pending |
| UX-02 | Phase 1 | Pending |
| UX-03 | Phase 1 | Pending |
| UX-06 | Phase 1 | Pending |
| STOR-01-06 | Phase 2 | Pending |
| SEC-01-02 | Phase 2 | Pending |
| BROW-01 | Phase 2 | Pending |
| TRAN-01-06 | Phase 3 | Pending |
| CLAS-01-03 | Phase 3 | Pending |
| UX-10 | Phase 3 | Pending |
| BACK-01-02 | Phase 3 | Pending |
| BROW-02-05 | Phase 4 | Pending |
| UX-01 | Phase 4 | Pending |
| UX-04-05 | Phase 4 | Pending |
| UX-07-09 | Phase 4 | Pending |
| TASK-01-02 | Phase 4 | Pending |
| TEST-01-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 45 total
- Mapped to phases: 45
- Unmapped: 0 ✓

---

*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after architecture specification*
