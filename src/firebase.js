import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';
import {
  optimizeImage,
  optimizeAvatarImage,
  optimizeBackgroundImage,
  optimizeLinkIcon
} from './utils/imageOptimizer';

const LOCAL_GUEST_KEY = 'linkspace_guest_user';
const LOCAL_PROFILES_KEY = 'linkspace_local_profiles';
const LOCAL_USERNAMES_KEY = 'linkspace_local_usernames';

let app = null;
let auth = null;
let db = null;
let storage = null;

// The checked-in Firebase config is the fallback. Environment variables can override it.
// Do NOT merge a second hard-coded Firebase project over firebaseConfig: doing so can
// silently connect authentication and Firestore to different projects/databases.
const envConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID
};

const activeConfig = {
  ...firebaseConfig,
  ...Object.fromEntries(Object.entries(envConfig).filter(([_, v]) => v != null && v !== ''))
};

try {
  if (activeConfig && activeConfig.apiKey) {
    app = initializeApp(activeConfig);
    auth = getAuth(app);
    // Use the explicitly configured named database when one is configured.
    db = activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, activeConfig.firestoreDatabaseId)
      : getFirestore(app);
    try {
      storage = getStorage(app);
    } catch (sErr) {
      console.warn('Firebase storage init warning:', sErr);
    }
    console.info('[Linkspace] Firebase connected:', {
      projectId: activeConfig.projectId,
      firestoreDatabaseId: activeConfig.firestoreDatabaseId || '(default)'
    });
  }
} catch (err) {
  console.warn('Firebase init warning:', err);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');
const customAuthListeners = new Set();

function notifyCustomAuth(user) {
  customAuthListeners.forEach((cb) => {
    try { cb(user); } catch (e) { console.error(e); }
  });
}

export async function loginWithEmail(email, password) {
  if (!auth) throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function registerWithEmail(email, password, displayName = '') {
  if (!auth) throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && res.user) await updateProfile(res.user, { displayName });
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithGoogle() {
  if (!auth) throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  try {
    const res = await signInWithPopup(auth, googleProvider);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithGithub() {
  if (!auth) throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  try {
    const res = await signInWithPopup(auth, githubProvider);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithMicrosoft() {
  if (!auth) throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  try {
    const res = await signInWithPopup(auth, microsoftProvider);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export function loginAsGuest(guestName = 'Creator', guestUsername = 'creator') {
  const guestUser = {
    uid: 'guest_' + Math.random().toString(36).substring(2, 9),
    displayName: guestName,
    email: `${guestUsername}@linkspace.local`,
    isAnonymous: true,
    isGuest: true,
    photoURL: ''
  };
  localStorage.setItem(LOCAL_GUEST_KEY, JSON.stringify(guestUser));
  notifyCustomAuth(guestUser);
  return guestUser;
}

export async function logoutUser() {
  localStorage.removeItem(LOCAL_GUEST_KEY);
  if (auth) {
    try { await signOut(auth); } catch (error) { console.warn('Logout error:', error); }
  }
  notifyCustomAuth(null);
}

export function subscribeToAuth(callback) {
  customAuthListeners.add(callback);
  const savedGuest = localStorage.getItem(LOCAL_GUEST_KEY);
  if (savedGuest) {
    try { callback(JSON.parse(savedGuest)); } catch (e) { localStorage.removeItem(LOCAL_GUEST_KEY); }
  }

  let unsubscribeFirebase = () => {};
  if (auth) {
    unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      const guest = localStorage.getItem(LOCAL_GUEST_KEY);
      if (user) callback(user);
      else if (guest) {
        try { callback(JSON.parse(guest)); } catch (e) { callback(null); }
      } else callback(null);
    });
  } else if (!savedGuest) {
    callback(null);
  }

  return () => {
    customAuthListeners.delete(callback);
    unsubscribeFirebase();
  };
}

function translateAuthError(code) {
  switch (code) {
    case 'auth/operation-not-allowed': return 'E-Mail/Passwort ist in der Firebase Console noch deaktiviert (unter Firebase Console -> Authentication -> Sign-in method aktivieren). Nutze alternativ Google, GitHub oder den Gast-Modus!';
    case 'auth/invalid-email': return 'Ungültige E-Mail-Adresse.';
    case 'auth/user-disabled': return 'Dieser Account wurde deaktiviert.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'E-Mail oder Passwort ist nicht korrekt.';
    case 'auth/email-already-in-use': return 'Diese E-Mail-Adresse wird bereits verwendet.';
    case 'auth/weak-password': return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    case 'auth/popup-closed-by-user': return 'Anmeldefenster wurde geschlossen.';
    case 'auth/popup-blocked': return 'Das Anmeldefenster wurde vom Browser blockiert. Bitte Popups erlauben.';
    case 'auth/cancelled-popup-request': return 'Anmeldeanfrage abgebrochen.';
    case 'auth/account-exists-with-different-credential': return 'Ein Account mit dieser E-Mail existiert bereits über einen anderen Login-Anbieter.';
    case 'auth/too-many-requests': return 'Zu viele Anmeldeversuche. Bitte warte kurz oder nutze einen anderen Login-Weg.';
    case 'auth/network-request-failed': return 'Netzwerkfehler. Bitte Internetverbindung prüfen.';
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/api-key-not-valid': return 'Firebase API-Schlüssel ist nicht gültig.';
    default: return null;
  }
}

function getLocalProfiles() {
  try { return JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}'); } catch (e) { return {}; }
}
function saveLocalProfiles(profiles) {
  try { localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles)); } catch (e) { console.warn('Could not save to localStorage', e); }
}
function getLocalUsernames() {
  try { return JSON.parse(localStorage.getItem(LOCAL_USERNAMES_KEY) || '{}'); } catch (e) { return {}; }
}
function saveLocalUsernames(usernames) {
  try { localStorage.setItem(LOCAL_USERNAMES_KEY, JSON.stringify(usernames)); } catch (e) { console.warn('Could not save to localStorage', e); }
}

export async function uploadImage(file, path, optimizerFn = optimizeImage) {
  if (!file) throw new Error('Keine Datei ausgewählt.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Das Bild darf maximal 8 MB groß sein.');

  let optimized = null;
  try { optimized = await optimizerFn(file); } catch (optErr) { console.warn('Client image optimization notice:', optErr); }
  const payloadBlob = optimized?.blob || file;
  const fallbackDataUrl = optimized?.dataUrl;

  if (storage && payloadBlob) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() || 'webp' : 'webp';
      const storageRef = ref(storage, `${path}/${Date.now()}.${fileExt}`);
      const uploadPromise = (async () => {
        const snapshot = await uploadBytes(storageRef, payloadBlob);
        return getDownloadURL(snapshot.ref);
      })();
      return await Promise.race([
        uploadPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 5000))
      ]);
    } catch (err) {
      console.warn('Storage upload failed; using optimized DataURL fallback:', err);
    }
  }

  if (fallbackDataUrl) return fallbackDataUrl;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Bild konnte nicht gelesen werden.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadAvatar(file, uid) { return uploadImage(file, `avatars/${uid}`, optimizeAvatarImage); }
export async function uploadBackgroundImage(file, uid) { return uploadImage(file, `backgrounds/${uid}`, optimizeBackgroundImage); }
export async function uploadLinkIcon(file, uid, linkId) { return uploadImage(file, `link-icons/${uid}/${linkId}`, optimizeLinkIcon); }

export function validateUsername(username) {
  const norm = (username || '').trim().toLowerCase();
  if (!norm) return { valid: false, message: 'Benutzername ist erforderlich.' };
  if (norm.length < 3) return { valid: false, message: 'Mindestens 3 Zeichen erforderlich.' };
  if (norm.length > 30) return { valid: false, message: 'Maximal 30 Zeichen erlaubt.' };
  if (!/^[a-z0-9_.-]+$/.test(norm)) return { valid: false, message: 'Nur Kleinbuchstaben (a-z), Zahlen (0-9), "_", "-" und "." erlaubt.' };
  return { valid: true, username: norm };
}

function withTimeout(promise, ms = 10000, fallbackMessage = 'Timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(fallbackMessage)), ms))
  ]);
}

