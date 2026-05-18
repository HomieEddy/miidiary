# Plan 00-01: Expo init + deps + NativeWind + fonts

**Status:** Complete
**Date:** 2026-05-17

## What Was Built

1. **Expo project initialized** using `create-expo-app` with `blank-typescript` template (Expo SDK 54, React Native 0.81.5, New Architecture enabled)
2. **Native prebuild completed** — `android/` native project directory generated
3. **All 25 locked dependencies installed** including nativewind, reanimated, moti, Skia, flash-list, realm, MMKV, keychain, zustand, svg, expo-router, and rive-react-native
4. **NativeWind v4 configured** — `babel.config.js` with `nativewind/babel` plugin, `global.css` with 3 `@tailwind` directives, `nativewind-env.d.ts` for TypeScript support
5. **Source directory structure created** — all 11 `src/` subdirectories per AGENTS.md
6. **Font files bundled** — 4 variable TTF files (Nunito, Fredoka, Playfair Display, JetBrains Mono) in `src/assets/fonts/`

## Notes
- `rive-react-native@9.8.3` installed (not `@rive/react-native` which doesn't exist on npm — actual package name is `rive-react-native`)
- iOS prebuild not available on Windows (requires macOS)
- Fonts downloaded as variable fonts (single file per family containing all weights) — modern Google Fonts format
- `main` entry set to `expo-router/entry` (will be wired in 00-02)
