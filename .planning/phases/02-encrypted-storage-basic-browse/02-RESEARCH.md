# Phase 2: Encrypted Storage & Basic Browse - Research

**Researched:** 2026-05-18  
**Domain:** React Native local encrypted persistence + biometric gate + high-performance browse list  
**Confidence:** MEDIUM-HIGH

## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Use Realm as the Phase 2 storage engine. SQLCipher wording in roadmap is treated as outdated.
- D-02: Keep encryption key material flow locked to MMKV + Keychain.
- D-03: Keep fully offline behavior as a hard requirement (no external network dependency for storage/browse flows).
- D-04: Require biometric unlock on cold launch (not every short foreground resume).
- D-05: If biometric fails or is unavailable, allow device passcode fallback.
- D-06: Persist first-class fields: id, createdAt, updatedAt, text, category.
- D-07: Persist derived display fields: title and previewText.
- D-08: Derive title from the first sentence and truncate preview text deterministically.
- D-09: Diary browse uses day-grouped chronological sections (e.g., Today/Yesterday/older days).
- D-10: Each row shows category badge, title, one-line preview, and timestamp.
- D-11: Single-entry delete flow: long-press enters delete mode, show X affordance on entry card, tap X triggers confirm dialog.
- D-12: Wipe-all flow requires double confirmation plus biometric re-auth.

### the agent's Discretion
- Exact inactivity threshold policy for optional future resume-lock behavior.
- Exact truncation length for title and previewText as long as it is deterministic and testable.
- Exact day-section label formatting and localization details.
- Exact motion/haptic details for entering and exiting delete mode.

### Deferred Ideas (OUT OF SCOPE)
- Advanced full-text search and filtering (Phase 4).
- Entry text editing and classification override (Phase 4).
- Task-specific management UX beyond basic persisted browse (Phase 4).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STOR-01 | Store entries locally in encrypted Realm with MMKV + Keychain | Architecture, key lifecycle, schema, repository boundary |
| STOR-02 | Encryption keys in iOS Keychain / Android Keystore | Key lifecycle and secure storage flow |
| STOR-03 | No external servers/cloud | Offline-first data flow and guardrails |
| STOR-04 | Fully functional offline | No-network startup/read/write/delete design |
| STOR-05 | Delete one and wipe-all | Safety and consistency delete guidance |
| STOR-06 | Deterministic single-key index for fast timestamp/category query | Composite queryKey strategy |
| SEC-01 | Biometric lock on launch | Cold-start gate flow and error handling |
| SEC-02 | Use expo-local-authentication | Startup auth algorithm and fallback behavior |
| BROW-01 | Chronological FlashList browse | Day-grouped flatten strategy for FlashList |

## Project Constraints (from project instructions)
- Persistence is locked to Realm plus @realm/react; no SQLite/AsyncStorage alternatives. [CITED: AGENTS.md]
- Secure key material must use react-native-mmkv plus react-native-keychain. [CITED: AGENTS.md]
- Biometric auth must use expo-local-authentication. [CITED: AGENTS.md]
- Browse list must use @shopify/flash-list, not FlatList/SectionList for final implementation. [CITED: AGENTS.md]
- Screen components must stay thin and use NativeWind className styling only. [CITED: AGENTS.md]
- State remains Zustand for app-level orchestration, with services handling business logic. [CITED: AGENTS.md]

## Summary
Phase 2 should introduce a strict data boundary: Realm is source of truth for entry persistence, while Zustand stores only transient UI state (loading, delete mode, selected ids, auth status). This avoids stale mirrors and reduces migration risk while preserving current UI ergonomics. [CITED: AGENTS.md]

For STOR-06, use one deterministic indexed field queryKey that combines category and reverse timestamp so one key supports both broad chronological queries and category-specific chronological queries. This aligns with the explicit single-key index requirement and keeps reads stable for FlashList rendering. [ASSUMED]

