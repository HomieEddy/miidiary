# Roadmap: Dear Diary

## Overview

Dear Diary transforms voice capture into organized entries — from a single tap to record, through on-device transcription and auto-classification, to browsing your diary entries, tasks, and reference notes — all offline, all encrypted, with zero cloud. Audio is ephemeral: discarded immediately after transcription.

## Milestones

### ✅ v1.0 — MVP (SHIPPED 2026-08-07)

Instant, private, offline voice capture that automatically organizes thoughts into the right place — recording, on-device EN/FR-CA transcription, auto-classification (Diary/Task/Note), encrypted storage, browse/search/edit, task management, dark mode, Thought Shredder.

- [x] **Phase 0: Project Scaffolding** — Expo CNG + locked deps, theme system, tab navigation, render test (3/3 plans)
- [x] **Phase 1: Foundation & Audio Capture** — record → visualize → transcribe → discard loop with haptics (3/3 plans)
- [x] **Phase 2: Encrypted Storage & Basic Browse** — Realm encrypted DB, keys in Keychain, chronological browse (2/2 plans)
- [x] **Phase 3: On-Device ML Pipeline** — Whisper STT (EN/FR-CA) + classification, background hooks (3/3 plans)
- [x] **Phase 4: Browse, Review, Tasks & Polish** — search, edit, tasks, dark mode, Thought Shredder, polish (4/4 plans)

**Verification:** 49/49 requirements satisfied; audit passed (`.planning/v1.0-MILESTONE-AUDIT.md`); 123 Jest tests; tsc clean; live browser UAT.

**Archives:** [v1.0 ROADMAP](milestones/v1.0-ROADMAP.md) · [v1.0 REQUIREMENTS](milestones/v1.0-REQUIREMENTS.md)

---

## Next Milestone

Planned v1.1 scope (from v2 requirements): daily reminders (NOTF-01), export to text/JSON (EXPT-01), basic statistics (STAT-01), language switch (MULT-01), plus Detox E2E execution and native-device verification of the Thought Shredder animation.
