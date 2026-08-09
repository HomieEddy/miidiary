<!-- generated-by: gsd-doc-writer -->
# Dear Diary (miidiary)

A privacy-first, offline-first mobile app for instant voice capture that automatically organizes your thoughts into diary entries, tasks, and notes — processed entirely on-device with zero cloud dependencies.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd miidiary

# Install dependencies (runs postinstall: patch-package automatically)
npm install

# Prebuild native code (required for Expo CNG / New Architecture)
npx expo prebuild
```

> **After prebuild**, re-apply the single manual native edit: `ReactNativePerformance.onAppStarted()` in `MainActivity.onCreate()` (see `docs/ARCHITECTURE.md` — the `android/` folder is gitignored).

## Quick Start

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Run on Android or iOS:**
   ```bash
   npm run android
   # or
   npm run ios
   ```

3. **Run tests to verify your setup:**
   ```bash
   npm test
   ```

## Usage

Dear Diary organizes your captured thoughts into four tabs accessed via the bottom navigation bar:

| Tab | Purpose |
|-----|---------|
| **Home** | Central hub — single-button voice capture entry point |
| **Diary** | Chronological timeline of personal diary entries |
| **Tasks** | Action items, to-dos, and follow-ups extracted from voice notes |
| **Digests** | Weekly and monthly reflective summaries |

Voice recordings are ephemeral — raw audio is discarded immediately after on-device transcription. Only the transcribed text persists in encrypted local storage.

### Web (browser) support

The app also runs in the browser (`npm run web`, or open `http://localhost:8081` while the dev server runs) — useful for UI exploration. Web caveats:

- **Data does not persist** — the web storage twin is an in-memory Map; reloads wipe everything (the phone's Realm data is not shared).
- **Voice recording is unavailable** — expo-audio has no web recorder; taps show a clean error.
- **Biometric gate auto-unlocks** — there is no hardware on web.

### Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | React Native (New Architecture) via Expo CNG |
| Styling | NativeWind v4 + Tailwind utility classes (WCAG-verified tokens) |
| State | Zustand (global) |
| Persistence | Realm (encrypted) + MMKV / Keychain |
| Speech-to-Text | react-native-whisper (bilingual EN / FR-CA) |
| Motion | Reanimated (worklets, reduced-motion aware) |
| Audio Visualization | Skia (GPU canvas) |
| Navigation | Expo Router (file-based) + custom Instagram-style tab bar |
| Biometrics | expo-local-authentication |
| Testing | Jest + @testing-library/react-native |
| Dependency patching | patch-package (postinstall) |

## Documentation

- **docs/GETTING-STARTED.md** — Prerequisites, installation, first run, common setup issues.
- **docs/DEVELOPMENT.md** — Build commands, code style, branch and commit conventions, PR process.
- **docs/ARCHITECTURE.md** — System architecture, data flow, key abstractions, native-specific notes.
- **docs/CONFIGURATION.md** — Config files, theme tokens, environment behavior.
- **docs/TESTING.md** — Test framework, writing tests, test inventory.

## License

This project is private software. All rights reserved.

<!-- VERIFY: No public license file exists — the project is not open source. -->
