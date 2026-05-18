# Research Summary: Dear Diary

**Synthesized:** 2026-05-17
**Architecture Locked:** 2026-05-17 (architecture specification override)

## Key Findings

### Stack

- **Framework**: React Native New Architecture (Fabric, JSI, TurboModules) via Expo CNG (prebuild)
- **Styling**: NativeWind v4 (Tailwind utility-first)
- **State**: Zustand with transient non-reactive isolates for live transcription
- **Database**: @realm/react with deterministic single-key indexing
- **Secure storage**: react-native-mmkv + react-native-keychain
- **STT**: react-native-whisper (bilingual EN/FR-CA)
- **Motion**: Reanimated + Moti (native thread spring worklets)
- **Vector UI states**: @rive/react-native (GPU-rendered state machines)
- **Audio viz**: @shopify/react-native-skia (GPU canvas)
- **List rendering**: @shopify/flash-list
- **Background**: expo-task-manager + expo-background-fetch
- **Biometrics**: expo-local-authentication
- **Haptics**: expo-haptics (mapped to spatial UI transitions)
- **Tests**: Jest + @testing-library/react-native (unit/integration), Detox (E2E)

### Table Stakes

- Instant voice capture with zero perceptible delay
- Reliable offline transcription
- Encrypted local storage with platform secure key management
- Chronological entry browse with search
- Dark/light mode
- Biometric app lock

### Differentiators

- **Auto-classification**: Diary / Task / Reference Note — no other voice diary app does this
- **"Thought Shredder"**: Cinematic card-to-categories transition via Reanimated staggered layout animations
- **Rive vector states**: Mic morphs into fluid equalizer on GPU — no React render cycle involved
- **Skia voice viz**: Amplitude waveform renders entirely on GPU canvas
- **Ephemeral audio**: Raw recording discarded after transcription — only text persists; no audio files accumulate on device
- **100% local, zero account**: No cloud, no sign-up, no data leaves the device
- **Bilingual EN/FR-CA**: Quebec French optimized via react-native-whisper multilingual model

### Watch Out For

1. **RAM exhaustion**: Whisper ~400 MB + classification model ~700 MB on 4 GB devices — lazy load/unload critical
2. **Bilingual code-switching accuracy**: Quebec French differs from European FR training data — test early
3. **Realm schema migrations**: Must plan migrations from day one; breaking changes require migration blocks
4. **Background recording on Android**: expo-task-manager + foreground service notification required
5. **Model download UX**: ~113–332 MB initial download — must handle pause/resume, retry, offline states
6. **Rive animations on low-end GPUs**: Test on mid-range Android devices for frame drops
7. **SQLCipher → Realm migration path**: If coming from initial SQLite research, data migration needed
8. **Detox native thread testing**: Requires careful async handling for ML pipeline E2E tests

## Architecture Principles

- **Pipeline isolation**: Audio Capture → STT → NLP → Store — each service independent, communicates via plain data structures
- **Native UI isolation**: All animations run on Reanimated native worklet thread — JS thread can be busy with ML without dropping frames
- **Transient memory isolation**: Live transcription data exists outside React tree (non-reactive Zustand variables) — zero redraw cost during recording
- **GPU offload**: Rive + Skia handle vector states and audio viz directly on GPU — no React reconciliation overhead

---

*Research synthesized: 2026-05-17*
*Last updated: 2026-05-17 after architecture specification*
