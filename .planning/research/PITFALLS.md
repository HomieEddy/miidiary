# Domain Pitfalls

**Domain:** Local-first voice-capture mobile diary app with on-device ML
**Researched:** 2026-05-17

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Concurrent ML Models Exhaust Device RAM
**What goes wrong:** App crashes with OOM (Out of Memory) on devices with ≤ 4 GB RAM. Users lose an in-progress recording. App gets 1-star reviews.

**Why it happens:** Whisper `base` model uses ~400 MB RAM at inference. A 1.7B LLM uses ~700 MB RAM. Loading both simultaneously plus the app's normal heap (~200 MB) totals ~1.3 GB. On a 4 GB device where the OS reserves ~1.5 GB, only ~2.5 GB is available. Other background apps push this over the limit.

**Consequences:** Unrecoverable crash, lost recording data, negative reviews, user churn.

**Prevention:**
- Lazy-load the NLP model: don't initialize until classification is actually needed
- Unload Whisper model after transcription completes (set context to null, call release)
- Profile RAM on target devices (iPhone 11/12/SE, Pixel 5/6a, Galaxy A-series)
- Add RAM-aware model selection: use `tiny` STT model and skip LLM (use keyword heuristics) on low-RAM devices
- Consider unloading/reloading pattern: unload Whisper → load LLM → classify → unload LLM → reload Whisper (adds latency but saves RAM)

**Detection:** Add memory pressure monitoring via `PerformanceInfo` on iOS / `ActivityManager` on Android. Log and alert when approaching limits.

### Pitfall 2: Model Download Failures on First Launch
**What goes wrong:** User installs app, opens it, sees "Downloading AI models..." progress bar, gets stuck at 0% because of poor connectivity, and uninstalls.

**Why it happens:** Whisper `base` = 142 MB. SmolLM2 1.7B = ~1 GB. Downloads happen over the network on first launch. Mobile connections can be slow, unreliable, or metered.

**Consequences:** 30-50% first-launch abandonment rate (based on industry benchmarks for apps with large mandatory downloads).

**Prevention:**
- Smallest possible initial model: start with Whisper `tiny` (75 MB) and defer LLM download
- Show clear progress with time estimate ("About 2 minutes on WiFi")
- Allow download to pause/resume (use expo-file-system download resumable)
- Bundle a tiny keyword-based classifier as fallback (no download needed; works immediately)
- Consider deferring LLM download: use keyword heuristics immediately, download LLM in background for future classification refinements
- Provide "Download over WiFi only" option for cellular data concerns

**Detection:** Track download completion rate in analytics. If < 60%, investigate.

### Pitfall 3: Bilingual STT Accuracy is Worse Than Expected
**What goes wrong:** App transcribes Quebec French with high error rate. Users code-switch (mix EN/FR in one sentence) — model produces gibberish.

**Why it happens:** Whisper multilingual models support 99 languages but are trained on balanced data. Quebec French has unique vocabulary and accent that may be underrepresented. Code-switching is particularly hard for ASR models.

**Consequences:** Bilingual users get poor transcription quality — core value prop fails for half the target audience.

