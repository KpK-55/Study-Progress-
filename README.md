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
* **Anki-Protocol Cross-Device Cloud Sync:** Connect your personal Google Apps Script URL once under **Sync (`⋮`)** to back up and sync all databases, timers, themes, and settings seamlessly between your Android app and PC browser.
* **Fully Customizable Appearance:** Switch between Light/Dark mode, 6 typography styles, text sizes, page widths, and accent colors in **Settings**.

---

HOW TO DOWNLOAD THIS APP ?
Go to release section
click on tag
open Tag 
scroll to the bottom
Under asset you'll find apk file

## ☁️ Cloud Sync Setup Guide (Google Drive Backup & Cross-Device Sync)

Your study data is stored privately inside **your own Google Drive**—no third-party account or subscription is needed. Follow these steps once to link your PC and phone:

### Step 1: Create Your Free Google Drive Sync Endpoint
1. Open the app, click **`⋮`** next to the **☁️ Sync** button in the top-right bar, and click **📋 Copy Google Script**.
2. Go to [script.google.com](https://script.google.com) on your browser and click **New project**.
3. Delete any placeholder code in the editor, paste the copied script, and click **Save** (`Ctrl + S`).
4. Click **Deploy** (top right) → **New deployment**.
5. Click the gear icon (`⚙️`) next to *Select type* and choose **Web app**.
6. Set **Execute as** to **Me**, and set **Who has access** to **Anyone**.
7. Click **Deploy**, authorize permissions when prompted (*Advanced → Go to project*), and copy the **Web app URL** (`https://script.google.com/macros/s/.../exec`).

### Step 2: Connect Your Devices
1. In **TIME & TASK TRACKER** (on both your PC browser/PWA and your Android APK), click **`⋮`** beside **☁️ Sync**.
2. Paste your **Web app URL** into the input box and click **🔄 Smart Sync Now (Auto-Merge)**.
3. A backup file named `Time_Task_Tracker_Backup.json` is automatically created in your Google Drive.

### Step 3: Everyday One-Click Syncing & Status Colors
After the initial setup, simply click the **☁️ Sync** button anytime to back up or pull updates:
* **🟢 Green (`☁️ Sync`):** Your device is completely up to date with Google Drive.
* **🟡 Amber (`☁️ Syncing...`):** Sync is actively transferring your databases, timers, and settings.
* **🔴 Red (`☁️ Sync`):** Either you have new local edits waiting to be backed up, or another device pushed newer progress to the cloud—just tap **☁️ Sync** once to merge and turn it green!
* **Manual Override (`⋮`):** Need to overwrite one device from another? Open **`⋮`** and use **⬆ Push Local to Cloud** or **⬇ Pull Cloud to Device**.
