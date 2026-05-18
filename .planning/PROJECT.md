# Dear Diary

## What This Is

A premium, high-polish, local-first mobile utility for "Record and Forget" voice capture. Users tap a single button to stream their thoughts, which are processed 100% on-device and contextually separated into Diary entries, Tasks, or Reference Notes. Zero cloud dependencies, complete offline reliability, and strict bilingual optimization for English and Canadian/Quebec French.

## Core Value

Instant, private, offline voice capture that automatically organizes thoughts into the right place — so users never lose an idea.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Expo CNG project scaffold with all locked dependencies installed and linking
- [ ] Theme system wired (tailwind.config.js, colors, typography, fonts)
- [ ] Expo Router tab navigation (Home, Diary, Tasks, Digests)
- [ ] Basic render test passing
- [ ] Single-button voice capture with instant recording start
- [ ] 100% local on-device speech-to-text processing
- [ ] Automatic contextual classification (Diary / Task / Reference Note)
- [ ] Local encrypted storage with zero cloud dependencies
- [ ] Full offline reliability
- [ ] High-fidelity tactile motion animations (Reanimated + Moti + Rive)
- [ ] Bilingual support: English + Canadian/Quebec French
- [ ] Review and edit captured entries
- [ ] Browse/search organized entries by type
- [ ] Deterministic integration tests (Jest + RTL) + E2E via Detox
- [ ] Skia-accelerated voice visualization
- [ ] Biometric unlock (local auth)

### Out of Scope

- Cloud sync or backup — privacy-first means local-only storage
- Social/sharing features — personal utility only
- Web or desktop clients — mobile-first, mobile-only for v1
- Media attachments (photos, videos) — text/voice only

## Context

Built with React Native (Expo CNG / Prebuild Workflow) targeting the New Architecture (Fabric, JSI, TurboModules). Views constructed via NativeWind v4 with Tailwind-based utility styling. State flows through Zustand with transient memory isolation for live transcription — non-reactive variables bypass the React tree to minimize redraws during recording. Realm handles local persistence with deterministic single-key indexing; encryption via MMKV + Keychain. On-device STT via react-native-whisper (bilingual EN/FR-CA). Motion driven by Reanimated + Moti native worklets; complex vector UI states (mic-to-equalizer morphing) rendered via Rive on the GPU. Voice viz runs on Skia canvases, entirely GPU-side. List optimization via @shopify/flash-list. Background tasks via expo-task-manager + expo-background-fetch. **Audio is ephemeral — raw files are discarded immediately after transcription; only text persists.**

The app targets users who think aloud: journalers, note-takers, task-capturers who want friction-free capture without worrying about where their data goes.

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

*Last updated: 2026-05-17 — added Phase 0 scaffolding requirements*
