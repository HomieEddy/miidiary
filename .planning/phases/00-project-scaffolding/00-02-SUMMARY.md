# Plan 00-02 Summary: Theme Wiring + Tab Navigation

## Goal
Wire the theme system, create root layout with font loading, build 4-tab Expo Router navigation with UI-SPEC tab bar.

## Completed Tasks

### Task 1: Wire Theme System
- **app.json**: Updated with brand identity (`name: "Dear Diary"`, `slug: "dear-diary"`, `scheme: "dear-diary"`), brand colors (`backgroundColor: "#FDF8F0"`, `primaryColor: "#FF6B9E"`), `userInterfaceStyle: "automatic"`, `expo-router` plugin, iOS/Android status bar colors
- **tailwind.config.js**: Created root re-export pointing to `theme/tailwind.config.js`
- **tsconfig.json**: Added `baseUrl: "."` and `paths: { "@/*": ["./src/*"] }`, excluded `ui-export-react` and `.planning` from compilation
- **metro.config.js**: Created with `@expo/metro-config` and `@/` resolver alias pointing to `./src`
- **App.tsx**: Deleted (replaced by Expo Router `app/` directory)

### Task 2: Root Layout with Font Loading
- **src/app/_layout.tsx**: Created with:
  - `useFonts` loading 4 variable font TTF files (Nunito, Fredoka, Playfair Display, JetBrains Mono)
  - `SplashScreen.preventAutoHideAsync()` at module scope
  - `useEffect` to hide splash on font load/error
  - `<Stack screenOptions={{ headerShown: false }} />` for navigation
  - `<StatusBar style="dark" />`
  - `bg-background` wrapper View

### Task 3: Tab Navigation
- **src/assets/icons/solar.ts**: 6 Solar SVG string constants (home-smile, book-bookmark duotone+bold, check-square duotone+bold, box-minimalistic duotone)
- **src/app/(tabs)/_layout.tsx**: Custom tab bar with:
  - border-4 border-border, rounded-3xl, offset shadow
  - 4 tabs (Home, Diary, Tasks, Digests) with Solar SVG icons via `SvgXml`
  - Active tab: pink icon + label + skewed underline bar (`skew-x-12`)
  - Inactive tab: muted foreground
  - `useRouter().navigate()` for tab switching
  - 12 font weight variants covering all 4 families
- **4 tab route files**: `index.tsx`, `diary.tsx`, `tasks.tsx`, `digests.tsx`
- **4 screen components**: `HomeScreen.tsx`, `DiaryScreen.tsx`, `TasksScreen.tsx`, `DigestsScreen.tsx` with placeholder headings + descriptions

## Files Created
- `src/app/_layout.tsx` (root layout)
- `src/app/(tabs)/_layout.tsx` (tab layout)
- `src/app/(tabs)/index.tsx` (home route)
- `src/app/(tabs)/diary.tsx` (diary route)
- `src/app/(tabs)/tasks.tsx` (tasks route)
- `src/app/(tabs)/digests.tsx` (digests route)
- `src/screens/HomeScreen.tsx`
- `src/screens/DiaryScreen.tsx`
- `src/screens/TasksScreen.tsx`
- `src/screens/DigestsScreen.tsx`
- `src/assets/icons/solar.ts`
- `tailwind.config.js` (root re-export)
- `metro.config.js`

## Files Modified
- `app.json` (brand colors, plugin, scheme)
- `tsconfig.json` (path aliases, excludes)

## Files Deleted
- `App.tsx`

## Verification Results
- app.json: All 7 brand assertions PASS
- tailwind.config.js: Loads with background `#FDF8F0` PASS
- App.tsx deleted PASS
- tsconfig.json `@/*` alias PASS
- `_layout.tsx`: useFonts, SplashScreen, bg-background, headerShown PASS
- Tab layout: border-border, rounded-3xl, skew-x-12, text-[10px], SvgXml, useRouter, onPress PASS
- All 4 screens: default export + font-heading PASS
- Solar icons: All 6 exported PASS
- TypeScript: `npx tsc --noEmit` — 0 errors PASS

## Notes
- Fonts downloaded as variable fonts (single TTF per family with all weights)
- `@/` path alias configured in tsconfig + metro.config.js for Metro bundler resolution
- iOS prebuild not available on Windows — deferred architecturally
