# ⏳ TIME & TASK TRACKER — Quick Start & Features Guide

**TIME & TASK TRACKER** is an all-in-one, offline-capable study planner, focus timer, and progress tracker built for students across any exam, degree, or personal goal.

---

## 🚀 Quick Start in 3 Simple Steps

1. **Create Your Subjects:** Click **Add / Manage Subjects** on the home screen to create your first subject or course database (e.g., *Physics*, *Anatomy*, *Mathematics*, or *Coding*).
2. **Add Chapters & Daily Tasks:** Open any subject card to add chapters and check off daily tasks (*Lecture*, *Reading*, *Notes*, *Practice*, *Revise*, or your own custom columns).
3. **Start a Focus Session:** Click **Start time** on any subject card, pick the chapter(s) and task(s) you are working on, and study distraction-free with the full-screen focus timer. Your study time is automatically logged into your database when you click **Stop & Save**.

---

## ✨ Key Features

* **Universal Subject & Course Repository:** Create unlimited databases organized by course or semester. Hide completed semesters from your dashboard via **Settings → Manage Subject Repository** without losing a single note or logged hour.
* **Smart Focus Timer & Automatic Time Rollup:** Full-screen study timer tracks your active chapter and tasks, then logs minutes straight into your database, daily **Total Hours**, and reports.
* **Mobile & Tablet Daily Checklist Mode:** Automatically switches to a clean, tap-friendly daily checklist in portrait view so you can tick off today's tasks without horizontal scrolling.
* **Taskwise & Subjectwise Visual Reports:** Click **Show Report** to analyze how your study hours are distributed across tasks and subjects over Today, 7 Days, 30 Days, or a custom date range.
* **Custom Target Countdown & Challenge Board:** Set a live countdown to your exam date in the top bar and customize a multi-day consistency heatmap (**Challenge Board**) with daily color-coded hour goals.
* **Firebase cloud sync:** Google sign-in and private Firestore storage under each account. Safe sync pauses when a newer cloud version is detected instead of silently overwriting it.
* **Fully Customizable Appearance:** Switch between Light/Dark mode, 6 typography styles, text sizes, page widths, and accent colors in **Settings**.

---

HOW TO DOWNLOAD THIS APP ?
Go to release section -
click on tag -
open Tag -
scroll to the bottom -
Under asset you'll find apk file

## ☁️ Firebase Cloud Sync

1. Open the app and click the **☁️ Sync** button.
2. Choose **Continue with Google** and sign in with the Google account you want to use on all devices.
3. On the first device, use **Safe Sync** to upload its local workspace if the Firebase account has no existing cloud copy.
4. On another device, sign in with the same Google account. If Firebase already contains data, choose **Use Cloud Copy** to restore it to the new device.
5. Future workspace, appearance preference, and countdown changes are automatically synced while online and signed in. You can also open Sync and press **Safe Sync** manually.

### Conflict protection

If a cloud update is newer than the last version this device synchronized, Safe Sync pauses. Choose **Use Cloud Copy** to replace this device with the cloud version, or **Replace Cloud with This Device** only after confirming that the local device contains the version you want to keep. Export a JSON backup before a manual replacement if unsure.

### Current scope

Firebase currently synchronizes the workspace, preferences, and countdown as separate documents. This first Firebase integration does not yet provide record-level merging, automatic Google Drive snapshots, or Exam Prep. Those are planned follow-up work. The JSON Export/Import controls remain available as a manual backup route.

### Firestore security

Keep the Firestore rules restricted to authenticated users whose UID matches the `{userId}` path. Never use public read/write rules. The Firebase web configuration in `firebase-client.js` is client configuration; never commit a service-account private key to GitHub.
