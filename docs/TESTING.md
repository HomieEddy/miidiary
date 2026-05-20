<!-- generated-by: gsd-doc-writer -->
# Testing

## Test Framework and Setup

This project uses **Jest v29.7.0** with the **`jest-expo`** preset and **`@testing-library/react-native` v13.3.3** for unit testing React Native components.

Global configuration is defined in `jest.config.js` at the project root:

- **Preset:** `jest-expo` — configures Jest for the Expo/React Native environment.
- **Transform exclusions:** `transformIgnorePatterns` is tuned to allow transformation of React Native, Expo, and related packages from `node_modules`.
- **Module resolution:** The `@/` path alias maps to `<rootDir>/src/` so imports like `@/screens/HomeScreen` resolve correctly.
- **Test location:** Jest discovers tests matching `**/src/tests/**/*.test.{ts,tsx}`.
- **Coverage:** Coverage collection is disabled by default (`collectCoverage: false`).
- **Babel:** When `NODE_ENV=test`, `babel.config.js` uses `babel-preset-expo` without the `nativewind/babel` plugin to avoid transform issues in the test environment.

### Required devDependencies

| Package | Version |
|---------|---------|
| `jest` | ^29.7.0 |
| `jest-expo` | ^55.0.17 |
| `@testing-library/react-native` | ^13.3.3 |
| `@types/jest` | ^29.5.14 |
| `react-test-renderer` | ^19.1.0 |

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
- Avoid testing implementation details — focus on rendered output and user-facing behavior.

## Test File Inventory

All test files live in `src/tests/`. Current coverage by phase:

| Test File | Phase | What It Covers |
|-----------|-------|----------------|
| `ui.test.tsx` | 0 | App shell renders, theme classes applied |
| `cn.test.ts` | 1 | `cn()` utility (clsx + tailwind-merge) |
| `audioCaptureService.test.ts` | 1/3 | Recording engine, pending-processing lifecycle, interruption handling |
| `useAudioCapture.test.ts` | 1/3 | Hook orchestration, state transitions, waveform buffer |
| `entryGrouping.test.ts` | 1 | Entry grouping utility |
| `entryTextDerivation.test.ts` | 1 | Entry text derivation utility |
| `realmService.test.ts` | 2 | Encrypted Realm CRUD, key management, indexing |
| `entriesRepository.test.ts` | 2 | Repository layer: save/query/delete |
| `entriesStore.test.ts` | 2 | Zustand entries store state transitions |
| `recordingStore.test.ts` | 2 | Zustand recording store state |
| `secureStorageService.test.ts` | 2 | MMKV + Keychain secure storage |
| `biometricGate.test.tsx` | 2 | Biometric unlock gate component |
| `DiaryScreen.test.tsx` | 2 | Diary screen flash-list renders entries |
| `DigestsScreen.test.tsx` | 2 | Digests screen renders |
| `transcriptionService.test.ts` | 3 | Whisper STT pipeline, bilingual, progress stages |
| `useTranscription.test.ts` | 3 | Transcription hook orchestration, pending replay, cleanup |
| `classificationService.test.ts` | 3 | Diary/Task/Note classifier, keyword fallback |
| `modelManager.test.ts` | 3 | Model lifecycle: resolve, download, fallback, caching |
| `backgroundTaskService.test.ts` | 3 | BackgroundFetch/TaskManager registration, replay hooks |
| `transcriptionValidationService.test.ts` | 3 | WER-based EN/FR accuracy harness |
| `RecorderButton.test.tsx` | 3 | RecorderButton states: idle/recording/processing |

### Running a focused suite

```bash
# Phase 3 ML pipeline tests only
npm run test -- src/tests/transcriptionService.test.ts src/tests/classificationService.test.ts src/tests/useTranscription.test.ts src/tests/modelManager.test.ts -i
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

## CI Integration

No CI/CD pipeline is currently configured for this project. Test execution is manual via `npm test`.

<!-- VERIFY: CI integration — no .github/workflows/ directory exists. Add CI configuration (e.g., GitHub Actions) to run tests automatically on push and pull requests. -->
