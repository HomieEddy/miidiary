# Dear Diary

## What This Is

A premium, high-polish, local-first mobile utility for "Record and Forget" voice capture. Users tap a single button to stream their thoughts, which are processed 100% on-device and contextually separated into Diary entries, Tasks, or Reference Notes. Zero cloud dependencies, complete offline reliability, and strict bilingual optimization for English and Canadian/Quebec French.

## Core Value

Instant, private, offline voice capture that automatically organizes thoughts into the right place — so users never lose an idea.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Single-button voice capture with instant recording start
- [ ] 100% local on-device speech-to-text processing
- [ ] Automatic contextual classification (Diary / Task / Reference Note)
- [ ] Local encrypted storage with zero cloud dependencies
- [ ] Full offline reliability
- [ ] High-fidelity tactile motion animations
- [ ] Bilingual support: English + Canadian/Quebec French
- [ ] Review and edit captured entries
- [ ] Browse/search organized entries by type

### Out of Scope

- Cloud sync or backup — privacy-first means local-only storage
- Social/sharing features — personal utility only
- Web or desktop clients — mobile-first, mobile-only for v1
- Media attachments (photos, videos) — text/voice only

## Context

Built with React Native (Expo Managed Workflow) targeting Fabric/JSI/TurboModules architecture v3. Privacy and local-first processing are non-negotiable — all ML models (STT, NLP classification) run on-device. The app targets users who think aloud: journalers, note-takers, task-capturers who want friction-free capture without worrying about where their data goes.

## Constraints

- **Privacy**: All data must be stored and processed locally with encryption — zero cloud dependency
- **Offline**: Full functionality must work without internet connectivity
- **Performance**: Voice capture must start instantly; transcription must feel real-time
- **Bilingual**: EN and FR/CA must be first-class, not afterthoughts
- **Mobile**: iOS and Android via Expo managed workflow
- **Architecture**: React Native v3 (Fabric, JSI, TurboModules)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expo Managed Workflow | Faster development, OTA updates, managed native modules | — Pending |
| On-device ML (STT + NLP) | Privacy requirement, no cloud dependency | — Pending |
| Local encrypted storage | Privacy-first design | — Pending |

---

*Last updated: 2026-05-17 after initialization*
