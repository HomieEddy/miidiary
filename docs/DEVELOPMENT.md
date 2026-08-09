<!-- generated-by: gsd-doc-writer -->

# Development

This document covers how to set up, build, and contribute to the Dear Diary project.

## Local Setup

### Prerequisites

- **Node.js** >= 18.0.0 (check `.nvmrc` or `.node-version` if present)
- **npm** (comes with Node.js)
- **Expo CLI**: `npx expo` (installed on-demand)
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)
- A physical device or emulator/simulator for running the app

### Setup Steps

1. **Fork and clone the repository:**

   ```bash
   git clone <your-fork-url>
   cd miidiary
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Prebuild native code:**

   This project uses Expo Continuous Native Generation (CNG), which means native projects (`android/`, `ios/`) are generated from `app.json` and never committed.

   ```bash
   npx expo prebuild
   ```

4. **Start the development server:**

   ```bash
   npm start
   ```

   After heavy edits or cache weirdness, restart with `npx expo start --clear` so connected devices receive a full rebundle instead of stale deltas.

5. **Run on a device or emulator:**

   ```bash
   npm run android   # Android emulator or device
   # or
   npm run ios       # iOS simulator (macOS only)
   ```

6. **Run tests to verify setup:**

   ```bash
   npm test
   ```

## Build Commands

All npm scripts are defined in `package.json`:

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo development server |
| `npm run android` | Run the app on an Android emulator or connected device |
| `npm run ios` | Run the app on the iOS simulator (macOS only) |
| `npm run web` | Start the Expo dev server with web support |
| `npm test` | Run the Jest test suite |

### Build Pipeline

The project does not have a separate production build script at this stage. Production builds are managed through Expo Application Services (EAS):

```bash
npx eas build --platform android  # Android production build
npx eas build --platform ios      # iOS production build
```
<!-- VERIFY: npx eas build --platform android — EAS CLI (eas) must be installed separately, not in package.json -->
<!-- VERIFY: npx eas build --platform ios — EAS CLI (eas) must be installed separately, not in package.json -->

## Code Style

### TypeScript

- TypeScript is configured with `strict: true` in `tsconfig.json` — all strict checks are enabled.
- The project extends `expo/tsconfig.base` for base Expo TypeScript settings.
- No `any` type is permitted — use `unknown` with type guards or Zod for runtime validation.
- All function return types must be explicit (no inferred returns).

### Linting & Formatting

The project currently has **no separate linting or formatting tool** configured (no ESLint, Prettier, or Biome config files are present in the repository). Code quality is enforced through:

- **TypeScript strict mode** catching type-level issues at compile time.
- **Coding conventions** documented in `AGENTS.md` covering:
  - File naming (PascalCase for components, camelCase for hooks/services)
  - Import order (React/Expo → third-party → internal → assets)
  - Component rules (screens are thin, components are dumb, services are pure)
  - Export conventions (default export for screens only, named exports for everything else)
  - NativeWind utility classes for styling; inline `style` for imperative/theme-dependent colors (via the helpers in `theme/colors.ts`)
  - `cn()` utility from `clsx` + `tailwind-merge` for conditional classnames
  - Exception: `PaperTabBar` uses `StyleSheet.create` deliberately — animated style arrays must not reference frozen StyleSheet objects (reanimated 4 limitation, see ARCHITECTURE.md)

To check for TypeScript errors:

```bash
npx tsc --noEmit
```

### NativeWind / Tailwind

All styling uses NativeWind v4 utility classes. The color palette and font tokens are defined in:

- `theme/tailwind.config.js` — design tokens (colors, fonts, shadows, radii)
- `theme/colors.ts` — runtime-accessible color constants and themed helpers
- `global.css` — CSS variable tokens (light + dark)

## Web Preview

`npm run web` (or opening `http://localhost:8081` while the dev server runs) serves the same codebase in the browser — useful for UI work. Known web limitations: entries are in-memory only (no persistence), recording is unavailable (the home screen shows an explanatory hint), and the biometric gate auto-unlocks. See README for the full caveat list.

## Branch Conventions

This project follows a per-phase branch strategy:

| Branch Pattern | Purpose |
|----------------|---------|
| `master` | Production branch — always releasable, accumulates completed phases |
| `feat/phase-N-description` | Feature branch for each numbered phase (e.g., `feat/phase-0-scaffolding`, `feat/phase-1-audio-capture`) |
| `fix/<short-description>` | Hotfix branch for bugs found after phase completion |
| `refactor/<short-description>` | Refactoring branch |

### Workflow

1. Each phase branch is created from `master`.
2. All commits for a phase accumulate on the branch.
3. The phase branch is **merged into `master` only after all workflow steps pass** (discuss → plan → execute → test → verify → review → fix → ship → docs).
4. After merge, delete the phase branch and start the next phase from the updated `master`.

### Commit Convention

```
type(scope): description

type: feat | fix | refactor | style | docs | chore | test | perf
scope: component, service, or "global"
```

Examples:
```
feat(recorder): add Skia waveform visualization
fix(auth): handle biometric timeout on Android 12
refactor(stores): migrate diary store to Zustand slices
docs(ui): update UI-SPEC with dark mode colors
```

- Use imperative mood. No past tense.
- Max subject length: 72 characters.
- Body is optional but required when the change isn't self-explanatory.

## PR Process

This is a **private** project with no public pull request template. The general process for contributing changes:

1. **Create a feature branch** from `master` following the branch naming conventions above.
2. **Make your changes** following the coding conventions documented in `AGENTS.md`.
3. **Run the type checker** to ensure no type errors:
   ```bash
   npx tsc --noEmit
   ```
4. **Run tests** to verify nothing is broken:
   ```bash
   npm test
   ```
5. **Review your changes** with `git diff` before committing — ensure no debug code, no `console.log`, no commented-out code, and no TODOs.
6. **Commit** using the conventional commit format.
7. **Push** the branch and open a pull request on GitHub.
8. The PR is reviewed and, once approved, merged into `master`.

### Pre-Commit Checklist

Before every commit, verify:

- [ ] TypeScript compiles with `strict: true`
- [ ] No debug code, TODOs, or commented-out code
- [ ] All new components match the design system tokens
- [ ] No unapproved imports
- [ ] Screen components are under 150 lines
- [ ] `cn()` used instead of template literal classnames <!-- VERIFY: cn() utility is a planned convention (from AGENTS.md), not yet implemented in codebase -->
- [ ] All colors come from `theme/tailwind.config.js` or `theme/colors.ts`
- [ ] Branch name follows convention
- [ ] Commit message follows convention