export async function checkUsernameAvailability(username, currentUid) {
  const validation = validateUsername(username);
  if (!validation.valid) return { available: false, reason: validation.message };
  const norm = validation.username;

  if (db) {
    try {
      const snap = await withTimeout(getDoc(doc(db, 'usernames', norm)), 10000, 'Username check timeout');
      if (!snap.exists()) return { available: true, username: norm };
      const data = snap.data();
      if (data.uid === currentUid) return { available: true, isCurrentOwner: true, username: norm };
      return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
    } catch (error) {
      // Never report "available" when the authoritative Firestore check could not be completed.
      console.error('Firestore username availability check failed:', error);
      return { available: false, reason: 'Verfügbarkeit konnte gerade nicht geprüft werden. Bitte erneut versuchen.' };
    }
  }

  const localUsernames = getLocalUsernames();
  const ownerUid = localUsernames[norm];
  if (!ownerUid || ownerUid === currentUid) return { available: true, username: norm };
  return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
}

export async function getUserProfile(uid) {
  if (db && !uid.startsWith('guest_')) {
    try {
      const snap = await withTimeout(getDoc(doc(db, 'profiles', uid)), 10000, 'Firestore profile load timeout');
      if (snap.exists()) {
        const data = snap.data();
        const local = getLocalProfiles();
        local[uid] = data;
        saveLocalProfiles(local);
        return data;
      }
      return null;
    } catch (error) {
      console.warn('Firestore getUserProfile failed; using local cache:', error);
    }
  }
  return getLocalProfiles()[uid] || null;
}

