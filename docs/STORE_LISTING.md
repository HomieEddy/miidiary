# Store Listing — Dear Diary

Everything you need to fill out App Store Connect and Google Play Console.

## App identity

| Field | Value |
|---|---|
| App name | Dear Diary |
| Android package | `com.homieddy.miidiary` |
| iOS bundle ID | `com.homieddy.miidiary` |
| Version | 1.0.0 (build 1) |
| Category | Productivity (App Store) / Productivity (Google Play) |
| Privacy policy URL | host `docs/PRIVACY_POLICY.md` (e.g., GitHub Pages) and paste here |

## App Store

### Description (en)

> Dear Diary turns voice capture into an organized journal — 100% on your device. Tap once, speak your mind, and your thought is transcribed, classified, and filed as a diary entry, task, or note — all offline, all encrypted, with zero cloud.
>
> • One-tap voice capture with instant transcription (English & French)
> • Automatic organization: Diary, Tasks, Notes
> • Encrypted, private storage — audio is deleted after transcription
> • Daily reminders, weekly & monthly digests, streaks
> • Biometric lock, dark mode, and a warm paper-inspired design
>
> Your thoughts never leave your phone. No account, no tracking, no cloud.

### Keywords (100 chars max)
`diary, journal, voice, notes, tasks, private, offline, transcription, french, reminders`

### Privacy nutrition labels (App Store Connect)
- **Data not collected**: all categories off. No contact info, no identifiers, no usage data, no diagnostics.
- The app does use encryption (local database) — standard AES; check "yes, standard encryption" in export compliance → exempt (`ITSAppUsesNonExemptEncryption: false` is set).

### Screenshots (6.7" + 6.5" required)
Capture on a modern device, one per row, top-to-bottom:
1. Home — recorder + Daily Spark + streak chip
2. Diary — timeline with filter chips and search open
3. Tasks — task list with due/urgent chips
4. Digests — weekly/monthly cards + stats chart
5. Dark mode Home (shows warm dark theme)

### App Review notes
- Biometric lock requires device Face ID/Touch ID enrollment — reviewer should enroll or use the fallback (app falls through to unlocked when no biometrics are enrolled).
- No accounts; everything is local. A demo account is not needed.

## Google Play

### Short description (80 chars)
`Private voice journaling — offline, encrypted, automatic organization.`

### Full description
> Dear Diary is the private way to capture your thoughts: tap, speak, and go. On-device speech-to-text (English & Canadian French) instantly turns your voice into organized entries — Diary, Tasks, or Notes — with zero cloud and zero tracking.
>
> WHY DEAR DIARY
> • One-tap voice capture, haptic feedback, instant transcription
> • Automatic classification — thoughts land in the right place
> • Fully offline and encrypted (AES-256, keys in your device keystore)
> • Audio is ephemeral — deleted right after transcription
> • Daily reminders, weekly wrap-ups, monthly reflections, streaks
> • Biometric lock, warm dark mode, paper-inspired design
>
> PRIVACY FIRST
> Dear Diary collects no data, shows no ads, and phones nothing home. Your journal is yours.

### Data safety form (Play Console)
- **Data collected**: none (all categories "No")
- **Data shared**: none
- **Security practices**: all data encrypted in transit — not applicable (no network); data encrypted at rest — yes; "Deletion of data" — yes (in-app erase + app uninstall)

### Content rating questionnaire
- No violence, sexual content, drugs, or user-generated content sharing (entries never leave the device). "No" for interactive elements; advertising = "No".
- Target audience: everyone; not designed for children, no child-directed features.

### Store icon + feature graphic
- Icon: `assets/icon.png` (1024×1024, no alpha — App Store rejects icons with transparency).
- Feature graphic (1024×500): generate from the Home screen mock later; a simple branded tile with the app name works.

## Release checklist (before each submission)

- [ ] `npx tsc --noEmit` and `npm test` green
- [ ] `npx eas build --platform android --profile production` (AAB)
- [ ] `npx eas build --platform ios --profile production` (requires Apple Developer account)
- [ ] Privacy policy URL live and linked in both consoles
- [ ] Screenshots uploaded for required devices
- [ ] App Store: review notes + export compliance answered
- [ ] Play Console: data safety form + content rating completed
- [ ] Signing: Play App Signing (upload key) / Apple distribution certificate