Biometric lock belongs at app root, before tabs render. Gate only on cold launch and keep short resume unlocked (locked decision D-04). Use expo-local-authentication capability checks first, then authenticateAsync with device fallback enabled (disableDeviceFallback false) to satisfy D-05. [CITED: https://docs.expo.dev/versions/latest/sdk/local-authentication/]

**Primary recommendation:** Implement RealmProvider + Entry repository + startup biometric gate + FlashList flattened grouped model in one cohesive Phase 2 vertical slice.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Realm encrypted open/close | API/Backend (local service tier) | Database/Storage | Service owns config and key resolution, Realm stores data |
| Key generation and retrieval | API/Backend (local service tier) | Database/Storage | Keychain/MMKV are infra concerns, not UI concerns |
| Biometric cold-start gate | Frontend Server (app shell/root layout) | Browser/Client | Root route decides access before rendering feature routes |
| Entry CRUD | API/Backend (local repository) | Database/Storage | Repository abstracts writes/deletes and transactional behavior |
| Day grouping transform | Browser/Client | API/Backend | Presentation optimization for list rendering |
| FlashList rendering | Browser/Client | - | Pure UI virtualization concern |

## Recommended Architecture

### 1) Encrypted Realm setup and key lifecycle
- Generate a 64-byte Realm key once and persist canonical key bytes in Keychain service namespace. [VERIFIED: node_modules/realm/dist/public-types/Configuration.d.ts]
- Store only a key reference/version metadata in MMKV (for fast lookup and rotation metadata), not the key material itself as source-of-truth. [ASSUMED]
- At startup, resolve key in this order: MMKV metadata -> Keychain fetch by service name -> generate+persist if missing.
- Open Realm with explicit path, schema, schemaVersion, encryptionKey, and onMigration callback. [VERIFIED: node_modules/realm/dist/public-types/Configuration.d.ts]
- Never use deleteRealmIfMigrationNeeded in production path because it can silently destroy data. [VERIFIED: node_modules/realm/dist/public-types/Configuration.d.ts]

### 2) Realm schema and deterministic single-key index strategy
- Entry fields:
  - id: string primary key
  - createdAt: date
  - updatedAt: date
  - category: string enum (diary|task|note)
  - text: string
  - title: string
  - previewText: string
  - queryKey: string indexed
- Deterministic queryKey format:
  - category + "|" + reverseEpochMs padded to fixed width + "|" + id
  - reverseEpochMs = MAX_SAFE_TS_MS - createdAtMs
- Why this works:
  - Chronological all entries: sort by createdAt descending (or queryKey secondary). [ASSUMED]
  - Category filtered chronological: startsWith(category + "|") then ascending by queryKey yields newest-first because reverse time is smaller for newer entries. [ASSUMED]
  - Single indexed key supports both filter and order semantics for category timelines under STOR-06. [ASSUMED]
- Realm supports indexed properties and primaryKey semantics in schema metadata. [VERIFIED: node_modules/realm/dist/public-types/schema/types.d.ts]

### 3) Biometric gate startup flow (Expo RN)
- Root flow:
  1. App boot + fonts
  2. Check hasHardwareAsync + isEnrolledAsync
  3. If available/enrolled: authenticateAsync
  4. If success: mount protected tabs
  5. If fail/cancel: show lock screen with retry
  6. If unavailable/not enrolled: allow device passcode fallback path per D-05
- Use authenticateAsync options with clear prompt text and keep disableDeviceFallback as false to permit OS passcode fallback. [CITED: https://docs.expo.dev/versions/latest/sdk/local-authentication/]
- iOS requires Face ID usage description in app config/plist for full Face ID behavior. [CITED: https://docs.expo.dev/versions/latest/sdk/local-authentication/]

### 4) Repository boundary (Realm vs Zustand/UI)
- Realm repository/service owns:
  - schema, open/close, migrations
  - add/list/delete/wipe operations
  - query mapping to domain object
- Zustand owns only UI/session state:
  - delete mode state
  - selected entry ids
  - loading/error banners
  - lock/unlock state
- Hooks bridge UI to repository:
  - useEntries for list/group/delete/wipe commands
  - useTranscription writes through repository, not directly to store

### 5) FlashList day-grouped chronological strategy
- Build a flattened list model with two item types:
  - header item: day label (Today, Yesterday, MMM d)
  - row item: entry card payload
- Feed flattened model to FlashList and provide getItemType for recycling pools. [CITED: https://shopify.github.io/flash-list/docs/guides/section-list/]
- Keep stickyHeaderIndices computed from header indexes if sticky day headers desired. [CITED: https://shopify.github.io/flash-list/docs/guides/section-list/]
- FlashList v2 is new-architecture-focused and supports dynamic sizes without estimates. [CITED: node_modules/@shopify/flash-list/README.md]

### 6) Delete-one and wipe-all safety and consistency
- Delete-one:
  - long press toggles delete mode
  - tap X opens confirm dialog
  - on confirm, execute realm.write + delete by id
  - optimistic UI allowed only after transaction success callback
- Wipe-all:
  - first confirm dialog (destructive)
  - second explicit typed/secondary confirm (as per D-12 intent)
  - biometric re-auth immediately before execute
  - transaction deletes all entry objects, then clears derived caches
  - invalidate list queries and exit delete mode
- On wipe-all, clear MMKV metadata that references list/filter state but do not automatically destroy keychain key unless user selected full cryptographic reset. [ASSUMED]

## Proposed File Map (Phase 2)

- src/models/EntryRealm.ts
  - Realm object model and schema declaration for Entry
- src/services/keychainService.ts
  - Keychain get/set/reset for Realm key bytes and metadata
- src/services/secureStorageService.ts
  - MMKV instance for key metadata and non-secret secure flags
- src/services/realmService.ts
  - Realm open config, key resolution, schemaVersion, migration hooks
- src/services/entriesRepository.ts
  - CRUD API over Realm, deterministic queryKey generation, delete/wipe
- src/hooks/useEntries.ts
  - UI-facing hook for grouped browse data + delete/wipe actions
- src/stores/entriesStore.ts
  - Refactor to UI-only state (delete mode/loading/error), remove persisted entry array source-of-truth
- src/hooks/useTranscription.ts
  - Replace Zustand addEntry call with repository createEntry call
- src/components/ui/EntryListItem.tsx
  - Reusable browse row card (category badge, title, preview, time)
- src/components/ui/EntryDayHeader.tsx
  - Day section header component for flattened FlashList model
- src/components/ui/DeleteModeToolbar.tsx
  - Delete-mode controls and wipe-all trigger
- src/components/ui/BiometricGate.tsx
  - Lock screen shell + retry/fallback UX
- src/screens/DiaryScreen.tsx
  - FlashList browse integration using useEntries flattened data
- src/app/_layout.tsx
  - Mount biometric gate before tabs render on cold launch
- src/utils/entryTextDerivation.ts
  - Deterministic title/preview generation from transcript text
- src/utils/entryGrouping.ts
  - Day grouping + flatten function with stable keys/sticky indices
- src/types/entry.ts
  - Shared domain types for entry and flattened list items
- src/tests/entriesRepository.test.ts
  - Repository unit tests (create/query/delete/wipe/queryKey)
- src/tests/entryGrouping.test.ts
  - Grouping and day header flatten logic tests
- src/tests/entryTextDerivation.test.ts
  - Deterministic truncation and sentence extraction tests
- src/tests/biometricGate.test.tsx
  - Lock flow behavior with mocked expo-local-authentication
- src/tests/DiaryScreen.test.tsx
  - FlashList rendering and delete-mode interaction smoke tests

## Testing Strategy

### Unit tests
- queryKey deterministic generation and ordering behavior (STOR-06)
- title/preview derivation deterministic outputs from fixed input (D-08)
- day grouping and flatten output stability for mixed dates/categories (BROW-01)
- repository delete by id and wipe-all correctness (STOR-05)

### Integration tests (Jest + RTL)
- useTranscription -> repository create -> DiaryScreen list reflects entry
- biometric gate blocks tabs until success state
- delete mode long-press -> confirm -> item removed from rendered list
- wipe-all flow requires second confirmation and re-auth before delete call

### Manual checks
- Airplane mode full run: capture text, save, restart app, browse entries
- Kill app and relaunch: biometric prompt appears on cold launch
- Device with no enrolled biometric: passcode fallback path works
- Large list sanity check (1k+ entries): smooth scroll with headers and no blank cells
- Wipe-all destructive flow: confirms twice, re-auth required, list empty afterward

## Risks, Pitfalls, and Mitigation Checklist

- Risk: accidental data loss via migration shortcut
  - Mitigation: disallow deleteRealmIfMigrationNeeded in production config.
- Risk: key mismatch causing unreadable Realm
  - Mitigation: versioned key metadata + single key source-of-truth in Keychain.
- Risk: stale UI from duplicated storage in Zustand and Realm
  - Mitigation: keep Realm as sole persisted source; Zustand UI-only.
- Risk: FlashList jitter with mixed row/header types
  - Mitigation: strict getItemType and stable item keys.
- Risk: biometric dead-end on unavailable hardware
  - Mitigation: explicit capability checks and fallback handling.
- Risk: wipe-all race with open write transactions
  - Mitigation: serialize destructive operations through repository mutex. [ASSUMED]
- Risk: timezone/day-boundary grouping bugs
  - Mitigation: centralize grouping utility and unit test around UTC/local boundary cases.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | MMKV should hold only key metadata while Keychain is canonical key source | Key lifecycle | Medium: implementation could become inconsistent with existing secure storage policy |
| A2 | Composite queryKey should be primary indexed field for STOR-06 target | Schema/indexing | Medium: query strategy may need benchmark tuning |
| A3 | Wipe-all should not delete key material unless explicit cryptographic reset is requested | Delete/wipe | Medium: security UX expectations may differ |
| A4 | Repository mutex serialization needed for destructive ops | Pitfalls | Low: may be unnecessary if write path already serialized |

## Sources

### Primary
- [VERIFIED: npm registry] realm 20.2.0, @realm/react 0.20.0, react-native-mmkv 4.3.1, react-native-keychain 10.0.0, expo-local-authentication 55.0.14, @shopify/flash-list 2.3.1 via npm view on 2026-05-18.
- [VERIFIED: node_modules/realm/dist/public-types/Configuration.d.ts] encryption key is 512-bit (64-byte), migration/deleteRealmIfMigrationNeeded/onMigration config options.
- [VERIFIED: node_modules/realm/dist/public-types/schema/types.d.ts] indexed property and primary key/index semantics.
- [VERIFIED: node_modules/react-native-keychain/lib/typescript/index.d.ts] set/get/reset generic password APIs.
- [VERIFIED: node_modules/react-native-keychain/lib/typescript/types.d.ts] accessControl, accessible, authentication prompt options.
- [CITED: https://docs.expo.dev/versions/latest/sdk/local-authentication/] hasHardwareAsync, isEnrolledAsync, authenticateAsync, fallback options, iOS Face ID config requirements.
- [CITED: https://shopify.github.io/flash-list/docs/guides/section-list/] flattened section-header item approach and getItemType/stickyHeaderIndices pattern.
- [CITED: node_modules/@shopify/flash-list/README.md] v2 new architecture focus and performance behavior.

### Secondary
- [CITED: node_modules/realm/README.md] Atlas Device Sync deprecation context while on-device database remains available.

## Metadata

**Confidence breakdown:**
- Encrypted stack capabilities: HIGH (package typings + official docs)
- Browse rendering pattern: HIGH (FlashList docs)
- Deterministic single-key index design details: MEDIUM (design is inferred from requirement intent)
- Delete/wipe operational safeguards: MEDIUM (best-practice architecture, partly assumption-based)

**Research date:** 2026-05-18  
**Valid until:** 2026-06-17