export async function saveUserProfileTransaction(uid, profileData, oldUsername = '') {
  const validation = validateUsername(profileData.username);
  if (!validation.valid) throw new Error(validation.message);

  const newUsername = validation.username;
  const normalizedOld = (oldUsername || '').trim().toLowerCase();
  const completePayload = {
    userId: uid,
    username: newUsername,
    displayName: profileData.displayName || 'Unbenannt',
    bio: profileData.bio || '',
    avatarUrl: profileData.avatarUrl || '',
    links: profileData.links || [],
    styling: profileData.styling || {},
    updatedAt: Date.now()
  };

  // Guests are intentionally local-only.
  if (uid.startsWith('guest_')) {
    const localProfiles = getLocalProfiles();
    localProfiles[uid] = completePayload;
    saveLocalProfiles(localProfiles);
    const localUsernames = getLocalUsernames();
    if (normalizedOld && normalizedOld !== newUsername) delete localUsernames[normalizedOld];
    localUsernames[newUsername] = uid;
    saveLocalUsernames(localUsernames);
    return newUsername;
  }

  if (!db) throw new Error('Firebase/Firestore ist nicht verfügbar. Das Profil wurde nicht gespeichert.');

  const userProfileRef = doc(db, 'profiles', uid);
  const newUsernameRef = doc(db, 'usernames', newUsername);
  const oldUsernameRef = normalizedOld && normalizedOld !== newUsername ? doc(db, 'usernames', normalizedOld) : null;

  try {
    await withTimeout(runTransaction(db, async (transaction) => {
      if (newUsername !== normalizedOld) {
        const usernameSnap = await transaction.get(newUsernameRef);
        if (usernameSnap.exists()) {
          const existingData = usernameSnap.data();
          if (existingData.uid && existingData.uid !== uid) {
            throw new Error('Dieser Benutzername ist bereits von einem anderen Benutzer vergeben.');
          }
        }

        transaction.set(newUsernameRef, { uid, updatedAt: Date.now() });
        if (oldUsernameRef) transaction.delete(oldUsernameRef);
      } else {
        transaction.set(newUsernameRef, { uid, updatedAt: Date.now() }, { merge: true });
      }
      transaction.set(userProfileRef, completePayload);
    }), 10000, 'Firestore save transaction timeout');
  } catch (firestoreErr) {
    if (firestoreErr?.message?.includes('bereits von einem anderen Benutzer vergeben')) throw firestoreErr;
    console.error('Firestore save failed:', firestoreErr);
    throw new Error('Das Profil konnte nicht dauerhaft gespeichert werden. Bitte erneut versuchen.');
  }

  // Only cache authenticated data after Firestore has successfully committed it.
  const localProfiles = getLocalProfiles();
  localProfiles[uid] = completePayload;
  saveLocalProfiles(localProfiles);
  const localUsernames = getLocalUsernames();
  if (normalizedOld && normalizedOld !== newUsername) delete localUsernames[normalizedOld];
  localUsernames[newUsername] = uid;
  saveLocalUsernames(localUsernames);

  return newUsername;
}

export async function getPublicProfileByUsername(username) {
  const norm = (username || '').trim().toLowerCase();
  if (!norm) return null;

  if (db) {
    try {
      const usernameSnap = await withTimeout(getDoc(doc(db, 'usernames', norm)), 10000, 'Public username lookup timeout');
      if (!usernameSnap.exists()) return null;
      const { uid } = usernameSnap.data();
      if (!uid) return null;

      const profileSnap = await withTimeout(getDoc(doc(db, 'profiles', uid)), 10000, 'Public profile lookup timeout');
      return profileSnap.exists() ? profileSnap.data() : null;
    } catch (error) {
      console.error('Firestore public profile lookup failed:', error);
      // Do not hide a real remote failure with stale local data for public pages.
      return null;
    }
  }

  // Local-only fallback is only used when Firebase is genuinely unavailable.
  const localUsernames = getLocalUsernames();
  const uid = localUsernames[norm];
  if (uid) return getLocalProfiles()[uid] || null;
  return Object.values(getLocalProfiles()).find(p => p.username?.toLowerCase() === norm) || null;
}

export { auth, db, storage };
