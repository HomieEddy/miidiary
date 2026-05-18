# Phase 0: Project Scaffolding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 0-Project Scaffolding
**Areas discussed:** Expo project setup approach, Directory pre-creation, Tab screen placeholders, Font loading strategy, Test setup location

---

## Expo Project Setup Approach

| Option | Description | Selected |
|--------|-------------|----------|
| create-expo-app → merge themes | Start with create-expo-app, copy theme files into generated project | ✓ |
| Manual init + preset themes | Create project structure manually, place theme files directly | |

**User's choice:** create-expo-app → merge themes

| Option | Description | Selected |
|--------|-------------|----------|
| blank-typescript | Cleanest slate — just TS + minimal config | ✓ |
| tabs | Comes with Expo Router tabs pre-configured | |

**User's choice:** blank-typescript

| Option | Description | Selected |
|--------|-------------|----------|
| Prebuild immediately | Run expo prebuild right after init | ✓ |
| Prebuild on demand | Prebuild only when native modules require it | |

**User's choice:** Prebuild immediately

---

## Directory Pre-creation

| Option | Description | Selected |
|--------|-------------|----------|
| Create all upfront | Pre-create every directory from AGENTS.md spec | ✓ |
| Emergent only | Create dirs only when the first file goes in | |

**User's choice:** Create all upfront

| Option | Description | Selected |
|--------|-------------|----------|
| Empty dirs only | Just mkdir -p each path | ✓ |
| With barrel files | Add placeholder index.ts re-export files | |

**User's choice:** Empty dirs only

---

## Tab Screen Placeholders

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal placeholders | Screen name heading + Coming Soon subtext | ✓ |
| Reference UI components | Import from ui-export-react/ directly | |
| NativeWind card with theme | Themed card with icon, title, placeholder text | |

**User's choice:** Minimal placeholders

| Option | Description | Selected |
|--------|-------------|----------|
| Group layout with (tabs) dir | app/(tabs)/index.tsx, diary.tsx, etc. | ✓ |
| Flat routes in app/ | Direct files at app/index.tsx, app/diary.tsx | |

**User's choice:** Group layout with (tabs) dir

| Option | Description | Selected |
|--------|-------------|----------|
| Full design up front | Wire tab bar per UI-SPEC §5.2 with Solar icons | ✓ |
| Minimal default | Use Expo Router default tab bar with text labels | |

**User's choice:** Full design up front

---

## Font Loading Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| useFonts in root layout | useFonts hook in app/_layout.tsx with loading splash | ✓ |
| Dedicated FontProvider | Create a <FontProvider> wrapper component | |

**User's choice:** useFonts in root layout

| Option | Description | Selected |
|--------|-------------|----------|
| Bundle font files locally | Download TTF files to src/assets/fonts/ | ✓ |
| expo-google-fonts | Use @expo-google-fonts packages (network-dependent) | |

**User's choice:** Bundle font files locally

| Option | Description | Selected |
|--------|-------------|----------|
| All needed weights | Nunito (400-900), Fredoka (500-700), Playfair (400,700), JB Mono (400,700) | ✓ |
| Minimal: body + heading | Only Nunito 400/700 + Fredoka 600 | |

**User's choice:** All needed weights

---

## Test Setup Location

| Option | Description | Selected |
|--------|-------------|----------|
| src/tests/ + jest.config aligned | Test at src/tests/ui.test.tsx | ✓ |
| __tests__/ at root (Expo default) | Test at __tests__/ui.test.tsx | |

**User's choice:** src/tests/ + jest.config aligned with src

| Option | Description | Selected |
|--------|-------------|----------|
| Shell render + theme check | Assert both render and bg-background class | ✓ |
| Just renders without crashing | Simple smoke test | |

**User's choice:** Shell render + theme check

| Option | Description | Selected |
|--------|-------------|----------|
| Jest only | Configure Jest + testing-library now | ✓ |
| Both Jest + Detox | Configure both test runners in Phase 0 | |

**User's choice:** Jest only

---

## Agent's Discretion

- Exact `create-expo-app` version and Expo SDK version
- Package manager choice (follow create-expo-app defaults)
- Jest config specifics (transform, moduleNameMapper)
- Exact Solar SVG icon strings from Iconify

## Deferred Ideas

None
