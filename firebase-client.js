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

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

onAuthStateChanged(auth, user => {
  window.dispatchEvent(new CustomEvent("firebase-auth-changed", { detail: { user: user ? {
    uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL
  } : null } }));
});

window.firebaseBridge = {
  getUser: () => auth.currentUser,
  signIn: () => signInWithPopup(auth, provider),
  signOut: () => signOut(auth),
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
