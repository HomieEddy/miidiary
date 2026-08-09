<!-- generated-by: gsd-doc-writer -->
# Configuration

Dear Diary (miidiary) is a zero-cloud React Native application built with Expo SDK 54. It has no external service dependencies -- all data is stored and processed on-device. Configuration is managed through framework config files, environment variables (limited scope), and theme tokens.

## Environment Variables

The project uses very few environment variables. By default, no `.env` file is required to run the application.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Controls Babel plugin behavior. When set to `test`, the `nativewind/babel` plugin is disabled in `babel.config.js`. Set automatically by `jest.config.js` to `test` during test runs. |

**Note:** The `.gitignore` includes `.env*.local` patterns, indicating that local environment files (e.g., `.env.local`) may be used for developer-specific overrides but are not committed to version control. No `.env.example` or `.env.*` files are present in the repository.

## Config File Format

Below are the configuration files that control the project's behavior, organized by concern.

### Application Configuration

| File | Purpose |
|------|---------|
| `app.json` | Expo app manifest -- defines the app name (`"Dear Diary"`), slug (`"dear-diary"`), version, icon paths, splash screen, platform settings (iOS/Android), plugins, and deep linking scheme (`dear-diary://`). |
| `package.json` | Project metadata, dependency versions, and npm scripts (`start`, `android`, `ios`, `web`, `test`). The `"private": true` flag prevents accidental publishing. The `postinstall` script runs `patch-package`. |

### Build & Bundler Configuration

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration -- extends `expo/tsconfig.base` with `strict: true`, sets up the `@/` path alias mapping to `./src/*`. |
| `babel.config.js` | Babel configuration -- always uses `babel-preset-expo`, and conditionally includes the `nativewind/babel` plugin (disabled when `NODE_ENV === "test"`). |
| `metro.config.js` | Metro bundler configuration -- extends the Expo default config and adds the `@/` path alias resolver pointing to `./src`. |
| `global.css` | Tailwind CSS entry point -- imports `@tailwind base`, `components`, and `utilities` directives and defines the light/dark CSS variable tokens. |
| `patches/` | patch-package patches applied automatically by the `postinstall` script. Currently patches `@shopify/react-native-performance` for Kotlin strictness under RN 0.81. |

### Test Configuration

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest test runner configuration -- uses `jest-expo` preset, maps `@/` to `src/`, sets `NODE_ENV=test`, and registers `jest.setup.js`. Test files are expected in `src/tests/` matching `*.test.{ts,tsx}`. |
| `jest.setup.js` | Global Jest setup -- registers the official `react-native-safe-area-context` mock (screens rely on insets for tab-bar clearance). |

### Design Theme Configuration

| File | Purpose |
|------|---------|
| `theme/tailwind.config.js` | Tailwind theme extension -- defines custom color palette (background, foreground, primary, secondary, accent, destructive + foreground, card, border, etc.), font families (Nunito, Fredoka, Playfair Display, JetBrains Mono), border radii, and box shadows (theme-aware `--shadow`). Also imports `nativewind/preset` and enables dark mode via class strategy. |
| `tailwind.config.js` | Root Tailwind config -- re-exports `theme/tailwind.config.js`. |
| `theme/colors.ts` | TypeScript color constants matching the Tailwind palette, per-theme dark counterparts, and themed helper functions (`mutedForegroundHex`, `destructiveHex`, `primaryTextHex`, `chartColorsHex`, ...) for imperative (non-Tailwind) color usage. |

## Required vs Optional Settings

### Configurations That Cause Startup Failure If Missing

| Setting | Error Scenario |
|---------|---------------|
| `app.json` `expo.name` | App name must be defined. |
| `app.json` `expo.slug` | Required for Expo builds and OTA updates. |
| `app.json` `expo.plugins` (includes `expo-router`) | Absence of `expo-router` plugin will break file-based routing. |
| Font asset files (`src/assets/fonts/*.ttf`) | The `RootLayout` component in `src/app/_layout.tsx` calls `useFonts()` for Nunito, Fredoka, Playfair Display, and JetBrains Mono. If any `.ttf` file is missing, `error` is set and the app renders a recoverable error view. |

### Environment-Dependent Behavior

| Setting | Behavior |
|----------|---------|
| `NODE_ENV == "test"` | Disables the `nativewind/babel` plugin in `babel.config.js` (NativeWind class transformation is skipped during Jest runs). |
| `NODE_ENV != "test"` (default) | `nativewind/babel` plugin is active; NativeWind utility classes are transformed. |

