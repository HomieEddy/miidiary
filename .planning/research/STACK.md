# Technology Stack

**Project:** Dear Diary
**Researched:** 2026-05-17

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Native | 0.83+ (New Architecture) | Mobile UI framework | New Architecture (Fabric/JSI/TurboModules) required by all ML libraries |
| Expo SDK | 55+ | Managed development + build tooling | `expo install`, EAS Build, OTA updates; prebuild workflow is standard |
| Expo Router | 4.x | File-based navigation | Convention-based routing, deep linking ready |
| TypeScript | 5.x | Type safety | Required for Drizzle ORM, service layer interfaces |

### Audio
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| expo-audio | 1.1.0+ | Audio recording and playback | Built-in Expo SDK; background recording support since v1.1.0; works in managed workflow with prebuild |
| expo-file-system | Latest | Audio file storage | Download models, save audio recordings, cache management |

### Speech-to-Text
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| whisper.rn | 0.6.0 | On-device STT via whisper.cpp | Most mature RN binding; real-time + file transcription; Core ML on iOS; VAD support |
| Model: Whisper `base` (multilingual) | — | STT model | 142 MB, best speed/accuracy balance; supports 99 languages including French |

### NLP Classification
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Option A (Recommended v1):** react-native-executorch + SmolLM2 1.7B Q4 | Latest | On-device LLM inference | Software Mansion-maintained; PyTorch ecosystem; hooks API; CoreML/Vulkan acceleration |
| **Option B (iOS-heavy):** expo-ondevice-ai | 0.1.x | OS-provided FM classify API | Zero download; Apple Intelligence / ML Kit; tiny bundle impact |
| **Option C (Lightweight):** ONNX Runtime + fine-tuned MiniLM | — | Dedicated classification model | Smallest (80 MB); fastest inference; requires ML expertise to create |

**Recommendation:** Start with Option A (small LLM prompt). It handles bilingual text naturally and doesn't require ML training expertise. The 1 GB model download is a one-time cost.

### Database & Encryption
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| expo-sqlite | Latest | Relational local storage | Built-in Expo SDK; supports SQLCipher for transparent encryption |
| SQLCipher (via config plugin) | — | 256-bit AES encryption | `useSQLCipher: true` in app.json plugin; industry standard for mobile encrypted SQLite |
| expo-secure-store | Latest | Encryption key storage | iOS Keychain / Android Keystore; store DB encryption key securely |
| Drizzle ORM | 0.40+ | Type-safe SQL queries | Type-safe, migration support, Expo dev tools plugin; works with expo-sqlite |

### Supporting Libraries
| Library | Purpose | When to Use |
|---------|---------|-------------|
| expo-dev-client | Local development builds | Required because Expo Go cannot run native ML modules |
| @react-native-community/netinfo | Network status detection | Not needed for v1 (no sync), useful if adding cloud features later |
| expo-haptics | Haptic feedback on record/stop | Premium feel requirement |
| react-native-reanimated | High-fidelity animations | Motion animations requirement |
| expo-splash-screen | Managed startup screen | Show init progress while models load |
| expo-notifications | Local notifications (optional) | Notify when background processing completes |

### Development Tools
| Tool | Purpose |
|------|---------|
| EAS Build | CI/CD for dev builds + app store submission |
| EAS Submit | App Store Connect / Play Store submission |
| ESLint + Prettier | Code quality |
| Jest + React Native Testing Library | Unit + component tests |
| Maestro (optional) | E2E testing for critical flows |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| LLM Runtime | react-native-executorch | react-native-ai (Callstack) | ExecuTorch has broader model support (vision, speech, not just LLM); react-native-ai is iOS-primary |
| LLM Runtime | react-native-executorch | local-llm-rn | local-llm-rn is newer, smaller community; ExecuTorch is Software Mansion (well-known RN contributor) |
| STT | whisper.rn | expo-speech-transcriber | whisper.rn has multilingual support (needed for FR); expo-speech-transcriber is English-only |
| STT | whisper.rn | react-native-ai Apple provider | Apple SpeechAnalyzer is iOS 26+ only; no Android; would need two solutions |
| Database | expo-sqlite | op-sqlite | op-sqlite can't use Expo Go either; expo-sqlite has broader Expo ecosystem support |
| Database | expo-sqlite + SQLCipher | WatermelonDB | WatermelonDB adds sync protocol overhead we don't need (no cloud) |
| ORM | Drizzle ORM | Raw SQL | Drizzle gives type safety + migrations + dev tools; minimal overhead |
| Classification | Small LLM prompt | Fine-tuned BERT | LLM approach is zero-config for bilingual; BERT needs training data and ML pipeline |

## Installation Baseline

```bash
# Core
npx expo install expo-router expo-linking expo-constants
npx expo install expo-audio expo-file-system expo-haptics
npx expo install expo-sqlite expo-secure-store
npx expo install expo-dev-client expo-splash-screen

# ML (post-prebuild; requires npx expo prebuild)
npx expo install whisper.rn
npx expo install react-native-executorch

# Dev dependencies
npm install -D drizzle-orm expo-drizzle-studio-plugin
npm install -D typescript @types/react

# Animations
npx expo install react-native-reanimated
```

## Sources

- Expo SDK 55 docs: [docs.expo.dev](https://docs.expo.dev)
- expo-audio background recording: [docs.expo.dev/versions/unversioned/sdk/audio](https://docs.expo.dev/versions/unversioned/sdk/audio) — HIGH confidence
- expo-sqlite SQLCipher: [docs.expo.dev/versions/latest/sdk/sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite) — HIGH confidence
- whisper.rn v0.6.0: [github.com/mybigday/whisper.rn](https://github.com/mybigday/whisper.rn) — HIGH confidence (754 stars, active)
- react-native-executorch: [expo.dev/blog](https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch) — HIGH confidence (Software Mansion)
- Drizzle ORM + Expo: [expo.dev/blog/modern-sqlite-for-react-native-apps](https://expo.dev/blog/modern-sqlite-for-react-native-apps) — HIGH confidence
