<!-- generated-by: gsd-doc-writer -->
# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 18.0 (LTS recommended) | Required by Expo SDK 54. |
| npm | >= 9.0 | Bundled with Node.js. |
| Git | Latest | For version control. |
| iOS (optional) | Xcode 15+ with CocoaPods | Required to run on iOS simulator or device. |
| Android (optional) | JDK 17+, Android Studio with Android SDK | Required to run on Android emulator or device. |

Expo SDK 54 (used by this project) requires Node.js 18+. No `.nvmrc` or `.node-version` file is committed — it is recommended to use a Node version manager to keep your runtime current.

## Installation Steps

Follow these steps to get the project running on your local machine.

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd miidiary
   ```

   <!-- VERIFY: Replace `<repository-url>` with the actual remote URL. -->

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install dependencies:**

   `npm install` runs the `postinstall` script, which applies the committed `patch-package` patches automatically.

4. **Prebuild native code:**

   Because the project uses Expo CNG (Continuous Native Generation) with the React Native New Architecture (Fabric), you must generate native project files before the first build:

   ```bash
   npx expo prebuild
   ```

   This command creates `ios/` and `android/` directories from the Expo config in `app.json`. These directories are gitignored and regenerated on each build. **After prebuild**, re-apply the one manual native edit in `android/app/src/main/java/com/anonymous/miidiaryexpoinit/MainActivity.kt`: call `ReactNativePerformance.onAppStarted()` in `onCreate` before `super.onCreate` (see ARCHITECTURE.md).

4. **(Optional) Install CocoaPods for iOS:**

   If you plan to develop on iOS, install the CocoaPods dependencies after prebuild:

   ```bash
   cd ios && pod install && cd ..
   ```

## First Run

Start the Expo development server:

```bash
npm start
```

This starts the Metro bundler and opens the Expo developer tools in your browser. From there, you can:

- Press **`a`** to open on an Android emulator or connected device.
- Press **`i`** to open on an iOS simulator (macOS only).
- Scan the QR code with the Expo Go app (limited — some native modules require development builds).

To run directly on a platform without the interactive menu:

```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

Run the test suite to verify everything is working:

```bash
npm test
```

You should see Jest output indicating all existing tests pass.

## Common Setup Issues

### 1. Missing native modules or build errors

**Symptom:** The app fails to start with errors like `Native module cannot be null` or Metro bundler errors related to native dependencies.

**Solution:** Ensure you have run `npx expo prebuild` after `npm install`. The project uses native modules (Realm, Skia, Reanimated, whisper.rn, MMKV, Keychain) that require native project files to be generated. Run:

```bash
npx expo prebuild --clean
```

If the issue persists, delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
npx expo prebuild
```

### 2. Font files not found

**Symptom:** The splash screen stays visible indefinitely or fonts render incorrectly.

**Solution:** The root layout (`src/app/_layout.tsx`) loads four font files via `expo-font`:

- `src/assets/fonts/Nunito.ttf`
- `src/assets/fonts/Fredoka.ttf`
- `src/assets/fonts/PlayfairDisplay.ttf`
- `src/assets/fonts/JetBrainsMono.ttf`

Verify that all four `.ttf` files exist in `src/assets/fonts/`. If they are missing, add the font files to that directory. The app hides the splash screen and renders a recoverable error view instead of a blank screen.

### 3. iOS build fails with CocoaPods errors

**Symptom:** `npm run ios` fails with Pod installation errors.

**Solution:** Ensure CocoaPods is installed and up to date:

```bash
sudo gem install cocoapods
```

Then regenerate pods:

```bash
cd ios && pod install --repo-update && cd ..
```

### 4. Android build fails with SDK/NDK errors

**Symptom:** `npm run android` fails with Gradle errors related to missing SDK components.

**Solution:** Ensure you have the following installed in Android Studio:

- Android SDK Platform 34 or later
- Android SDK Build-Tools 34+
- Android SDK Command-line Tools (latest)

Set the `ANDROID_HOME` environment variable to your Android SDK path.

## Next Steps

Once the app is running, continue with these resources:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Understand the system architecture, component diagram, and data flow.
- **[CONFIGURATION.md](./CONFIGURATION.md)** — Learn about configuration files, theme tokens, and environment settings.
- **DEVELOPMENT.md** — Local development setup, build commands, code style, and PR process.
- **TESTING.md** — Test framework details, writing new tests, and CI integration.
- **README.md** (project root) — Quick overview, installation, and usage summary.
