# Firebase setup — Time & Task Tracker

## Firebase Console
- Web app registered in project `time-and-task-tracker`.
- Cloud Firestore database created.
- Google sign-in provider enabled.
- GitHub Pages domain `kpk-55.github.io` authorized.
- Firestore rules must restrict each user to their own UID.

## Important: verify the Web API key
Open Firebase Console → Project settings (gear) → General → Your apps → Time and Task Tracker → SDK setup and configuration → Config.
Copy the exact `apiKey` value and paste it into `firebase-config.js`, replacing `PASTE_EXACT_API_KEY_HERE`.
Do not copy the key by retyping it from a screenshot. The earlier sign-in error `auth/api-key-not-valid` means the key embedded in the deployed bundle was not accepted by Firebase. If the exact key still fails, check Google Cloud Console → APIs & Services → Credentials for API-key restrictions; allow the Firebase Authentication APIs and your web referrers (`https://kpk-55.github.io/*` and `http://localhost:*`).

The browser tab favicon, PWA install icons, Apple touch icon, and Android launcher icons are generated from the supplied hourglass logo. If the old icon remains installed, remove the old PWA shortcut and install it again after deployment.

The web API key is public client configuration. Never add a service-account JSON or private key to this repository.

## Deployment
Keep `index.html`, `firebase-client.js`, `firebase-config.js`, `sw.js`, `manifest.json`, `icons/`, and `android-icons/` in the repository root.
After updating `firebase-config.js`, commit and push. The service-worker cache has been versioned so deployed clients fetch the new config and logo. If the old icon remains installed, remove the old PWA shortcut and install it again after deployment.

## Authentication
Firebase sign-in and Google Drive authorization are separate actions. The **Continue with Google** button requests only Firebase Authentication; it does not request Drive access. Use **Authorize Google Drive** later from Sync settings to grant the additional `drive.file` scope. Test Firebase sign-in on the deployed HTTPS GitHub Pages domain. Popup restrictions may block sign-in inside embedded Android WebViews; use the browser/PWA while testing. The app now displays a clear configuration message if `apiKey` is still the placeholder, and a specific message for invalid keys, blocked popups, or unauthorized domains.

## Sync notes
Firestore stores user-specific workspace, preferences and countdown documents. The current sync layer detects a newer remote revision and pauses rather than silently overwriting it; it is conflict detection, not full record-level merging. Google Drive automatic backup and Exam Prep remain separate pending work.


## Google Drive backup setup
1. In Google Cloud Console for the same Firebase project, enable **Google Drive API** (APIs & Services → Library → Google Drive API → Enable).
2. Keep Google as the Firebase Authentication provider. The app requests the `drive.file` permission during the **Authorize Google Drive** action.
3. Deploy the updated app over HTTPS, sign in with the same Google account, open Sync details, and click **Authorize Google Drive**. Accept the Drive permission.
4. Click **Backup now** once to verify. Later successful Firebase syncs create at most one automatic Drive backup per 24 hours while Drive authorization is active in that browser session. Re-authorize after a fresh browser session or when Google expires the access token.
5. Backups are JSON files in the visible **Time & Task Tracker Backups** folder. The app retains the 30 newest files it can see in that folder.

Drive backup is a secondary snapshot, not a sync engine. Firebase remains the primary cross-device sync service. The app never deletes Firebase records as part of Drive backup.


## Syllabus chapter dropdowns
Manual time logging uses each subject database's `chapterOptions` syllabus list as the canonical chapter dropdown. Repeated dated rows for the same chapter are grouped under one syllabus chapter. Daily task options are gathered from the selected chapter's rows for the chosen date.

## Exam timer
Exam plans store a required test duration. Starting an exam persists its start timestamp and elapsed duration; the displayed remaining time is calculated from timestamps rather than interval tick counts. Pause/resume and finish/record are supported.
