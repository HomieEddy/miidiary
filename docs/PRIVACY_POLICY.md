# Privacy Policy — Dear Diary

**Effective date:** August 9, 2026

Dear Diary ("the App") is a private, offline-first voice journaling application developed by Homie Eddy. This policy explains what information the App collects, uses, and stores.

## 1. Zero Data Collection

Dear Diary is designed around a single principle: **your thoughts stay on your device**. The App:

- Does **not** collect, transmit, or sell personal data
- Does **not** use analytics, advertising, or tracking SDKs
- Does **not** create an account or require registration
- Does **not** contact external servers in normal use
- Works fully offline

## 2. Local Processing Only

- **Voice recordings** are captured with your microphone and processed entirely on-device by a speech-to-text model. Recordings are **ephemeral**: the raw audio is deleted immediately after transcription and never leaves the device.
- **Transcribed entries** (diary entries, tasks, notes) are stored locally in an **encrypted** on-device database (AES-256). Encryption keys live in the device's secure keychain (iOS Keychain / Android Keystore).
- **Automatic classification** (Diary / Task / Note) runs locally with an on-device model and keyword heuristics.

## 3. Biometric Authentication

The App can lock access behind your device's biometric authentication (Face ID, Touch ID, or fingerprint). Biometric data is handled entirely by the operating system's secure enclave; the App never receives, stores, or transmits biometric information.

## 4. Permissions

| Permission | Purpose |
|---|---|
| Microphone | Capturing voice notes (audio never leaves the device and is deleted after transcription) |
| Notifications | Optional daily reminders to capture a thought (can be disabled in-app) |
| Face ID / Touch ID | Optional lock for your diary |

## 5. Notifications

If you enable the daily reminder, notification scheduling data is stored locally on the device only. You can disable reminders at any time in the App's Digests settings.

## 6. Children's Privacy

The App does not knowingly collect any personal information from children. There is no account system and no data collection to protect against.

## 7. Data Deletion

You can delete individual entries or erase all data at any time from within the App (Digests settings → erase all data, protected by biometric re-authentication). Deleting the App from your device also removes all local data.

## 8. Changes to This Policy

If this policy changes, an updated version will be posted at this URL with a new effective date.

## 9. Contact

For privacy questions, contact: mceddy95@hotmail.fr

---

*Host this document at a public URL (e.g., GitHub Pages) and enter the URL in App Store Connect ("App Privacy") and Google Play Console ("Privacy Policy").*
