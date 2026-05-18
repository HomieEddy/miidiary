# GSD Workflow — Dear Diary

This project uses the GSD (Get Shit Done) workflow. Planning artifacts live in `.planning/`.

## Quick Start

- `/gsd-progress` — Check project status and next actions
- `/gsd-discuss-phase N` — Discuss phase N before planning
- `/gsd-plan-phase N` — Plan phase N
- `/gsd-execute-phase N` — Execute phase N
- `/gsd-add-tests N` — Generate tests for phase N
- `/gsd-verify-work N` — Verify phase N deliverables
- `/gsd-code-review` — Review source files for bugs, security, quality
- `/gsd-code-review --fix` — Auto-fix code review findings
- `/gsd-ship` — Create PR and prepare for merge
- `/gsd-docs-update` — Generate/update project documentation
- `/gsd-note` — Capture an idea
- `/gsd-add-todo` — Capture task from conversation

## Key Files

- `.planning/PROJECT.md` — Project context and requirements
- `.planning/ROADMAP.md` — Phase structure and progress
- `.planning/REQUIREMENTS.md` — Detailed requirements with traceability
- `.planning/UI-SPEC.md` — Design system, colors, typography, components, motion
- `.planning/config.json` — Workflow preferences
- `.planning/STATE.md` — Project memory and session continuity
- `theme/` — Tailwind config, color tokens, typography constants
- `ui-export-react/` — Reference React components from Sleek design

## Phase Execution Workflow (STRICT SEQUENCE)

Every phase MUST run through this exact workflow in order. Do NOT skip steps or reorder. After the final step, advance to the next phase and repeat.

### Per-Phase Sequence

```
Step  1 — /gsd-discuss-phase N
  → Gather implementation decisions, capture CONTEXT.md

Step  2 — /gsd-plan-phase N
  → Create PLAN.md with task breakdown, dependency analysis

Step  3 — /gsd-execute-phase N
  → Build everything per PLAN.md with atomic commits

Step  4 — /gsd-add-tests N
  → Generate unit, integration, and E2E tests for phase

Step  5 — /gsd-verify-work N
  → Validate phase deliverables match success criteria

Step  6 — /gsd-code-review
  → Audit all changed files for bugs, security, quality

Step  7 — /gsd-code-review --fix
  → Auto-fix all issues found by code review

Step  8 — /gsd-ship
  → Create PR branch, run final checks, prepare merge

Step  9 — /gsd-docs-update
  → Update PROJECT.md, ROADMAP.md, STATE.md with phase results
```

### Completion Check

After Step 9, check ROADMAP.md:

- **If all phases are complete** → `/gsd-complete-milestone` to archive and wrap
- **If more phases remain** → increment `N` by 1, return to Step 1
- **If phase needs immediate fix** → run `/gsd-audit-fix` then return to verification

### Workflow diagram

```
           ┌─────────────────────┐
           │  /gsd-discuss-phase │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │   /gsd-plan-phase   │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │ /gsd-execute-phase  │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │   /gsd-add-tests    │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │  /gsd-verify-work   │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │  /gsd-code-review   │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │/gsd-code-review--fix│
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │     /gsd-ship       │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │ /gsd-docs-update    │
           └────────┬────────────┘
                    │
           ┌────────▼────────────┐
           │  ROADMAP done?      │
           │  ┌───┐    ┌───┐    │
           │  │NO│    │YES│    │
           │  └─┬─┘    └─┬─┘    │
           └────┼────────┼──────┘
                │        │
      N += 1 ───┘        └─── /gsd-complete-milestone
```

### Override Rules

- **Only skip if:** a step produces no output (e.g., tests already written, no review findings)
- **Never skip:** discuss, plan, execute, ship
- **If a step fails:** fix the issue, do NOT advance to the next step until the failure is resolved
- **If scope creep surfaces during plan/execute:** defer to backlog via `/gsd-add-backlog`, do NOT expand current phase

## Phases

1. **Foundation & Audio Capture** — Expo scaffold, NativeWind, recording UI, Skia waveform, Rive mic, haptics, interruption handling
2. **Encrypted Storage & Basic Browse** — Realm, MMKV + Keychain, biometric unlock, flash-list, chronological list
3. **On-Device ML Pipeline** — react-native-whisper STT (EN/FR-CA), auto-classification (Diary/Task/Note)
4. **Browse, Review, Tasks & Polish** — Thought Shredder, search, edit, task mgmt, dark mode, Detox E2E

---

# HARD RULES — Agents MUST follow these without deviation

## 1. Architecture Lock (NO substitutes)

The following are **LOCKED**. Do not introduce alternatives, wrappers, or migrations unless a PLAN.md explicitly tasks you with it:

| Concern | Locked Choice | DO NOT use |
|---------|--------------|------------|
| Framework | React Native New Architecture (Fabric/JSI/TurboModules) via Expo CNG (prebuild) | bare RN, Expo Go |
| Styling | NativeWind v4 + Tailwind utility classes | styled-components, StyleSheet.create, Stitches |
| State | Zustand (global) + transient non-reactive variables (live transcription) | Redux, Jotai, MobX, Context |
| Persistence | @realm/react | SQLite, WatermelonDB, AsyncStorage, Drizzle |
| Secure storage | react-native-mmkv + react-native-keychain | expo-secure-store (too small), AsyncStorage |
| STT | react-native-whisper | expo-speech, Apple Speech, Google Speech |
| Motion | Reanimated + Moti (native worklet thread) | Animated API, framer-motion, react-spring |
| Vector UI | @rive/react-native (GPU state machines) | Lottie, custom RN animations |
| Audio viz | @shopify/react-native-skia (GPU canvas) | Custom RN Views, WebView |
| List | @shopify/flash-list | FlatList, SectionList, ScrollView |
| Background | expo-task-manager + expo-background-fetch | bare Headless JS, WorkManager |
| Biometrics | expo-local-authentication | react-native-biometrics, custom |
| Haptics | expo-haptics | react-native-haptic-feedback |
| Icons | Solar set (Iconify) via react-native-svg SvgXml | @expo/vector-icons, FontAwesome, MaterialIcons |
| Navigation | Expo Router (file-based) | react-navigation standalone |
| Fonts | Nunito (body), Fredoka (heading), Playfair Display (serif), JetBrains Mono | any other font family |
| Testing | Jest + @testing-library/react-native (unit), Detox (E2E) | Maestro, Appium, Cypress |

## 2. Coding Conventions

### 2.1 TypeScript Strictness
- `strict: true` in tsconfig.json — NO exceptions
- No `any` — use `unknown` + type guards, or `zod` for runtime parsing
- All function return types must be explicit (no inferred returns)
- All Realm model schemas must have full TypeScript generics

### 2.2 File Naming
- Components: `PascalCase.tsx` — `RecorderButton.tsx`
- Screens: `PascalCase.tsx` — `HomeScreen.tsx`
- Hooks: `camelCase.ts` — `useAudioCapture.ts`
- Services: `camelCase.ts` — `transcriptionService.ts`
- Theme: `kebab-case` — `tailwind.config.js`
- Tests: `*.test.ts` or `*.spec.ts` mirroring source path
- Store slices: `camelCase.ts` — `recordingStore.ts`

### 2.3 Directory Structure
```
src/
  app/                  # Expo Router pages
  screens/              # Screen components (thin, compose primitives)
  components/           # Reusable UI primitives
  services/             # Business logic (STT, classification, storage)
  stores/               # Zustand store slices
  hooks/                # Shared hooks
  theme/                # Colors, typography, spacing constants
  utils/                # Pure utility functions
  types/                # Shared TypeScript types
  assets/
    icons/              # Solar SVG icon constants (inline SvgXml)
    fonts/              # Loaded via expo-font
  tests/                # E2E (Detox) test files
```

### 2.4 Component Rules
- **Screens are thin** — import primitives, wire services, delegate state. Max 150 lines.
- **Components are dumb** — receive props, render UI. No direct service calls. No Zustand stores.
- **Services are pure** — no JSX, no side effects at module scope. Accept params, return promises.
- **Hooks bridge** — components ⇔ services. `useAudioCapture()` orchestrates recorder, permissions, state.
- **NO** inline styles — use NativeWind className exclusively.
- **NO** `StyleSheet.create` — never.
- **NO** conditional className strings — use `cn()` utility from `clsx` + `tailwind-merge`.

### 2.5 Imports Order
```typescript
// 1. React/Expo
import { View } from "react-native";
import { router } from "expo-router";

// 2. Third-party (alphabetical)
import { useRealm } from "@realm/react";
import { MotiView } from "moti";
import { create } from "zustand";

// 3. Internal (alphabetical by path segment)
import { cn } from "@/utils/cn";
import { colors } from "@/theme/colors";
import { useAudioCapture } from "@/hooks/useAudioCapture";

// 4. Assets
import MicIcon from "@/assets/icons/mic.svg";
```

### 2.6 Export Rules
- Default export for screens only (`export default function HomeScreen()`)
- Named exports for everything else (`export function RecorderButton()`)
- Barrel exports: `src/components/index.ts` re-exports all primitives

## 3. Design System Compliance

Every UI pixel must conform to `.planning/UI-SPEC.md`. The agent MUST:

