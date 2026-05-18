<!-- generated-by: gsd-doc-writer -->
# Configuration

Dear Diary (miidiary) is a zero-cloud React Native application built with Expo SDK 54. It has no external service dependencies — all data is stored and processed on-device. Configuration is managed through framework config files, environment variables (limited scope), and theme tokens.

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
| `app.json` | Expo app manifest — defines the app name (`"Dear Diary"`), slug (`"dear-diary"`), version, icon paths, splash screen, platform settings (iOS/Android), plugins, and deep linking scheme (`dear-diary://`). |
| `package.json` | Project metadata, dependency versions, and npm scripts (`start`, `android`, `ios`, `web`, `test`). The `"private": true` flag prevents accidental publishing. |

### Build & Bundler Configuration

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration — extends `expo/tsconfig.base` with `strict: true`, sets up the `@/` path alias mapping to `./src/*`. |
| `babel.config.js` | Babel configuration — always uses `babel-preset-expo` <!-- VERIFY: babel-preset-expo is a transitive dependency of the Expo SDK; not listed directly in package.json. -->. Conditionally includes the `nativewind/babel` plugin (disabled when `NODE_ENV === "test"`). |
| `babel.jest.js` | Babel configuration for Jest test runner specifically (does not include `nativewind/babel`). |
| `metro.config.js` | Metro bundler configuration — extends the Expo default config and adds the `@/` path alias resolver pointing to `./src`. |
| `global.css` | Tailwind CSS entry point — imports `@tailwind base`, `components`, and `utilities` directives. |

### Test Configuration

| File | Purpose |
|------|---------|
| `jest.config.js` | Jest test runner configuration — uses `jest-expo` preset, maps `@/` to `src/`, and sets `NODE_ENV=test`. Test files are expected in `src/tests/` matching `*.test.{ts,tsx}`. |

### Design Theme Configuration

| File | Purpose |
|------|---------|
| `theme/tailwind.config.js` | Tailwind theme extension — defines custom color palette (background, foreground, primary, secondary, accent, card, border, etc.), font families (Nunito, Fredoka, Playfair Display, JetBrains Mono), border radii, and box shadows. Also imports `nativewind/preset` and enables dark mode via class strategy. |
| `tailwind.config.js` | Root Tailwind config — re-exports `theme/tailwind.config.js`. |
| `theme/colors.ts` | TypeScript color constants matching the Tailwind palette, plus `categoryBadge` mappings for Diary, Task, and Note categories. |
| `theme/typography.ts` | TypeScript font name constants and weight presets. |

## Required vs Optional Settings

### Configurations That Cause Startup Failure If Missing

| Setting | Error Scenario |
|---------|---------------|
| `app.json` `expo.name` | App name must be defined. |
| `app.json` `expo.slug` | Required for Expo builds and OTA updates. |
| `app.json` `expo.plugins` (includes `expo-router`) | Absence of `expo-router` plugin will break file-based routing. |
| Font asset files (`src/assets/fonts/*.ttf`) | The `RootLayout` component in `src/app/_layout.tsx` calls `useFonts()` for Nunito, Fredoka, Playfair Display, and JetBrains Mono. If any `.ttf` file is missing, `error` will be set and the splash screen will hide, but fonts will be unavailable. |

### Environment-Dependent Behavior

| Setting | Behavior |
|---------|----------|
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

| Setting | Default | Defined In |
|---------|---------|------------|
| Background color | `#FDF8F0` | `theme/tailwind.config.js` |
| Foreground (text) color | `#2A2631` | `theme/tailwind.config.js` |
| Primary color | `#FF6B9E` | `theme/tailwind.config.js` |
| Border color | `#2A2631` | `theme/tailwind.config.js` |
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
- A separate `babel.jest.js` config file provides a minimal Babel setup (just `babel-preset-expo`) for Jest runs.

### Dark Mode

Dark mode is supported via NativeWind's class-based strategy (`darkMode: "class"` in `theme/tailwind.config.js`). It is not tied to environment variables — switching is controlled programmatically by toggling a `dark` class at runtime.

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

<!-- VERIFY: The Android package name `com.anonymous.miidiaryexpoinit` is a default Expo value. Update this before releasing to app stores. -->
