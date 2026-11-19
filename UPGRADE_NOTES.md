# Study Progress upgrade notes — implementation batch 1

## Included in this batch
- Timer now derives elapsed time from timestamps rather than counting interval ticks, so background throttling no longer causes timer drift.
- Active timer state is periodically persisted and recovered after reopening the app.
- Timer overlay has separate Close, Discard and Stop & Save actions. Close hides the overlay without stopping the session.
- Manual study-time entry is available from the gallery.
- Sessions spanning multiple selected chapters are split into per-chapter log entries with exact total seconds preserved.
- Daily checklist lets the user assign only the tasks intended for that chapter/day; gallery completion uses assigned tasks.
- Added a basic undo stack for recent saved workspace changes (up to 20 actions in the current app session).
- Challenge-day report now includes subject distribution, chapter activity, session count and checklist summary.
- Raised gallery overlay/dropdown stacking so the task menu is not hidden behind adjacent gallery cards.
- Corrected PWA icon paths to use the repository's `icons/` directory and updated the service-worker cache version.
- Updated the Android build workflow to copy the icons directory into the Capacitor web bundle.

## Not yet included — next integration batch
- Firebase Firestore authentication, record-level cloud sync and conflict recovery. Firebase project web configuration and Firestore rules are required before connecting devices.
- Automated Google Drive snapshot backup as a separate scheduled/triggered backup workflow. Existing Apps Script backup is retained as a legacy manual fallback and is not safe as the primary multi-device sync.
- Exam Prep workspace and exam-linked timer sessions.
- Multi-chapter selection inside the portrait daily checklist (gallery timer already supports chapter multiselect).

## Validation
- Inline JavaScript syntax checked with `node --check`.
- APK/PWA runtime testing on Android and desktop has not yet been performed.
