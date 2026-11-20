# Study Progress

A standalone HTML/JavaScript study tracker deployed as a Progressive Web App (PWA) through GitHub Pages. The PWA can be installed from a supported browser and runs in a standalone app window; no Android APK build is maintained.

## Features
- Subject databases and chapter checklists
- Daily task assignment and completion tracking
- Focus timer with pause/resume and recovery
- Manual time logs, Exam Prep plans and challenge board
- Countdown, theme preferences, undo and JSON backup/import
- Firebase Google authentication and Firestore cross-device sync
- Native in-app chapter revision reminders and date-wise revision screen
- PWA installation with manifest and service worker

## Revision schedule
- Review intervals: Day 3, Day 7, Day 15 and Day 30. After Day 30, the schedule repeats at 30-day intervals.
- Use the bell beside Sync to open Today, Tomorrow, Upcoming or Date-wise revision lists.
- Mark a review Done or postpone it to Tomorrow.
- A red bell badge indicates unread due chapters.
- Revision records are stored in the workspace and included in Firebase sync.

## Firebase setup
1. Create a Firebase Web App and enable Google Authentication.
2. Create Cloud Firestore.
3. Publish the user-scoped Firestore rules documented in `FIREBASE_SETUP.md`.
4. Put the exact Firebase Web App `apiKey` into `firebase-config.js`.
5. Add the GitHub Pages host to Firebase Authentication authorized domains.

The app uses Firebase client configuration only. Never commit service-account private keys. Protect user data with Firestore Security Rules.

## Deployment
- GitHub Pages serves `index.html` from the configured repository branch/folder.
- Keep the PWA files (`manifest.json`, `sw.js`, and `icons/`) in the deployed root.
- Install from the browser's Install App option or browser menu when available.
- There is no APK workflow in this version.

## Backup and version history
Firebase is the primary cross-device sync provider. The Sync window includes restore-latest and cloud version history controls. JSON export/import remains available as a manual backup. Google Drive backup is optional and requires separate authorization.
