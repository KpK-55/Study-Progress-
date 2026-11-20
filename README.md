# Time & Task Tracker

A standalone HTML/JavaScript study tracker with a GitHub Pages PWA deployment and a Capacitor Android APK workflow.

## Features
- Subject databases and chapter checklists
- Daily task assignment and completion tracking
- Focus timer with pause/resume, recovery, discard, and close controls
- Multi-chapter study sessions with equal time allocation
- Manual time logs saved to the corresponding subject database
- Exam Prep plans across multiple subject databases
- Challenge board with per-day activity reports
- Countdown, theme preferences, undo, JSON backup/import
- Firebase Google authentication and Firestore synchronization
- PWA installation and Android APK build through GitHub Actions

## Firebase setup
1. Create a Firebase Web App and enable Google Authentication.
2. Create Cloud Firestore.
3. Publish the user-scoped Firestore rules documented in `FIREBASE_SETUP.md`.
4. Put the exact Firebase Web App `apiKey` into `firebase-config.js`.
5. Add the GitHub Pages host to Firebase Authentication authorized domains.

Never commit Firebase service-account private keys. The Firebase Web API key is client configuration; protect user data with Firestore Security Rules.

## Deployment
- GitHub Pages serves `index.html` from the configured repository branch/folder.
- GitHub Actions builds the Android debug APK. Download it from the workflow run's Artifacts section.
- Keep `.git` when replacing repository files locally. Do not upload `node_modules`.

## Backup note
Firebase is the primary sync provider in the current build. JSON export/import is available. Google Drive automatic backup still requires a separate Drive authorization/configuration step and is not yet active.


### Recent corrections
- Manual time chapter choices are sourced from the subject syllabus (`chapterOptions`) and deduplicated even when a chapter has multiple dated database rows. Daily tasks are collected for the selected date.
- Exam Prep now has a real elapsed-time session with a remaining-time display, pause/resume, and finish/record actions.
- Firebase Google sign-in no longer requests Google Drive permissions. Drive authorization is a separate, explicit step.
- Mobile dashboard controls use a compact two-row portrait layout.