**Prevention:**
- **Must test** with real Quebec French audio samples before committing to model choice
- Whisper `small` multilingual has better accuracy than `base` for lower-resource languages — benchmark both
- Consider language hint: set `language: 'fr'` when French mode is selected
- Enable user to switch language explicitly (don't auto-detect — auto-detect is slower and less accurate)
- Always allow manual text correction (it's a diary, not dictation)
- Fallback: if confidence is low, flag entry for review

**Detection:** A/B test transcription accuracy with bilingual test set during development. Measure WER (Word Error Rate).

### Pitfall 4: Background Recording Not Actually Reliable
**What goes wrong:** Recording stops or pauses when app is backgrounded. User records a 5-minute thought, checks another app, comes back to find only 30 seconds saved.

**Why it happens:** iOS and Android aggressively manage background processes. Even with `enableBackgroundRecording: true`, the OS may terminate the recording service under memory pressure.

**Consequences:** Lost audio, broken trust, users learn they can't rely on the app.

**Prevention:**
- Test background recording extensively on real devices (simulator doesn't reproduce OS behavior)
- On Android, the persistent notification is required and cannot be dismissed — ensure it's clear and useful
- Add a "recording persisted" check on app foreground: verify recording is still active
- Save audio in chunks (every 30s) so partial recordings aren't lost
- Document the constraint: "Recording may stop if phone is under extreme memory pressure"

**Detection:** Check recording duration vs. actual file size on foreground. Flag inconsistency to user.

## Moderate Pitfalls

### Pitfall 5: SQLCipher Key Loss Means Data Loss
**What goes wrong:** User reinstalls app → encryption key lost → previous entries are unrecoverable cryptographically. No cloud backup means permanent data loss.

**Prevention:**
- Warn users explicitly on first launch: "Your diary is encrypted. Only you can read it. If you delete the app, your data cannot be recovered."
- Offer encrypted export (one-way) for users who want backups
- Consider key derivation from a user-provided passphrase (optional, advanced) — but this adds UX complexity
- On OS-level backup (iCloud/Google Drive), SQLCipher database is backed up but still encrypted — restore preserves the key if Keychain/Keystore is preserved

### Pitfall 6: App Startup Too Slow (Models Load at Boot)
**What goes wrong:** Cold start takes 5-15 seconds because app loads both ML models before showing the UI. Users think the app is broken.

**Prevention:**
- Use splash screen (expo-splash-screen) with progress indication
- Load Whisper model first (smaller, faster) → show "Ready to record" immediately
- Load NLP model lazily (only when first classification is needed, not at boot)
- Show real progress: "Loading speech recognition...", "Loading AI classifier..."
- Cache model contexts; subsequent starts are faster if models were previously loaded

### Pitfall 7: App Size Blows Up
**What goes wrong:** App store listing shows "1.5 GB" because models are bundled. Users on cellular data don't download.

**Prevention:**
- NEVER bundle ML models in the app binary
- Download at runtime (first launch) with progress
- App store binary should be < 50 MB (just the JS bundle + native frameworks)
- Use app thinning (iOS) / APK split (Android) to reduce per-device binary size

### Pitfall 8: Failing to Handle SQLCipher with expo-updates
**What goes wrong:** `expo-updates` bundles its own SQLite dependency. SQLCipher's custom SQLite build conflicts. Build fails with duplicate symbol errors.

**Prevention:**
- Test build early: run `npx expo run:ios` and `npx expo run:android` after adding SQLCipher
- If conflicts arise, set `expo.updates.useThirdPartySQLitePod: true` in `ios/Podfile.properties.json`
- Or remove `expo-updates` if OTA updates aren't critical (for a local-only app, they may not be)
- For op-sqlite (if used), set `"iosSqlite": true` to use iOS system SQLite instead of bundled

### Pitfall 9: Text Classification Model Cannot Handle Mixed Language
**What goes wrong:** LLM trained primarily on English classifies French text poorly. Code-switched sentences (common in Quebec) produce random results.

**Prevention:**
- Choose LLMs with strong multilingual training data (SmolLM2, Llama 3.2 have multilingual variants)
- Test with Quebec French samples containing typical code-switching patterns
- Simpler approach: extract keywords regardless of language and use them for classification — "faut que je" → task, "je me souviens" → diary, "idée" → note
- Keep class prompt simple and language-agnostic: use category names as-is (diary/task/note)

### Pitfall 10: Audio File Cleanup Causes Space Issues
**What goes wrong:** Over months, accumulated audio files fill device storage. Each 1-minute recording at AAC quality is ~1 MB. 1000 entries = 1 GB.

**Prevention:**
- Auto-delete audio files older than 30/60/90 days (opt-in by user)
- Offer "keep text only, delete audio" bulk action
- Show storage usage in settings
- Use lower bitrate for recording (voice doesn't need high quality — 16kHz mono is sufficient for STT)
- Consider deleting audio immediately after successful transcription (but keep for review)

## Minor Pitfalls

### Pitfall 11: Recording Permission Denied After Initial Grant
iOS can revoke microphone permission if app hasn't been used. Always check permission before recording, not at boot.

### Pitfall 12: Navigation Gesture Conflicts During Recording
On iOS, swiping back can interrupt audio. Lock navigation during active recording, or handle interruption gracefully.

### Pitfall 13: No Haptic Feedback on Silent Mode
On iOS Silent Mode, haptics don't fire. Use visual feedback (animation + color change) as the primary indicator.

### Pitfall 14: Large FTS5 Database Size
FTS5 indexes grow with content. For a text-only diary with 1000s of entries, this is negligible (< 5 MB). Monitor but don't optimize prematurely.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 2: Audio Capture | Background recording not configured correctly | Test on real devices early; verify `allowsBackgroundRecording: true` |
| Phase 4: SQLCipher | Build conflicts with expo-updates | Test build immediately after adding; have `useThirdPartySQLitePod` ready |
| Phase 5: STT | Model download blocks first launch | Use tiny model initially; add progress + pause/resume |
| Phase 5: STT | Bilingual accuracy | Test with Quebec French audio samples before shipping |
| Phase 6: NLP | RAM pressure from concurrent models | Lazy-load NLP; unload Whisper when not in use |
| Phase 6: NLP | Classification accuracy on mixed-language text | Test with code-switched examples; add keyword fallback |
| Phase 11: Background | OS terminates recording service | Save audio in chunks; restore state on foreground |

## Sources

- expo-audio background recording issues: [github.com/expo/expo/issues/40945](https://github.com/expo/expo/issues/40945) — HIGH confidence (community-reported issues with solutions)
- SQLCipher build conflicts: [op-sqlite docs on conflicts](https://op-engineering.github.io/op-sqlite/docs/installation/) — MEDIUM confidence
- Whisper multilingual accuracy: General knowledge; no specific CA-FR benchmark found — LOW confidence; needs phase-specific validation
- RN on-device AI RAM constraints: [expo.dev/blog](https://expo.dev/blog/how-to-run-ai-models-with-react-native-executorch) — HIGH confidence (directly discusses hardware constraints)
- Variant Systems background recording production experience: [variantsystems.io](https://variantsystems.io/blog/react-native-audio-recording-ai-pipeline) — MEDIUM confidence (production case study)
