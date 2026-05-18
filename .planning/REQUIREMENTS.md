# Requirements: Dear Diary

**Defined:** 2026-05-17
**Core Value:** Instant, private, offline voice capture that automatically organizes thoughts into the right place

## v1 Requirements

### Voice Capture

- [ ] **VOIC-01**: User can start recording with a single tap from the home screen
- [ ] **VOIC-02**: Recording begins instantly with no perceptible delay
- [ ] **VOIC-03**: User can stop recording with a single tap
- [ ] **VOIC-04**: App records in high-quality audio format suitable for on-device STT
- [ ] **VOIC-05**: App handles audio interruptions (calls, notifications) gracefully
- [ ] **VOIC-06**: User is shown recording state clearly (waveform, timer, or visual indicator)

### Transcription (STT)

- [ ] **TRAN-01**: Recorded audio is transcribed to text using on-device speech-to-text
- [ ] **TRAN-02**: Transcription processes without internet connectivity
- [ ] **TRAN-03**: Transcription progress is visible to the user
- [ ] **TRAN-04**: English speech is transcribed accurately
- [ ] **TRAN-05**: French (Canadian/Quebec) speech is transcribed accurately

### Auto-Classification

- [ ] **CLAS-01**: Transcribed text is automatically classified as Diary entry, Task, or Reference Note
- [ ] **CLAS-02**: Classification runs entirely on-device
- [ ] **CLAS-03**: User can manually override the classification after processing

### Storage & Privacy

- [ ] **STOR-01**: All entries are stored locally on device with encryption
- [ ] **STOR-02**: Encryption key is managed via platform secure storage (iOS Keychain / Android Keystore)
- [ ] **STOR-03**: No data is ever sent to external servers or cloud
- [ ] **STOR-04**: App functions fully without internet connectivity
- [ ] **STOR-05**: User can delete individual entries or all data

### Review & Browse

- [ ] **BROW-01**: User can view a chronological list of all entries
- [ ] **BROW-02**: User can filter entries by type (Diary / Task / Reference Note)
- [ ] **BROW-03**: User can search entry text content
- [ ] **BROW-04**: User can read full entry text and listen to original audio
- [ ] **BROW-05**: User can edit entry text and classification

### UX & Animations

- [ ] **UX-01**: App uses high-fidelity motion animations throughout
- [ ] **UX-02**: Recording button has satisfying tactile feedback (haptics + animation)
- [ ] **UX-03**: Loading/processing states show meaningful progress
- [ ] **UX-04**: UI adapts to system dark/light mode

### Task Management (Minimal)

- [ ] **TASK-01**: Entries classified as Tasks appear in a task view
- [ ] **TASK-02**: User can mark tasks as complete/incomplete

## v2 Requirements

- **MULT-01**: User can switch between English and French in settings — deferred; v1 auto-detects from speech
- **NOTF-01**: Daily reminder to capture a thought
- **EXPT-01**: Export entries to text/JSON
- **BACK-01**: Optional encrypted backup to local file
- **STAT-01**: Basic statistics (streaks, entry count, word count)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync or backup | Privacy-first design — local-only by requirement |
| User accounts / sign-in | No cloud, no need for identity |
| Social or sharing features | Personal utility — not a social app |
| AI chat assistant | Would distract from core capture loop |
| Photo/video attachments | Voice-only for v1; media adds complexity |
| Web or desktop clients | Mobile-only for v1 |
| Real-time collaboration | Personal app only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VOIC-01 | Phase 1 | Pending |
| VOIC-02 | Phase 1 | Pending |
| VOIC-03 | Phase 1 | Pending |
| VOIC-04 | Phase 1 | Pending |
| VOIC-05 | Phase 1 | Pending |
| VOIC-06 | Phase 1 | Pending |
| TRAN-01 | Phase 3 | Pending |
| TRAN-02 | Phase 3 | Pending |
| TRAN-03 | Phase 3 | Pending |
| TRAN-04 | Phase 3 | Pending |
| TRAN-05 | Phase 3 | Pending |
| CLAS-01 | Phase 3 | Pending |
| CLAS-02 | Phase 3 | Pending |
| CLAS-03 | Phase 3 | Pending |
| STOR-01 | Phase 2 | Pending |
| STOR-02 | Phase 2 | Pending |
| STOR-03 | Phase 2 | Pending |
| STOR-04 | Phase 2 | Pending |
| STOR-05 | Phase 2 | Pending |
| BROW-01 | Phase 2 | Pending |
| BROW-02 | Phase 4 | Pending |
| BROW-03 | Phase 4 | Pending |
| BROW-04 | Phase 4 | Pending |
| BROW-05 | Phase 4 | Pending |
| UX-01 | Phase 4 | Pending |
| UX-02 | Phase 1 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 4 | Pending |
| TASK-01 | Phase 4 | Pending |
| TASK-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---

*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after initial definition*
