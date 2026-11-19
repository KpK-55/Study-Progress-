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
Test Google sign-in on the deployed HTTPS GitHub Pages domain. Pop-up restrictions may block sign-in inside embedded Android WebViews; use the browser/PWA while testing.

## Sync notes
Firestore stores user-specific workspace, preferences and countdown documents. The current sync layer detects a newer remote revision and pauses rather than silently overwriting it; it is conflict detection, not full record-level merging. Google Drive automatic backup and Exam Prep remain separate pending work.
