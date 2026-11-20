// Firebase client for GitHub Pages and Capacitor. Authentication and Drive
// authorization are deliberately separate: signing in must not request Drive.
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp, runTransaction, collection, query, orderBy, limit, getDocs, onSnapshot, collection, query, orderBy, limit, getDocs, onSnapshot
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const dispatch = (name, detail = {}) => window.dispatchEvent(new CustomEvent(name, { detail }));
const apiKey = String(firebaseConfig?.apiKey || "").trim();
if (!apiKey || apiKey === "PASTE_EXACT_API_KEY_HERE") {
  const message = "Firebase is not configured. Open firebase-config.js and paste the exact Web API key from Firebase Console → Project settings → Your apps → Config.";
  window.firebaseBridge = {
    getUser: () => null,
    signIn: async () => { throw new Error(message); },
    authorizeDrive: async () => { throw new Error(message); },
    hasDriveAccess: () => false,
    backupToDrive: async () => { throw new Error(message); },
    signOut: async () => {},
    pullBundle: async () => { throw new Error(message); },
    safeSync: async () => { throw new Error(message); },
    forcePush: async () => { throw new Error(message); }
  };
  dispatch("firebase-init-error", { message });
} else {
  try {
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

    // Firestore rejects undefined at any nesting depth. Workspace data can acquire
    // undefined properties from optional UI fields, so normalize the JSON-like
    // payload before writing. Arrays preserve positions as null; object keys are omitted.
    function cleanFirestoreValue(value) {
      if (value === undefined || typeof value === "function" || typeof value === "symbol") return undefined;
      if (value === null || typeof value !== "object") {
        if (typeof value === "number" && !Number.isFinite(value)) return null;
        return value;
      }
      if (Array.isArray(value)) return value.map(item => {
        const cleaned = cleanFirestoreValue(item);
        return cleaned === undefined ? null : cleaned;
      });
      const out = {};
      Object.entries(value).forEach(([key, item]) => {
        const cleaned = cleanFirestoreValue(item);
        if (cleaned !== undefined) out[key] = cleaned;
      });
      return out;
    }
    const readBundle = async uid => {
      const names = ["workspace", "preferences", "countdown", "syncState"];
      const snaps = await Promise.all(names.map(name => getDoc(userDoc(uid, name))));
      if (!snaps.some(s => s.exists())) return null;
      const out = {};
      snaps.forEach((snap, i) => {
        if (snap.exists() && names[i] !== "syncState") out[names[i] === "preferences" ? "prefs" : names[i]] = snap.data().payload;
      });
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
        if (!force && remoteVersion > lastRemote) { conflict = true; return; }
        [["workspace", bundle.workspace], ["preferences", bundle.prefs], ["countdown", bundle.countdown]].forEach(([name, payload]) => {
          const safePayload = cleanFirestoreValue(payload ?? null);
          transaction.set(userDoc(user.uid, name), { payload: safePayload, schemaVersion: 1, writerId, updatedAt: serverTimestamp(), clientUpdatedAt: stamp });
        });
        transaction.set(metaRef, { schemaVersion: 1, writerId, clientUpdatedAt: stamp, updatedAt: serverTimestamp() });
      });
      if (conflict) return { conflict: true };
      // Keep a small cloud version history for rollback. A snapshot is best-effort:
      // the live workspace sync remains successful even if a large snapshot exceeds Firestore limits.
      try {
        const versionRef = doc(collection(db, "users", user.uid, "appData", "versions"));
        await setDoc(versionRef, { clientUpdatedAt: stamp, writerId, createdAt: serverTimestamp(), payload: cleanFirestoreValue(bundle) });
        const old = await getDocs(query(collection(db, "users", user.uid, "appData", "versions"), orderBy("clientUpdatedAt", "desc")));
        for (const snap of old.docs.slice(10)) await deleteDoc(snap.ref);
      } catch (historyError) { console.warn("Cloud version history snapshot skipped:", historyError); }
      localStorage.setItem(LAST_REMOTE_KEY, String(stamp));
      return { conflict: false, updatedAt: stamp };
    }

    // Basic provider is used for Firebase login only.
    const authProvider = new GoogleAuthProvider();
    authProvider.setCustomParameters({ prompt: "select_account" });
    async function signInToFirebase() {
      try { return await signInWithPopup(auth, authProvider); }
      catch (error) {
        if (error.code === "auth/popup-blocked") throw new Error("The browser blocked the Google sign-in popup. Allow popups for your GitHub Pages site and try again.");
        if (error.code === "auth/unauthorized-domain") throw new Error("This website domain is not authorized. Add its hostname in Firebase Authentication → Settings → Authorized domains.");
        if (error.code === "auth/api-key-not-valid") throw new Error("Firebase rejected the Web API key. Copy apiKey (not appId) from Firebase Project settings → Your apps → Config into firebase-config.js.");
        throw error;
      }
    }

    let driveAccessToken = null;
    const DRIVE_FOLDER_NAME = "Time & Task Tracker Backups";
    const driveProvider = new GoogleAuthProvider();
    driveProvider.addScope("https://www.googleapis.com/auth/drive.file");
    driveProvider.setCustomParameters({ prompt: "consent", include_granted_scopes: "true" });
    async function authorizeDrive() {
      if (!auth.currentUser) await signInToFirebase();
      const result = await signInWithPopup(auth, driveProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      driveAccessToken = credential?.accessToken || null;
      if (!driveAccessToken) throw new Error("Google did not return a Drive access token. Try Authorize Google Drive again and accept the permission.");
      return driveAccessToken;
    }
    async function driveApi(url, options = {}) {
      if (!driveAccessToken) throw new Error("Authorize Google Drive backup first.");
      const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${driveAccessToken}`, ...(options.headers || {}) } });
      if (!response.ok) {
        const body = await response.text().catch(() => "");
        if (response.status === 401) driveAccessToken = null;
        if (response.status === 403 && /has not been used|disabled|accessNotConfigured/i.test(body)) {
          throw new Error("Google Drive API is disabled for Firebase project 251824598441. Enable Google Drive API in Google Cloud Console, wait 2–5 minutes, then click Authorize Google Drive again: https://console.cloud.google.com/apis/library/drive.googleapis.com?project=251824598441");
        }
        throw new Error(`Google Drive API ${response.status}: ${body.slice(0, 240) || response.statusText}`);
      }
      return response.status === 204 ? null : response.json();
    }
    async function ensureDriveFolder() {
      const q = encodeURIComponent(`name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const found = await driveApi(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=10&fields=files(id,name)`);
      if (found.files?.length) return found.files[0].id;
      const created = await driveApi("https://www.googleapis.com/drive/v3/files?fields=id,name", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }) });
      return created.id;
    }
    async function backupBundleToDrive(bundle) {
      if (!driveAccessToken) throw new Error("Drive access is not authorized in this session. Click Authorize Google Drive.");
      const folderId = await ensureDriveFolder();
      const now = new Date(), stamp = now.toISOString().replace(/[:.]/g, "-"), boundary = "ttt_" + Math.random().toString(16).slice(2);
      const metadata = { name: `Study-Progress-Backup-${stamp}.json`, mimeType: "application/json", parents: [folderId] };
      const payload = { app: "Time & Task Tracker", schemaVersion: 3, createdAt: now.toISOString(), ...bundle };
      const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--`;
      const created = await driveApi("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime", { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body });
      const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const list = await driveApi(`https://www.googleapis.com/drive/v3/files?q=${q}&pageSize=100&orderBy=createdTime desc&fields=files(id,name,createdTime)`);
      for (const old of (list.files || []).slice(30)) { try { await driveApi(`https://www.googleapis.com/drive/v3/files/${old.id}`, { method: "DELETE" }); } catch (e) { console.warn("Could not prune old Drive backup", e); } }
      return created;
    }

    onAuthStateChanged(auth, user => dispatch("firebase-auth-changed", { user: user ? { uid:user.uid, displayName:user.displayName, email:user.email, photoURL:user.photoURL } : null }));
    window.firebaseBridge = {
      getUser: () => auth.currentUser,
      getDeviceId: () => writerId,
      getDeviceId: () => writerId,
      signIn: signInToFirebase,
      authorizeDrive,
      hasDriveAccess: () => Boolean(driveAccessToken),
      backupToDrive: backupBundleToDrive,
      signOut: async () => { driveAccessToken = null; return signOut(auth); },
      pullBundle: async () => {
        if (!auth.currentUser) throw new Error("Sign in with Google first.");
        const bundle = await readBundle(auth.currentUser.uid);
        if (bundle) localStorage.setItem(LAST_REMOTE_KEY, String(bundle.updatedAt || Date.now()));
        return bundle;
      },
      safeSync: bundle => writeBundle(bundle, false),
      forcePush: bundle => writeBundle(bundle, true),
      getRemoteMeta: async () => {
        if (!auth.currentUser) return null;
        const snap = await getDoc(userDoc(auth.currentUser.uid, "syncState"));
        return snap.exists() ? snap.data() : null;
      },
      watchRemoteMeta: callback => {
        if (!auth.currentUser) return () => {};
        return onSnapshot(userDoc(auth.currentUser.uid, "syncState"), snap => callback(snap.exists() ? snap.data() : null));
      },
      listVersions: async () => {
        if (!auth.currentUser) throw new Error("Sign in with Google first.");
        const snaps = await getDocs(query(collection(db, "users", auth.currentUser.uid, "appData", "versions"), orderBy("clientUpdatedAt", "desc"), limit(10)));
        return snaps.docs.map(s => ({ id:s.id, ...s.data(), payload:undefined }));
      },
      restoreVersion: async versionId => {
        if (!auth.currentUser) throw new Error("Sign in with Google first.");
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid, "appData", "versions", versionId));
        if (!snap.exists()) throw new Error("That cloud version is no longer available.");
        const payload = snap.data().payload;
        if (!payload) throw new Error("This version has no restorable data.");
        return payload;
      }
    };
    dispatch("firebase-client-ready", {});
  } catch (error) {
    const message = `Firebase could not initialize: ${error.message || error}`;
    window.firebaseBridge = { getUser:()=>null, signIn:async()=>{throw new Error(message);}, authorizeDrive:async()=>{throw new Error(message);}, hasDriveAccess:()=>false, backupToDrive:async()=>{throw new Error(message);}, signOut:async()=>{}, pullBundle:async()=>{throw new Error(message);}, safeSync:async()=>{throw new Error(message);}, forcePush:async()=>{throw new Error(message);} };
    dispatch("firebase-init-error", { message });
  }
}
