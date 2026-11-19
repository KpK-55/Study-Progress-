# Firebase setup — Time and Task Tracker

## Already completed in Firebase Console
- Web app registered in project `time-and-task-tracker`.
- Cloud Firestore database created.
- Google sign-in provider enabled.
- GitHub Pages domain `kpk-55.github.io` authorized.
- Firestore rules published to restrict data to the signed-in user's UID.

## Application integration
- `firebase-client.js` initializes Firebase Web SDK 13.4.0 using this project's web-app configuration.
- Google sign-in uses Firebase Authentication popup flow.
- User data is stored under `users/{uid}/appData/{workspace|preferences|countdown}`.
- Each document stores a payload, schema version, writer device ID, and update metadata.
- Background sync is attempted after local workspace, preference, and countdown changes when signed in.
- If the remote copy is newer than the last copy this device synchronized, safe sync pauses rather than silently overwriting it. The user can choose to restore the cloud copy or explicitly replace it.

## Important deployment notes
1. Keep `index.html`, `firebase-client.js`, `sw.js`, `manifest.json`, and `icons/` together in the GitHub Pages deployment root.
2. The Firebase web API key is public client configuration, not a service-account credential. Do not add a service-account JSON file or private key to this repository.
3. Keep Firestore rules restricted to `request.auth.uid == userId`. Never publish open read/write rules.
4. Test Google sign-in on the deployed HTTPS GitHub Pages domain. Browser popup restrictions can prevent sign-in in some embedded webviews; use the system browser/PWA if that occurs.
5. This batch does not yet implement Google Drive automatic backup, exam preparation, or full record-level merge. Those remain separate implementation steps. Export JSON remains available as a manual backup.

## Data migration on first sign-in
- If the cloud is empty, Safe Sync uploads the current device's local workspace, preferences, and countdown.
- If cloud data already exists and this device has not synchronized before, Safe Sync reports a conflict. Choose **Use Cloud Copy** to restore cloud data or **Replace Cloud with This Device** only when you intentionally want this device's data to become the cloud copy.
