# Study Progress final upgrade batch 4

## Included
- Date-specific daily task assignments; prior legacy daily assignments are migrated once to the current local date.
- Daily checklist percentages count only tasks assigned for the selected date.
- Gallery timer task multiselect is limited to tasks assigned to the selected chapters for the selected tracking date.
- Manual time entry selects a subject database, loads its chapters, allows chapter multiselect, loads assigned tasks for the selected date, and writes split logs into that subject database. These workspace logs are included in Firebase sync.
- Exam Prep remains independent and reads the existing subject databases and linked timer/manual logs.
- Sync button reports sign-in, pending, syncing, synced, conflict and error status; the adjacent menu opens sync settings.
- Refined charcoal dark theme with blue accents and clearer controls/surfaces.
- Google Drive secondary backup via Google Drive API using the user's own Google sign-in and the `drive.file` scope. Backups are JSON files in a dedicated Drive folder; newest 30 are retained.
- Service worker cache version bumped.

## Required setup
- Replace `PASTE_EXACT_API_KEY_HERE` in `firebase-config.js` with the exact Firebase Web API key.
- Enable Google Drive API in the same Google Cloud project.
- Sign in, open Sync details, click Authorize Google Drive, accept the permission, and test Backup now.
- Firebase remains primary sync; Drive is a secondary snapshot backup.

## Validation
- Application inline JavaScript and Firebase module syntax checked with Node.
- Static feature hooks checked.
- Runtime testing still required on deployed GitHub Pages and Android APK.


## Native revision and PWA-only update
- Removed the Android APK GitHub Actions workflow; PWA remains the installable app.
- Removed the dashboard revision due panel and added a bell-led dedicated revision screen.
- Revision intervals are Day 3, Day 7, Day 15 and Day 30.
- Revision responses are handled inside the app; no Google Sheet or Telegram integration is included.
- Firebase remains the cloud sync provider.
