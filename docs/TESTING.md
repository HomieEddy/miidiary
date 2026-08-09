<!-- generated-by: gsd-doc-writer -->
# Testing

## Test Framework and Setup

This project uses **Jest v29.7.0** with the **`jest-expo` (~54.0.17)** preset and **`@testing-library/react-native` v13.3.3** for unit testing React Native components.

Global configuration is defined in `jest.config.js` at the project root:

- **Preset:** `jest-expo` — configures Jest for the Expo/React Native environment.
- **Transform exclusions:** `transformIgnorePatterns` is tuned to allow transformation of React Native, Expo, and related packages from `node_modules`.
- **Module resolution:** The `@/` path alias maps to `<rootDir>/src/` so imports like `@/screens/HomeScreen` resolve correctly.
- **Test location:** Jest discovers tests matching `**/src/tests/**/*.test.{ts,tsx}`.
- **Coverage:** Coverage collection is disabled by default (`collectCoverage: false`).
- **Global setup:** `jest.setup.js` registers the official `react-native-safe-area-context` jest mock — screens read device insets via `useTabBarClearance`, and the mock provides zero insets without a provider.
- **Babel:** When `NODE_ENV=test`, `babel.config.js` uses `babel-preset-expo` without the `nativewind/babel` plugin to avoid transform issues in the test environment.

### Required devDependencies

| Package | Version |
|---------|---------|
| `jest` | ^29.7.0 |
| `jest-expo` | ~54.0.17 |
| `@testing-library/react-native` | ^13.3.3 |
| `@types/jest` | ^29.5.14 |
| `react-test-renderer` | ^19.1.0 |
| `patch-package` | ^8.0.1 |

## Running Tests

Run the full test suite:

```bash
npm test
```

This executes Jest with the configuration from `jest.config.js`, discovering and running all matching test files under `src/tests/`.

To run a specific test file:

```bash
npx jest src/tests/ui.test.tsx
```

To run tests matching a specific name pattern:

```bash
npx jest --testNamePattern="App Shell"
```

There is no dedicated watch-mode script configured, but you can use Jest's built-in watch mode:

```bash
npx jest --watch
```

## Writing New Tests

### File naming convention

All test files must be placed in the `src/tests/` directory with the `.test.ts` or `.test.tsx` extension. The test file name should correspond to the module or screen being tested.

**Pattern:** `src/tests/<name>.test.tsx`

**Example:** `src/tests/ui.test.tsx` (tests for `src/screens/HomeScreen.tsx`)

### Test structure

Tests use Jest's `describe` / `it` blocks and `@testing-library/react-native` for rendering and querying:

```typescript
import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "@/screens/HomeScreen";

describe("Component Name", () => {
  it("renders without crashing and shows expected content", () => {
    const { getByText } = render(<HomeScreen />);
    const heading = getByText("Home");
    expect(heading).toBeTruthy();
  });
});
```

### Best practices

- Use `@/` path aliases for imports (e.g., `@/screens/HomeScreen`, `@/components/RecorderButton`).
- Prefer `getByText`, `getByTestId`, or `getByRole` queries from `@testing-library/react-native`.
- Each test should verify one behavior or outcome per `it` block.
- For components that depend on Zustand stores or Realm, mock the service layer rather than importing real stores.
- Mock `react-native-reanimated` with the pass-through stub used in `ui.test.tsx` / `useAudioCapture.test.ts` (shared values as plain objects, `useAnimatedStyle: (fn) => fn()`, pass-through `withTiming`/`withSpring`/`withRepeat`/`cancelAnimation`, `useReducedMotion: () => false`).
- Components that call themed color helpers (`mutedForegroundHex`, ...) render fine against the real `theme/colors` module — no mock needed.
- Avoid testing implementation details — focus on rendered output and user-facing behavior.

## Test File Inventory

All test files live in `src/tests/`. Current coverage:

