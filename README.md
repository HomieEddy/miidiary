<!-- generated-by: gsd-doc-writer -->
# Dear Diary (miidiary)

A privacy-first, offline-first mobile app for instant voice capture that automatically organizes your thoughts into diary entries, tasks, and notes — processed entirely on-device with zero cloud dependencies.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd miidiary

# Install dependencies
npm install

# Prebuild native code (required for Expo CNG / New Architecture)
npx expo prebuild
```

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

### Tech Stack

| Concern | Technology |
|---------|-----------|
| Framework | React Native (New Architecture) via Expo CNG |
| Styling | NativeWind v4 + Tailwind utility classes |
| State | Zustand (global) + transient isolates (live transcription) |
| Persistence | Realm (encrypted) + MMKV / Keychain |
| Speech-to-Text | react-native-whisper (bilingual EN / FR-CA) |
| Motion | Reanimated + Moti (native worklet thread) |
| Vector UI | Rive (GPU state machines) |
| Audio Visualization | Skia (GPU canvas) |
| Lists | @shopify/flash-list |
| Navigation | Expo Router (file-based) |
| Biometrics | expo-local-authentication |
| Testing | Jest + @testing-library/react-native (unit), Detox (E2E) |

## License

This project is private software. All rights reserved.

<!-- VERIFY: No public license file exists — the project is not open source. -->