## Defaults

### Build defaults

| Setting | Default | Defined In |
|---------|---------|------------|
| Type strictness | `strict: true` | `tsconfig.json` |
| TypeScript base config | `expo/tsconfig.base` | `tsconfig.json` |
| Babel preset | `babel-preset-expo` | `babel.config.js` |
| Metro config | Default Expo config | `@expo/metro-config` |
| Test preset | `jest-expo` | `jest.config.js` |
| Test file pattern | `src/tests/**/*.test.{ts,tsx}` | `jest.config.js` |
| Coverage collection | Disabled | `jest.config.js` `collectCoverage: false` |

### Application defaults

| Setting | Default | Defined In |
|---------|---------|------------|
| Orientation | `portrait` | `app.json` |
| User interface style | `automatic` (light/dark) | `app.json` `userInterfaceStyle` |
| New Architecture (Fabric) | Enabled | `app.json` `newArchEnabled: true` |
| Expo Router header | Disabled (`headerShown: false`) | `src/app/_layout.tsx` |
| Status bar style | `dark` | `src/app/_layout.tsx` |
| App icon | `./assets/icon.png` | `app.json` |
| Splash background color | `#FDF8F0` | `app.json` |
| Android package | `com.anonymous.miidiaryexpoinit` | `app.json` |

### Design token defaults

The theme is WCAG-verified: primary/accent buttons use dark plum foreground (5.53:1 / 7.84:1), muted-foreground is per-theme (5.12:1 light / 5.00:1 dark), destructive is a per-theme pair with its own foreground, and dark-mode borders meet 3:1.

| Setting | Default | Defined In |
|---------|---------|------------|
| Background color | `#FDF8F0` | `global.css` |
| Foreground (text) color | `#2A2631` | `global.css` |
| Primary color | `#FF6B9E` | `global.css` |
| Primary foreground | `#2A2631` (dark plum on pink) | `global.css` |
| Border color | `#2A2631` light / `#7A7280` dark | `global.css` |
| Body font | Nunito | `theme/tailwind.config.js` |
| Heading font | Fredoka | `theme/tailwind.config.js` |
| Serif font | Playfair Display | `theme/tailwind.config.js` |
| Monospace font | JetBrains Mono | `theme/tailwind.config.js` |

## Per-Environment Overrides

### Development vs Production

The project does not define separate `.env.development` or `.env.production` files. The same `app.json` configuration applies across all environments. Expo manages environment segmentation through its own build profiles (development builds vs production builds), configured via EAS Build profiles if set up.

### Test Environment

The test environment is configured via `jest.config.js`, which explicitly sets `process.env.NODE_ENV = "test"`. This triggers:

- `babel.config.js` disables the `nativewind/babel` plugin, since NativeWind transformations are not needed and may cause issues during test rendering.
- `jest.setup.js` registers the official `react-native-safe-area-context` jest mock, so screens that read insets (tab-bar clearance) render in tests without a provider.

### Dark Mode

Dark mode is supported via NativeWind's class-based strategy (`darkMode: "class"` in `theme/tailwind.config.js`). It is not tied to environment variables -- switching is controlled programmatically by toggling a `dark` class at runtime. Dark mode overrides the CSS variables that need different values (background, card, foreground, border, muted, destructive pairs); the rest intentionally keep light values.

### Platform-Specific Configuration

| Platform | Configuration Location |
|----------|----------------------|
| iOS | `app.json` → `expo.ios` — tablet support, status bar appearance |
| Android | `app.json` → `expo.android` — adaptive icon, edge-to-edge, predictive back gesture, status bar |
| Web | `app.json` → `expo.web` — favicon, Metro bundler |

### Android-Specific Build Config

The project generates Android native files via Expo prebuild (`expo prebuild`). The `android/` directory is gitignored and regenerated on each build. Key Android properties are configured in `app.json`:

```json
{
  "android": {
    "edgeToEdgeEnabled": true,
    "predictiveBackGestureEnabled": false,
    "package": "com.anonymous.miidiaryexpoinit"
  }
}
```

**Note:** After prebuild, re-apply the one manual native edit in `MainActivity.onCreate()` (`ReactNativePerformance.onAppStarted()` -- see ARCHITECTURE.md).

<!-- VERIFY: The Android package name `com.anonymous.miidiaryexpoinit` is a default Expo value. Update this before releasing to app stores. -->
