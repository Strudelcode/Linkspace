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
  setDoc,
  deleteDoc,
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
// Never merge a second hard-coded Firebase project over firebaseConfig.
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
    case 'auth/operation-not-allowed': return 'E-Mail/Passwort ist in der Firebase Console noch deaktiviert. Nutze alternativ Google, GitHub oder den Gast-Modus!';
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
    case 'auth/unauthorized-domain': return 'Diese Domain (z. B. linkspacee.netlify.app) muss in der Firebase Console unter "Authentication > Settings > Authorized Domains" freigeschaltet werden. Tipp: Nutze den Gast-Modus oder schalte die Netlify-Domain in Firebase frei.';
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
        new Promise((_, reject) => setTimeout(() => reject(new Error('Storage timeout')), 10000))
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

function withTimeout(promise, ms = 30000, fallbackMessage = 'Timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(fallbackMessage)), ms))
  ]);
}

export async function checkUsernameAvailability(username, currentUid) {
  const validation = validateUsername(username);
  if (!validation.valid) return { available: false, reason: validation.message };
  const norm = validation.username;

  // 1. Fast local check first
  const localUsernames = getLocalUsernames();
  const ownerUid = localUsernames[norm];
  if (ownerUid && ownerUid !== currentUid) {
    return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
  }

  // 2. Quick Firestore check with a short 2.5s timeout
  if (db) {
    try {
      const snap = await withTimeout(getDoc(doc(db, 'usernames', norm)), 2500, 'Username check timeout');
      if (!snap.exists()) return { available: true, username: norm };
      const data = snap.data();
      const dbOwnerId = data.uid || data.userId || data.ownerUid;
      if (dbOwnerId === currentUid) return { available: true, isCurrentOwner: true, username: norm };
      return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
    } catch (error) {
      console.warn('Firestore username availability check fell back to local state:', error?.message);
      // Fallback: don't block the user if Firestore is slow or offline
      return { available: true, username: norm, fromLocalFallback: true };
    }
  }

  if (!ownerUid || ownerUid === currentUid) return { available: true, username: norm };
  return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
}

export function getCachedUserProfile(uid) {
  if (!uid) return null;
  return getLocalProfiles()[uid] || null;
}

export async function getUserProfile(uid) {
  const localData = getLocalProfiles()[uid];
  
  if (db && !uid.startsWith('guest_')) {
    try {
      const snap = await withTimeout(getDoc(doc(db, 'profiles', uid)), 3500, 'Firestore profile load timeout');
      if (snap.exists()) {
        const data = snap.data();
        const local = getLocalProfiles();
        local[uid] = data;
        saveLocalProfiles(local);
        return data;
      }
      // If document doesn't exist yet on remote, return local if any
      return localData || null;
    } catch (error) {
      console.warn('Firestore getUserProfile timed out or failed; using local cache:', error?.message);
      return localData || null;
    }
  }
  return localData || null;
}

function formatFirestoreSaveError(error) {
  const code = error?.code || '';
  const message = error?.message || '';
  if (code === 'permission-denied') {
    return 'Firestore verweigert das Speichern. Bitte prüfe die Firestore-Sicherheitsregeln für das verwendete Firebase-Projekt.';
  }
  if (code === 'unauthenticated') {
    return 'Die Anmeldung ist für Firestore nicht mehr gültig. Bitte einmal abmelden und erneut anmelden.';
  }
  if (code === 'failed-precondition') {
    return 'Firestore konnte die Speicherung wegen einer Datenbank-Voraussetzung nicht abschließen. Bitte erneut versuchen.';
  }
  if (code === 'resource-exhausted') {
    return 'Das Profil ist zu groß für Firestore. Bitte kleinere Bilder verwenden.';
  }
  if (code === 'unavailable') {
    return 'Firestore ist gerade nicht erreichbar. Bitte erneut versuchen.';
  }
  if (message.includes('maximum allowed size')) {
    return 'Das Profil ist zu groß für Firestore. Bitte kleinere Bilder verwenden.';
  }
  return 'Das Profil konnte nicht dauerhaft gespeichert werden. Bitte erneut versuchen.';
}

