# Dear Diary

## What This Is

A premium, high-polish, local-first mobile utility for "Record and Forget" voice capture. Users tap a single button to stream their thoughts, which are processed 100% on-device and contextually separated into Diary entries, Tasks, or Reference Notes. Zero cloud dependencies, complete offline reliability, and strict bilingual optimization for English and Canadian/Quebec French.

## Core Value

Instant, private, offline voice capture that automatically organizes thoughts into the right place — so users never lose an idea.

## Requirements

### Validated

- ✓ Single-tap voice capture with instant start and haptic feedback — v1.0
- ✓ 100% local on-device speech-to-text processing (EN/FR-CA) — v1.0
- ✓ Automatic contextual classification (Diary / Task / Reference Note) with manual override — v1.0
- ✓ Local encrypted storage with zero cloud dependencies (Realm + MMKV/Keychain) — v1.0
- ✓ Full offline reliability — v1.0
- ✓ Bilingual support: English + Canadian/Quebec French — v1.0
- ✓ Review and edit captured entries — v1.0
- ✓ Browse/search organized entries by type — v1.0
- ✓ Task management (complete/incomplete) — v1.0
- ✓ Dark/light mode with system follow + manual override — v1.0
- ✓ Thought Shredder transition + motion polish — v1.0
- ✓ Biometric unlock (local auth) + interruption-safe recording — v1.0
- ✓ Skia-accelerated voice visualization — v1.0
- ✓ Deterministic integration tests (Jest + RTL, 123 tests) — v1.0

### Active

- [ ] Daily reminder to capture a thought (NOTF-01)
- [ ] Export entries to text/JSON (EXPT-01)
- [ ] Basic statistics (streaks, entry count, word count) (STAT-01)
- [ ] Language switch in settings (MULT-01)
- [ ] Detox E2E execution on emulator/device
- [ ] Native-device verification of Thought Shredder animation

### Out of Scope

- Cloud sync or backup — privacy-first means local-only storage
- Social/sharing features — personal utility only
- Web or desktop clients — mobile-first, mobile-only for v1
- Media attachments (photos, videos) — text/voice only

## Context

Built with React Native (Expo CNG / Prebuild Workflow) targeting the New Architecture (Fabric, JSI, TurboModules). Views constructed via NativeWind v4 with Tailwind-based utility styling. State flows through Zustand with transient memory isolation for live transcription — non-reactive variables bypass the React tree to minimize redraws during recording. Realm handles local persistence with deterministic single-key indexing; encryption via MMKV + Keychain. On-device STT via react-native-whisper (bilingual EN/FR-CA). Motion driven by Reanimated + Moti native worklets; complex vector UI states (mic-to-equalizer morphing) rendered via Rive on the GPU. Voice viz runs on Skia canvases, entirely GPU-side. List optimization via @shopify/flash-list. Background tasks via expo-task-manager + expo-background-fetch. **Audio is ephemeral — raw files are discarded immediately after transcription; only text persists.**

The app targets users who think aloud: journalers, note-takers, task-capturers who want friction-free capture without worrying about where their data goes.

## Current State

**Shipped:** v1.0 MVP (2026-08-07, tagged v1.0) — 5 phases, 15 plans, 49/49 requirements validated.
**Codebase:** Expo (New Architecture) + TypeScript; ~25 src services/hooks/stores; 123 Jest tests; web fallback build; Detox scaffold.
**Known deferred:** Detox execution, web model readiness messaging, shimmer animation sweep, shredder native visual run.

## Next Milestone Goals (v1.1)

- Daily reminder to capture a thought (local notifications)
- Export entries to text/JSON
- Basic statistics (streaks, entry count, word count)
- Language switch in settings (v1 auto-detects from speech)
- Detox E2E execution and native-device verification passes

## Constraints

- **Privacy**: All data must be stored and processed locally with encryption — zero cloud dependency
- **Offline**: Full functionality must work without internet connectivity
- **Performance**: Voice capture must start instantly; transcription must feel real-time; UI stays at max refresh even under heavy ML load (native worker isolation)
- **Bilingual**: EN and FR/CA must be first-class, not afterthoughts
- **Mobile**: iOS and Android via Expo CNG (prebuild)
- **Architecture**: React Native New Architecture (Fabric, JSI, TurboModules)
- **Security**: Biometric bility (expo-local-authentication) on entry; encryption keys in Keychain

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expo CNG (Prebuild) | Managed workflow + native module support for ML, Rive, Skia | ✓ Locked |
| React Native New Architecture | Fabric + JSI for synchronous native channels; required by all ML libraries | ✓ Locked |
| NativeWind v4 | Tailwind-style utility classes, fast refresh, CSS-like DX | ✓ Locked |
| Zustand + transient isolates | Lightweight state; live transcription bypasses React tree to avoid redraws | ✓ Locked |
| Realm (not SQLite/Drizzle) | Single-key indexing sub-10ms; native mobile-first DB | ✓ Locked |
| react-native-mmkv + keychain | Fast KV storage for keys + secure encryption via Keychain | ✓ Locked |
| react-native-whisper | Bilingual on-device STT (EN + FR/CA) | ✓ Locked |
| Reanimated + Moti | Native-thread spring worklets; staggered layout animations | ✓ Locked |
| @rive/react-native | GPU-rendered vector state transitions (mic-to-equalizer, etc.) | ✓ Locked |
| @shopify/react-native-skia | GPU canvas for voice visualization, bypasses React render cycle | ✓ Locked |
| @shopify/flash-list | High-performance list rendering for entry browse | ✓ Locked |
| expo-task-manager + background-fetch | Headless background transcription daemons | ✓ Locked |
| expo-local-authentication | Biometric unlock on app entry | ✓ Locked |
| expo-haptics | Physical haptic feedback mapped to spatial UI transitions | ✓ Locked |
| Jest + RTL + Detox | Integration tests (sentence slicing, bilingual token mapping) + native-thread E2E | ✓ Locked |

---

*Last updated: 2026-08-07 after v1.0 milestone*
