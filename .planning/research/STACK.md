# Technology Stack

**Project:** Dear Diary
**Defined:** 2026-05-17
**Status:** Locked by architecture specification

## System Stack Matrix

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **View Construction** | NativeWind | v4 | Tailwind-style utility-first styling with fast refresh |
| **State Pipeline** | Zustand | Latest | Lightweight reactive state; transient non-reactive isolates for live transcription |
| **Motion Drivers** | React Native Reanimated + Moti | Latest | Native-thread spring worklets, staggered layout animations, kinematic scaling |
| **Local Persistence** | @realm/react | Latest | On-device object DB with deterministic single-key indexing (<10ms queries) |
| **On-Device STT** | react-native-whisper | Latest | Bilingual speech-to-text (EN + FR/CA) via whisper.cpp bindings |
| **List Optimization** | @shopify/flash-list | Latest | High-performance virtualized list rendering for entry browse |
| **Secure Storage** | react-native-mmkv + react-native-keychain | Latest | Fast KV store + AES encryption keys in iOS Keychain / Android Keystore |
| **Biometric Security** | expo-local-authentication | Latest | Biometric unlock on app entry |
| **Headless Daemons** | expo-task-manager + expo-background-fetch | Latest | Background transcription, model download management |
| **Vector UI States** | @rive/react-native | Latest | GPU-rendered vector state machines (mic-to-equalizer morphing) |
| **Voice Visualization** | @shopify/react-native-skia | Latest | GPU canvas for real-time amplitude waveform rendering |
| **Haptics** | expo-haptics | Latest | Physical haptic impact patterns mapped to spatial UI transitions |

## Core Framework

| Technology | Purpose |
|------------|---------|
| React Native New Architecture (Fabric, JSI, TurboModules) | Synchronous native data channels, native view mounting |
| Expo CNG (Continuous Native Workflow / prebuild) | Managed DX with native module support for ML, Rive, Skia |
| Expo Router | File-based navigation |

## Verification Framework

| Tool | Purpose |
|------|---------|
| Jest + @testing-library/react-native | Deterministic integration tests: sentence slicing, bilingual token mapping, strict string matrix assertions |
| Detox | E2E native-thread tests: physical swipe gestures, device shakes, mock audio pipelines under heavy load |

## Data Optimization & Memory Topography

- **Deterministic Indexing**: Realm models configure explicit single-key index attributes on query boundaries (timestamp, category) — data fetching under 10ms
- **Transient Memory Isolation**: Live transcriptions stream into non-reactive Zustand variable allocations, bypassing the React component tree to minimize redraws during recording

## Thread-Safe Optimization Safeguards

- **Native UI Worker Isolation**: UI animations execute inside Reanimated native layout spaces — even under heavy background ML classification, interface frames stay locked at max device refresh
- **Skia Canvas Pipelines**: Voice visualization runs inside Skia spaces; input amplitude data modifies vector path math directly on the GPU canvas, completely bypassing React rendering cycles
- **Progressive Skeletal Reveals**: Dense dashboards display layout structures immediately using NativeWind shimmer states while Realm queries evaluate records asynchronously

## Key Overrides vs. Initial Research

| Area | Initial Research | Locked Choice |
|------|-----------------|---------------|
| Styling | (not specified) | NativeWind v4 |
| Database | expo-sqlite + SQLCipher + Drizzle ORM | @realm/react |
| Secure storage | expo-secure-store | react-native-mmkv + react-native-keychain |
| Animations | react-native-reanimated | Reanimated + Moti + Rive |
| Voice viz | (not specified) | @shopify/react-native-skia |
| List rendering | (not specified) | @shopify/flash-list |
| Background tasks | (not specified) | expo-task-manager + expo-background-fetch |
| E2E testing | Maestro (optional) | Detox |
| STT | whisper.rn | react-native-whisper |

---

*Stack defined: 2026-05-17 — locked by architecture specification*