| Test File | What It Covers |
|-----------|----------------|
| `ui.test.tsx` | App shell renders, theme classes applied |
| `cn.test.ts` | `cn()` utility (clsx + tailwind-merge) |
| `audioCaptureService.test.ts` | Recording engine, pending-processing lifecycle (session ids), interruption handling |
| `useAudioCapture.test.ts` | Hook orchestration, state transitions, session-guarded stop |
| `entryGrouping.test.ts` | Entry grouping utility |
| `entryTextDerivation.test.ts` | Entry text derivation utility |
| `realmService.test.ts` | Encrypted Realm CRUD, key management, indexing |
| `entriesRepository.test.ts` | Repository layer: save/query/delete |
| `entriesStore.test.ts` | Zustand entries store state transitions (prepend order, replace, clear, set/remove) |
| `recordingStore.test.ts` | Zustand recording store: session epoch, per-session resets, transitions |
| `secureStorageService.test.ts` | MMKV + Keychain secure storage |
| `biometricGate.test.tsx` | Biometric unlock gate (cancel/retry, no-hardware fallback) |
| `DiaryScreen.test.tsx` | Diary screen renders grouped entries |
| `DigestsScreen.test.tsx` | Digests screen renders + wipe flow |
| `TasksScreen.test.tsx` | Tasks screen renders + toggle completion |
| `transcriptionService.test.ts` | Whisper STT pipeline, bilingual, progress stages |
| `useTranscription.test.ts` | Pipeline orchestration: session isolation, stale-completion guards, replay dedup, retry-keeps-pending |
| `classificationService.test.ts` | Diary/Task/Note classifier, keyword fallback |
| `modelManager.test.ts` | Model lifecycle: resolve (in-flight dedup), download, fallback, caching |
| `backgroundTaskService.test.ts` | BackgroundFetch/TaskManager registration, replay hooks |
| `transcriptionValidationService.test.ts` | WER-based EN/FR accuracy harness |
| `RecorderButton.test.tsx` | RecorderButton states: idle/recording/processing |
| `useStats.test.ts` | Stats hook: computation, reload on entry change |
| `useEntries.test.ts` | Search staleness race, wipe→store invalidation, re-auth rejection, category scoping |
| `i18n.test.ts` | Locale parity, interpolation (`{{count}}`/`{{time}}`), fallback |
| `reminderService.test.ts` | Reminder scheduling |
| `exportService.test.ts` | JSON/PDF export |
| `useAudioCapture.test.ts` | (see above) |
| `PaperTabBar.test.tsx` | Bottom nav: tab roles/selection, navigate on inactive press only |
| `errorBanner.test.tsx` | Banner entrance reset on repeat showings |
| `transcriptionResult.test.tsx` | Hide-timer cancellation (unmount, visible=false), stale writes |
| `glowRing.test.tsx` | Reduced-motion static ring + runtime flip cancellation |
| `dailySparkCard.test.tsx` | Prompt rotation on locale change, reduced-motion loop cancel |
| `processingState.test.tsx` | Pulse loop reduced-motion handling |
| `shimmerView.test.tsx` | Sweep loop reduced-motion handling |
| `homePreviewSections.test.tsx` | Unknown-category fallback, badges |
| `entryDetailSheet.test.tsx` | Save rejection keeps sheet open; success path |
| `entryEdit.test.ts`, `diarySearch.test.ts`, `bilingualSearch.test.ts`, `taskCompletion.test.ts` | Screen/utility behavior |

### Running a focused suite

```bash
# Recording pipeline tests only
npx jest src/tests/useTranscription.test.ts src/tests/useAudioCapture.test.ts src/tests/audioCaptureService.test.ts -i
```

## Coverage Requirements

No minimum coverage thresholds are currently configured. Coverage collection is disabled (`collectCoverage: false` in `jest.config.js`).

To generate a coverage report for manual review:

```bash
npx jest --coverage
```

To add coverage thresholds, update `jest.config.js` with a `coverageThreshold` section:

```js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

## E2E Strategy

The original Detox scaffold (`e2e/` + `.detoxrc.js`) was removed: its flows were permanently disabled (`xit`) and targeted an AVD that is not part of the dev setup. The browse/review regression net is now a Jest integration test (`src/tests/diaryFlow.integration.test.tsx`) that drives the REAL repository (in-memory realm double) through the real `useEntries` hook and the entries store: capture → browse → search → wipe → restore, plus task-completion round-trips. Device-level E2E can be re-added later against a real AVD if the CI setup requires it.

## CI Integration

No CI/CD pipeline is currently configured for this project. Test execution is manual via `npm test`.

<!-- VERIFY: No .github/workflows/ directory exists. Add CI configuration (e.g., GitHub Actions) to run tests automatically on push and pull requests. -->