1. Read `theme/tailwind.config.js` for color/font tokens
2. Use `theme/colors.ts` for any runtime color access
3. Reference `ui-export-react/` components for exact layout, spacing, rotation, shadows
4. Use `cn()` utility for conditional classes — never template literals

**Required NativeWind classes for EVERY screen:**
```tsx
<View className="min-h-screen bg-background text-foreground pb-32 font-sans">
```

**Card pattern (NEVER deviate):**
```tsx
<View className="bg-card border-4 border-border rounded-2xl p-4 shadow-[4px_4px_0px_theme(colors.border)] rotate-1">
```

**Button press pattern:**
```tsx
className="... active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
```

**Category badge colors (LOCKED):**
- Diary: `bg-primary text-primary-foreground`
- Task: `bg-secondary text-secondary-foreground`
- Note: `bg-accent text-accent-foreground`

## 4. Version Control

### 4.1 Commit Convention
```
type(scope): description

type: feat | fix | refactor | style | docs | chore | test | perf
scope: component, service, or "global"

Examples:
  feat(recorder): add Skia waveform visualization
  fix(auth): handle biometric timeout on Android 12
  refactor(stores): migrate diary store to Zustand slices
  docs(ui): update UI-SPEC with dark mode colors
```

- Imperative mood. No past tense.
- Body: optional but REQUIRED when the change isn't self-explanatory
- Max subject: 72 chars

### 4.2 Branch Strategy
- `master` — production, always releasable
- `feat/<phase>-<short-desc>` — feature branches from master
- `fix/<short-desc>` — bugfix branches
- `refactor/<short-desc>` — refactor branches

### 4.3 Commit Frequency
- One commit per logical change (not per file)
- Commit when: a feature works, a bug is fixed, a refactor is complete
- NEVER commit broken code, debug logs, console.log, TODO comments
- NEVER commit commented-out code
- NEVER commit credentials, tokens, or secrets
- Review `git diff` before every commit

## 5. Strict Prohibitions

Agents MUST NEVER:

| Prohibition | Rationale |
|-------------|-----------|
| Install unapproved packages | Only libraries in STACK.md or explicitly tasked |
| Use `react-native-screens` outside Expo Router | Expo Router manages this |
| Import from `@expo/vector-icons` | Doesn't support Solar icon set |
| Use `FlatList` or `ScrollView` for data lists | flash-list is locked |
| Create new navigation patterns | Expo Router file-based only |
| Store data in AsyncStorage | Not encrypted, not for entry data |
| Add `index.ts` barrel files in `src/app/` | Expo Router uses file-based routing, barrels break it |
| Use `StyleSheet.create` or inline `style={}` | NativeWind only |
| Add `console.log` or `console.warn` | Use proper logging if needed |
| Commit without `git diff` review | Every commit must be verified |
| Modify `.planning/` files without GSD workflow | Planning changes go through GSD commands |
| Introduce new state management | Zustand is locked — no Redux, Jotai, Context |
| Suggest cloud features | Zero-cloud is a hard requirement |
| Store raw audio files | Audio is ephemeral — discard after transcription |

## 6. Mandatory Checks Before Every Commit

1. `git diff` — review all changes
2. No debug code, no TODOs, no commented code
3. TypeScript compiles with `strict: true`
4. All new components match UI-SPEC.md design tokens
5. No unapproved imports
6. Screen components < 150 lines
7. `cn()` used instead of template literal classnames
8. All colors from `theme/tailwind.config.js` or `theme/colors.ts`
9. Branch name follows convention
10. Commit message follows convention

## 7. Architecture Diagrams

```
src/services/ ←────────────────────────── src/stores/
  audioCaptureService.ts                    recordingStore.ts
  transcriptionService.ts                   entriesStore.ts
  classificationService.ts
  realmService.ts          ───→ @realm/react (encrypted)
  keychainService.ts       ───→ react-native-keychain

src/hooks/
  useAudioCapture.ts   ←── audioCaptureService + recordingStore
  useTranscription.ts  ←── transcriptionService
  useEntries.ts        ←── realmService + entriesStore

src/screens/ ──→ src/components/ ──→ NativeWind classes
  HomeScreen.tsx       RecorderButton.tsx    bg-background text-foreground
  DiaryScreen.tsx      EntryCard.tsx         bg-card border-4 border-border
  TasksScreen.tsx      TaskCard.tsx          shadow-[4px_4px_0px_theme(colors.border)]
  DigestsScreen.tsx    BottomNav.tsx         active:translate-y-1

Reanimated (native thread)           Rive (GPU)                  Skia (GPU)
  spring worklets                      mic→equalizer               waveform viz
  Thought Shredder                     ambient blobs               amplitude render
  staggered layouts                    state machines              GPU canvas only
```

## Current State

**Phase 1** — Ready to plan
**Status:** Project initialized
