// Firebase client for the GitHub Pages / Capacitor standalone app.
import { firebaseConfig } from "./firebase-config.js";
// The web config is public client configuration; Firestore Security Rules protect user data.
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp, runTransaction
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "PASTE_EXACT_API_KEY_HERE") {
  throw new Error("Firebase setup incomplete: paste the exact Web API key into firebase-config.js.");
}


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const LAST_REMOTE_KEY = "time_task_tracker_firebase_remote_v1";
const writerId = (() => {
  const key = "time_task_tracker_device_id_v1";
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
})();

const userDoc = (uid, name) => doc(db, "users", uid, "appData", name);
const readBundle = async (uid) => {
  const names = ["workspace", "preferences", "countdown", "syncState"];
  const snaps = await Promise.all(names.map(name => getDoc(userDoc(uid, name))));
  if (!snaps.some(s => s.exists())) return null;
  const out = {};
  snaps.forEach((snap, i) => { if (snap.exists() && names[i] !== "syncState") out[names[i] === "preferences" ? "prefs" : names[i]] = snap.data().payload; });
  return { ...out, updatedAt: Math.max(0, ...snaps.filter(s => s.exists()).map(s => s.data().clientUpdatedAt || s.data().updatedAt?.toMillis?.() || 0)) };
};

async function writeBundle(bundle, force = false) {
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in with Google first.");
  const lastRemote = Number(localStorage.getItem(LAST_REMOTE_KEY) || 0);
  const stamp = Date.now();
  const metaRef = userDoc(user.uid, "syncState");
  let conflict = false;
  await runTransaction(db, async transaction => {
    const metaSnap = await transaction.get(metaRef);
    const remoteVersion = metaSnap.exists() ? Number(metaSnap.data().clientUpdatedAt) || 0 : 0;
    if (!force && remoteVersion > lastRemote) {
      conflict = true;
      return;
    }
    const records = [
      ["workspace", bundle.workspace],
      ["preferences", bundle.prefs],
      ["countdown", bundle.countdown]
    ];
    records.forEach(([name, payload]) => transaction.set(userDoc(user.uid, name), {
      payload: payload ?? null,
      schemaVersion: 1,
      writerId,
      updatedAt: serverTimestamp(),
      clientUpdatedAt: stamp
    }));
    transaction.set(metaRef, {
      schemaVersion: 1,
      writerId,
      clientUpdatedAt: stamp,
      updatedAt: serverTimestamp()
    });
  });
  if (conflict) return { conflict: true };
  localStorage.setItem(LAST_REMOTE_KEY, String(stamp));
  return { conflict: false, updatedAt: stamp };
}

let driveAccessToken = null;
const DRIVE_FOLDER_NAME = "Time & Task Tracker Backups";
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.setCustomParameters({ prompt: "select_account" });

async function obtainDriveToken() {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  driveAccessToken = credential?.accessToken || null;
  if (!driveAccessToken) throw new Error("Google did not return a Drive access token. Re-authorize and accept the Drive permission.");
  return driveAccessToken;
}

async function driveApi(url, options = {}) {
  if (!driveAccessToken) throw new Error("Authorize Google Drive backup first.");
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${driveAccessToken}`, ...(options.headers || {}) } });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) driveAccessToken = null;
    throw new Error(`Google Drive API ${response.status}: ${body.slice(0, 240) || response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}

async function ensureDriveFolder() {
  const q = encodeURIComponent(`name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const found = await driveApi(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=10&fields=files(id,name)`);
  if (found.files?.length) return found.files[0].id;
  const created = await driveApi("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" })
  });
  return created.id;
}

async function backupBundleToDrive(bundle) {
  if (!driveAccessToken) throw new Error("Drive access is not authorized in this session. Click Authorize Google Drive.");
  const folderId = await ensureDriveFolder();
  const now = new Date();
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const boundary = "ttt_" + Math.random().toString(16).slice(2);
  const metadata = { name: `Study-Progress-Backup-${stamp}.json`, mimeType: "application/json", parents: [folderId] };
  const payload = { app: "Time & Task Tracker", schemaVersion: 2, createdAt: now.toISOString(), ...bundle };
  const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--`;
  const created = await driveApi("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime", {
    method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body
  });
  // Keep the 30 most recent backups in this app-created folder.
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const list = await driveApi(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=100&orderBy=createdTime desc&fields=files(id,name,createdTime)`);
  for (const old of (list.files || []).slice(30)) {
    try { await driveApi(`https://www.googleapis.com/drive/v3/files/${old.id}`, { method: "DELETE" }); } catch (e) { console.warn("Could not prune old Drive backup", e); }
  }
  return created;
}

onAuthStateChanged(auth, user => {
  window.dispatchEvent(new CustomEvent("firebase-auth-changed", { detail: { user: user ? {
    uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL
  } : null } }));
});

window.firebaseBridge = {
  getUser: () => auth.currentUser,
  signIn: obtainDriveToken,
  authorizeDrive: obtainDriveToken,
  hasDriveAccess: () => Boolean(driveAccessToken),
  backupToDrive: backupBundleToDrive,
  signOut: async () => { driveAccessToken = null; return signOut(auth); },
  pullBundle: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Sign in with Google first.");
    const bundle = await readBundle(user.uid);
    if (bundle) localStorage.setItem(LAST_REMOTE_KEY, String(bundle.updatedAt || Date.now()));
    return bundle;
  },
  safeSync: bundle => writeBundle(bundle, false),
  forcePush: bundle => writeBundle(bundle, true)
};
