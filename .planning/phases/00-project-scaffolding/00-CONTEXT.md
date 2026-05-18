# Phase 0: Project Scaffolding - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up the React Native Expo project shell: initialize the Expo app via CNG with all locked dependencies, wire the existing theme system (tailwind.config.js, colors.ts, typography.ts), configure Expo Router tab navigation with 4 screens, and add a basic render test that verifies the shell renders with correct theming.

This phase does NOT include any audio capture, storage, or business logic. It produces a runnable app shell with navigation, theming, and a passing test.

Requirements: SCAFFOLD-01, SCAFFOLD-02, SCAFFOLD-03, SCAFFOLD-04

</domain>

<decisions>
## Implementation Decisions

### Expo Project Setup
- **D-01:** Start with `npx create-expo-app` using `blank-typescript` template, then merge existing theme files (tailwind.config.js, colors.ts, typography.ts) into the generated project.
- **D-02:** Run `npx expo prebuild` immediately after init to lock native project files and surface native module issues early.

### Directory Pre-creation
- **D-03:** Create all `src/` subdirectories upfront per AGENTS.md spec: `app/`, `screens/`, `components/ui/`, `services/`, `stores/`, `hooks/`, `utils/`, `types/`, `assets/icons/`, `assets/fonts/`, `assets/images/`.
- **D-04:** Leave directories completely empty — no placeholder barrel files. Index.ts exports are created when the first component is added.

### Tab Screen Placeholders
- **D-05:** Each tab screen shows a minimal placeholder: screen name heading + "Coming Soon" description of what the screen will do. No UI components imported yet.
- **D-06:** Use Expo Router group layout convention: `app/(tabs)/` with `_layout.tsx` wrapping the tab navigator. Routes: `app/(tabs)/index.tsx` (Home), `app/(tabs)/diary.tsx`, `app/(tabs)/tasks.tsx`, `app/(tabs)/digests.tsx`.
- **D-07:** Wire the full UI-SPEC tab bar design from day 1 — Solar icons via SvgXml, `border-4`, offset shadow (`shadow-[4px_4px_0px_theme(colors.border)]`), active tab underline (6px bar, primary pink, `skew-x-12`).

### Font Loading Strategy
- **D-08:** Load fonts via `useFonts` hook in root `app/_layout.tsx` with a loading/splash state while fonts are loading.
- **D-09:** Bundle font TTF files locally in `src/assets/fonts/` — no network dependency (offline-first requirement).
- **D-10:** Bundle all needed weights: Nunito (400,500,600,700,800,900), Fredoka (500,600,700), Playfair Display (400,700), JetBrains Mono (400,700).

### Test Setup
- **D-11:** Test file at `src/tests/ui.test.tsx` with Jest config aligned to `src/` directory.
- **D-12:** Basic render test asserts the app shell renders without crashing AND checks the correct theme background class (`bg-background`) is applied — validates both rendering and theme wiring.
- **D-13:** Configure Jest + @testing-library/react-native only. Detox E2E deferred to Phase 4.

### Agent's Discretion
- Exact `create-expo-app` version and Expo SDK version to target (use latest stable as of May 2026).
- Package manager choice (npm vs yarn vs pnpm) — use whatever `create-expo-app` defaults to.
- Jest config specifics (transform, moduleNameMapper for path aliases) — standard React Native setup.
- Exact Solar SVG icon strings — fetch from Iconify and inline as constants.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Decisions
- `.planning/PROJECT.md` — Architecture lock table, key decisions, constraints
- `.planning/REQUIREMENTS.md` — Full requirement definitions (SCAFFOLD-01 through SCAFFOLD-04)
- `.planning/ROADMAP.md` — Phase structure, success criteria, dependency chains
- `.planning/UI-SPEC.md` — Full design system: colors, typography, shadows, components, icons, motion
- `AGENTS.md` — Directory structure (§2.3), coding conventions (§2), naming rules (§2.2)

### Theme System (already exists)
- `theme/tailwind.config.js` — Color tokens, font families, border radii, shadow system
- `theme/colors.ts` — Runtime color constants, category badge colors
- `theme/typography.ts` — Font family names, weight constants

### Reference UI
- `ui-export-react/` — Reference component implementations from Sleek design export
- `ui-export-react/home.tsx` — Home screen reference layout
- `ui-export-react/diary.tsx` — Diary timeline reference layout
- `ui-export-react/tasks.tsx` — Task cards reference layout
- `ui-export-react/icons/` — Solar icon SVG exports

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `theme/tailwind.config.js` — Fully defined color palette, font families, border radius scale, shadow system. Ready to merge into Expo project.
- `theme/colors.ts` — Typed color constants with category badge mappings. Import-ready.
- `theme/typography.ts` — Font family names and weight constants.
- `ui-export-react/` — Reference React Native components (not production code) showing exact layout, spacing, rotation, shadows. Source of truth for design spec.

### Established Patterns
- No application code exists yet — this is the initial scaffold.
- All architecture decisions documented in PROJECT.md Key Decisions table.

### Integration Points
- Expo Router `app/` directory will become the main routing layer.
- `src/screens/` will import from `src/components/`.
- `app/_layout.tsx` will host font loading, providers, and tab navigation.
- `theme/` files are ready at project root and will be moved/merged into the scaffolded project's structure.

</code_context>

<specifics>
## Specific Ideas

No specific references beyond UI-SPEC.md and AGENTS.md conventions. Open to standard Expo React Native approaches for implementation details.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 0-Project Scaffolding*
*Context gathered: 2026-05-17*
