# Phase 4: Browse, Review, Tasks & Polish — Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the full browse-and-review experience: real-time search, entry detail sheet with inline editing, task completion, the Thought Shredder transition, motion polish, and dark/light mode adaptation.

This phase includes: real-time entry search (Realm FTS), entry detail bottom sheet, long-press contextual Edit/Delete menu, task completion toggle, Thought Shredder transition (Skia cracks → fragments fly to tab icon), Reanimated stagger animations, skeletal shimmer on all async loads, dark mode (system + in-app override), and Detox + Jest integration tests.

This phase does NOT include: cloud sync, audio playback, media attachments, export, or any v2 requirements.

Requirements: BROW-02, BROW-03, BROW-04, BROW-05, UX-01, UX-04, UX-05, UX-07, UX-08, UX-09, TASK-01, TASK-02, TEST-01, TEST-02
</domain>

<decisions>
## Implementation Decisions

### Search & Filter

- **D-01:** No category filter tabs inside DiaryScreen — each tab screen (Diary, Tasks, Digests) already acts as a category scope. No extra filter UI needed.
- **D-02:** Search bar is hidden by default on DiaryScreen; revealed by tapping a search icon (not always-visible inline).
- **D-03:** Search results update in real-time as the user types (no submit required). Use Realm FTS on the existing `queryKey` field for performance. Debounce input ~150ms to avoid thrash.

### Entry Detail & Edit Flow

- **D-04:** Tapping an entry card opens a bottom modal sheet.
- **D-05:** Long-pressing an entry card reveals a per-card contextual menu with two icons: Edit (pencil) and Delete (trash). This **replaces** the Phase 2 global delete-mode toolbar — `DeleteModeToolbar`, `enterDeleteMode`, and all related state in `useEntries` are removed.
- **D-06:** Tapping the Edit icon opens the bottom sheet **directly in edit mode** — text field is immediately editable, category badge is tappable to cycle (diary → task → note).
- **D-07:** Inside edit mode the sheet has explicit **Save** (persists to Realm) and **Cancel** (discards changes) action buttons.
- **D-08:** Tapping the Delete icon triggers the existing single-entry confirmation dialog (same semantics as Phase 2, but invoked from the contextual menu instead of delete mode toolbar).
- **D-09:** Editable fields: `text` (full body), `category` (cycle tap on badge), and `title` (manual override). `previewText` is re-derived automatically from text on save.

### Task Completion UX

- **D-10:** Each task card in TasksScreen has a circle checkbox on the left. Tap to toggle completion. Fires medium haptic on toggle.
- **D-11:** Completed tasks stay in the list — card text gets a strikethrough and the card opacity reduces. User can uncheck at any time.
- **D-12:** `EntryRecord` needs a new `isCompleted: boolean` field (default `false`). The Realm schema migration must be additive (no data loss).

### Thought Shredder Transition

- **D-13:** Triggered when transcription + classification completes — fires from HomeScreen on the TranscriptionResult card.
- **D-14:** The TranscriptionResult card gets Skia crack lines drawn across it at pause-cut positions (from the Whisper transcription metadata). The card then shudders and fragments into pieces. GPU-rendered Skia path + Reanimated spring.
- **D-15:** After fragmentation, the pieces fly toward the matching bottom tab icon for the entry's category (Diary → Diary tab, Task → Tasks tab, Note → Digests/Notes tab).
- **D-16:** Total duration: ~1.3 seconds. Spring physics taper naturally — no hard cut-off.
- **D-17:** After the animation, HomeScreen resets to the idle state (RecorderButton + PromptText).

### Dark Mode & Motion Polish

- **D-18:** Dark mode follows the OS system setting by default. User can override it with a manual toggle (stored in MMKV, not Keychain — not sensitive data).
- **D-19:** Skeletal shimmer applies globally — every screen shows a shimmer overlay on initial mount while async data resolves. Implemented via NativeWind animated gradient classes.
- **D-20:** No animation exceptions — animate everything consistently (including BiometricGate, error states, and the edit sheet).
- **D-21:** Dark mode color mapping (extending UI-SPEC.md section 2.4):
  - `--background`: `#1E1A24` (dark warm tone preserving brand character)
  - `--card`: `#2A2631` (slightly lighter dark surface)
  - `--foreground`: `#F5F0EB` (warm off-white)
  - `--border`: `#4A4550` (muted charcoal — lighter than foreground so cards read clearly)
  - `--muted`: `#302C38`
  - `--muted-foreground`: `#8A828F` (unchanged — works in both modes)
  - Primary, secondary, accent, destructive: unchanged (vibrant in both modes)

