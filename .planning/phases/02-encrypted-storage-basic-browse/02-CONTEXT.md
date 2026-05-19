# Phase 2: Encrypted Storage & Basic Browse - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Persist entries in encrypted local storage, protect access with biometric authentication, show entries in a chronological browse experience, and support safe delete/wipe flows while remaining fully offline.

This phase includes: encrypted Realm persistence, key management via MMKV + Keychain, biometric launch lock, and chronological entry browsing with FlashList.

This phase does NOT include: on-device STT model integration (Phase 3), auto-classification model logic (Phase 3), advanced search/filter/edit (Phase 4).

Requirements: STOR-01, STOR-02, STOR-03, STOR-04, STOR-05, STOR-06, SEC-01, SEC-02, BROW-01

</domain>

<decisions>
## Implementation Decisions

### Storage Engine and Security Baseline
- **D-01:** Use Realm as the Phase 2 storage engine. SQLCipher wording in roadmap is treated as outdated.
- **D-02:** Keep encryption key material flow locked to MMKV + Keychain.
- **D-03:** Keep fully offline behavior as a hard requirement (no external network dependency for storage/browse flows).

### Biometric Lock Flow
- **D-04:** Require biometric unlock on cold launch (not every short foreground resume).
- **D-05:** If biometric fails or is unavailable, allow device passcode fallback.

### Entry Schema and Metadata
- **D-06:** Persist first-class fields: `id`, `createdAt`, `updatedAt`, `text`, `category`.
- **D-07:** Persist derived display fields: `title` and `previewText`.
- **D-08:** Derive `title` from the first sentence and truncate preview text deterministically.

### Chronological Browse Experience
- **D-09:** Diary browse uses day-grouped chronological sections (e.g., Today/Yesterday/older days).
- **D-10:** Each row shows category badge, title, one-line preview, and timestamp.

### Delete and Wipe UX Safety
- **D-11:** Single-entry delete flow: long-press enters delete mode, show X affordance on entry card, tap X triggers confirm dialog.
- **D-12:** Wipe-all flow requires double confirmation plus biometric re-auth.

### the agent's Discretion
- Exact inactivity threshold policy for optional future resume-lock behavior.
- Exact truncation length for `title` and `previewText` as long as it is deterministic and testable.
- Exact day-section label formatting and localization details.
- Exact motion/haptic details for entering and exiting delete mode.

</decisions>

<specifics>
## Specific Ideas

- Long-press deletion should feel intentional: explicit delete mode first, then confirm.
- Chronological browsing should prioritize scanability over dense full-text blocks.
- Safety-first destructive flows are preferred for wipe-all actions.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and requirement contract
- `.planning/ROADMAP.md` — Phase 2 goal, constraints, success criteria, and planned work split.
- `.planning/REQUIREMENTS.md` — STOR-01..06, SEC-01..02, BROW-01 requirement definitions.
- `.planning/PROJECT.md` — locked architecture decisions (Realm/MMKV/Keychain/FlashList/biometric, zero-cloud).
- `.planning/STATE.md` — current execution status and phase handoff context.

### Design and UX constraints
- `.planning/UI-SPEC.md` — card/list visual system, badge styling, typography, spacing, and interaction language.
- `AGENTS.md` — hard architecture lock and coding constraints for this repository.

### Existing implementation anchors
- `src/stores/entriesStore.ts` — current in-memory entry shape and insertion ordering behavior.
- `src/hooks/useTranscription.ts` — current pipeline point where entries are written and cleanup is triggered.
- `src/components/ui/HomePreviewSections.tsx` — existing entry card/badge/time rendering patterns to reuse in browse.
- `src/app/(tabs)/_layout.tsx` — existing tab shell and navigation context where Diary browse lives.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/stores/entriesStore.ts`: existing `Entry` shape and chronological prepend behavior can be migrated to a Realm-backed repository interface.
- `src/components/ui/HomePreviewSections.tsx`: already has category badge mapping, date formatting, and card composition useful for list item design.
- `src/hooks/useTranscription.ts`: entry creation handoff point for persistence integration.
- `src/app/(tabs)/diary.tsx` + `src/screens/DiaryScreen.tsx`: route/screen insertion point for FlashList chronological browse.

### Established Patterns
- NativeWind className-only styling with `cn()` helper for conditional classes.
- Zustand stores used as orchestration state layer.
- Tab-based Expo Router shell already active.
- Category color semantics already defined and implemented (Diary/Task/Note badge tokens).

### Integration Points
- Replace in-memory `entriesStore` data source with Realm-backed CRUD while preserving UI-facing model shape.
- Feed persisted entries into Diary browse screen using FlashList and day-grouping transform.
- Add biometric gate at app launch/root entry path before tab content becomes accessible.
- Wire delete mode and wipe-all actions to repository methods with required confirmation gates.

</code_context>

<deferred>
## Deferred Ideas

- Advanced full-text search and filtering (Phase 4).
- Entry text editing and classification override (Phase 4).
- Task-specific management UX beyond basic persisted browse (Phase 4).

</deferred>

---

*Phase: 02-encrypted-storage-basic-browse*
*Context gathered: 2026-05-18*