function cacheSavedProfile(uid, completePayload, oldUsername, newUsername) {
  const localProfiles = getLocalProfiles();
  localProfiles[uid] = completePayload;
  saveLocalProfiles(localProfiles);

  const localUsernames = getLocalUsernames();
  if (oldUsername && oldUsername !== newUsername) delete localUsernames[oldUsername];
  localUsernames[newUsername] = uid;
  saveLocalUsernames(localUsernames);
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

  if (uid.startsWith('guest_')) {
    cacheSavedProfile(uid, completePayload, normalizedOld, newUsername);
    return newUsername;
  }

  if (!db) throw new Error('Firebase/Firestore ist nicht verfügbar. Das Profil wurde nicht gespeichert.');
  if (!auth?.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Deine Anmeldung ist nicht mehr gültig. Bitte einmal abmelden und erneut anmelden.');
  }

  const userProfileRef = doc(db, 'profiles', uid);
  const newUsernameRef = doc(db, 'usernames', newUsername);

  try {
    // Most saves keep the same username. Avoid a transaction in that case.
    // This makes ordinary profile saves much more reliable and still checks ownership.
    if (newUsername === normalizedOld) {
      const usernameSnap = await withTimeout(getDoc(newUsernameRef), 15000, 'Username ownership check timeout');
      if (usernameSnap.exists()) {
        const existingData = usernameSnap.data();
        const existingOwner = existingData.uid || existingData.userId || existingData.ownerUid;
        if (existingOwner && existingOwner !== uid) {
          throw new Error('Dieser Benutzername ist bereits von einem anderen Benutzer vergeben.');
        }
      }

      await withTimeout(setDoc(newUsernameRef, { uid, updatedAt: Date.now() }, { merge: true }), 15000, 'Username save timeout');
      await withTimeout(setDoc(userProfileRef, completePayload), 15000, 'Profile save timeout');
      cacheSavedProfile(uid, completePayload, '', newUsername);
      return newUsername;
    }

    // Username changes or first-time creation: claim the name and update the profile together.
    const oldUsernameRef = normalizedOld ? doc(db, 'usernames', normalizedOld) : null;
    await withTimeout(runTransaction(db, async (transaction) => {
      const newSnap = await transaction.get(newUsernameRef);
      if (newSnap.exists()) {
        const existingData = newSnap.data();
        const existingOwner = existingData.uid || existingData.userId || existingData.ownerUid;
        if (existingOwner && existingOwner !== uid) {
          throw new Error('Dieser Benutzername ist bereits von einem anderen Benutzer vergeben.');
        }
      }

      const oldSnap = oldUsernameRef ? await transaction.get(oldUsernameRef) : null;

      transaction.set(newUsernameRef, { uid, updatedAt: Date.now() });
      if (oldUsernameRef && oldSnap?.exists() && oldSnap.data()?.uid === uid) {
        transaction.delete(oldUsernameRef);
      }
      transaction.set(userProfileRef, completePayload);
    }), 30000, 'Firestore save transaction timeout');

    cacheSavedProfile(uid, completePayload, normalizedOld, newUsername);
    return newUsername;
  } catch (firestoreErr) {
    if (firestoreErr?.message?.includes('bereits von einem anderen Benutzer vergeben')) {
      throw firestoreErr;
    }
    console.error('[Linkspace] Firestore profile save failed:', firestoreErr);
    throw new Error(formatFirestoreSaveError(firestoreErr));
  }
}

export async function getPublicProfileByUsername(username) {
  const norm = (username || '').trim().toLowerCase();
  if (!norm) return null;

  if (db) {
    try {
      const usernameSnap = await withTimeout(getDoc(doc(db, 'usernames', norm)), 15000, 'Public username lookup timeout');
      if (!usernameSnap.exists()) return null;
      const { uid } = usernameSnap.data();
      if (!uid) return null;

      const profileSnap = await withTimeout(getDoc(doc(db, 'profiles', uid)), 15000, 'Public profile lookup timeout');
      return profileSnap.exists() ? profileSnap.data() : null;
    } catch (error) {
      console.error('Firestore public profile lookup failed:', error);
      return null;
    }
  }

  const localUsernames = getLocalUsernames();
  const localUid = localUsernames[norm];
  if (localUid) return getLocalProfiles()[localUid] || null;
  return Object.values(getLocalProfiles()).find(p => p.username?.toLowerCase() === norm) || null;
}

export { auth, db, storage };