### Agent's Discretion

- Exact debounce value for search (recommended: 150ms).
- Exact shimmer animation speed and gradient colors (must use NativeWind classes, no StyleSheet).
- Exact spring config for Thought Shredder fragments (stiffness/damping values).
- Exact shape of the Skia crack paths (random seed-based generation along pause cut timeline).
- Exact shadow/border adjustments in dark mode for cards.
- Exact long-press haptic pattern (light impact on initial long-press detection).
- Layout and icon placement details for the contextual Edit/Delete menu overlay on the card.
</decisions>

<specifics>
## Specific Ideas & References

- Long-press contextual menu should feel like iOS home screen icon wiggle — intentional but not alarming.
- Thought Shredder is the signature moment of the app — it should feel dramatic at ~1.3s, like a satisfying receipt printer or a paper shredder chomping through the card.
- Fragments flying toward the tab icon communicates "this is where your entry went" — a wayfinding moment, not just eye candy.
- Dark mode should feel like the same journal in candlelight — warm dark, not cold/clinical.
- Skeletal shimmer should use the warm cream → muted beige sweep to stay on-brand.
</specifics>

<phase_2_refactor>
## Phase 2 Behavior Replaced by Phase 4

The following Phase 2 components/state are superseded and should be removed in Phase 4:

| Removed | Replaced by |
|---------|-------------|
| `DeleteModeToolbar` component | Long-press contextual card menu (Edit + Delete icons) |
| `enterDeleteMode` / `exitDeleteMode` in `useEntries` | Contextual state on individual card |
| `isDeleteMode` / `deleteTargetId` state | Inline per-card selection state |

**Wipe-all flow** (double-confirm + biometric re-auth) should be moved to a Settings screen or long-accessible overflow menu — it's a power-user action that doesn't need to live on the Diary screen. Agent's discretion on exact placement.
</phase_2_refactor>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and requirement contract
- `.planning/ROADMAP.md` — Phase 4 goal, constraints, success criteria, and planned work split (04-01 through 04-04).
- `.planning/REQUIREMENTS.md` — BROW-02..05, UX-01, UX-04..09, TASK-01..02, TEST-01..02 requirement definitions.
- `.planning/PROJECT.md` — locked architecture decisions (Reanimated, Moti, Rive, Skia, flash-list, NativeWind, zero-cloud).
- `.planning/STATE.md` — current execution status and phase handoff context.
- `AGENTS.md` — hard architecture lock and coding constraints (NativeWind only, no StyleSheet.create, cn() for conditionals).

### Design and UX constraints
- `.planning/UI-SPEC.md` — card visual system, badge colors, typography, spacing, interaction language, dark mode base guidance (section 2.4).
- `ui-export-react/` — reference React components for exact layout patterns.

### Existing implementation anchors
- `src/screens/DiaryScreen.tsx` — current browse screen with flash-list + day-grouped entries. Phase 4 adds search + long-press contextual menu here. `DeleteModeToolbar` usage is removed.
- `src/screens/TasksScreen.tsx` — current task list (read-only). Phase 4 adds checkbox completion toggle.
- `src/screens/HomeScreen.tsx` — Thought Shredder fires here after TranscriptionResult displays.
- `src/components/ui/TranscriptionResult.tsx` — the card that becomes the Thought Shredder subject.
- `src/hooks/useEntries.ts` — current entry state. Delete mode state is removed; search query state is added.
- `src/services/entriesRepository.ts` — Realm repository. FTS search method needs adding. `isCompleted` field needs migration.
- `src/types/entry.ts` — `EntryRecord` needs `isCompleted: boolean` field.
- `src/models/EntryRealm.ts` — Realm schema needs `isCompleted` property + schema version bump.
- `src/components/ui/DeleteModeToolbar.tsx` — to be removed in Phase 4.
- `src/utils/entryGrouping.ts` — used by DiaryScreen for day sections; may need search-filtered variant.
</canonical_refs>

---

*Phase: 04-browse-review-tasks-polish*
*Context gathered: 2026-05-20*
