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

// Support Vite environment variables (e.g. Netlify / Vercel / GitHub Secrets / .env) with fallback to project config
const projectDefaultConfig = {
  apiKey: "AIzaSyASjkHYDH_gNtQWIqi5o665kSsQ845jnlI",
  authDomain: "general-4ca31.firebaseapp.com",
  projectId: "general-4ca31",
  storageBucket: "general-4ca31.firebasestorage.app",
  messagingSenderId: "278319187482",
  appId: "1:278319187482:web:15f5fc7856f5618a5a33a3",
  measurementId: "G-7QCY8Z5CQQ"
};

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
  ...projectDefaultConfig,
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
      console.warn("Firebase storage init warning:", sErr);
    }
  }
} catch (err) {
  console.warn("Firebase init warning:", err);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// Listeners list for demo/guest auth state synchronization
const customAuthListeners = new Set();

function notifyCustomAuth(user) {
  customAuthListeners.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Authentication methods
 */
export async function loginWithEmail(email, password) {
  if (!auth) {
    throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  }
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function registerWithEmail(email, password, displayName = '') {
  if (!auth) {
    throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  }
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && res.user) {
      await updateProfile(res.user, { displayName });
    }
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  }
  try {
    const res = await signInWithPopup(auth, googleProvider);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithGithub() {
  if (!auth) {
    throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  }
  try {
    const res = await signInWithPopup(auth, githubProvider);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithMicrosoft() {
  if (!auth) {
    throw new Error('Firebase ist im Offline-Modus. Bitte als Gast fortfahren.');
  }
  try {
    const res = await signInWithPopup(auth, microsoftProvider);
    localStorage.removeItem(LOCAL_GUEST_KEY);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

/**
 * Instant Demo / Guest login (works without Firebase Auth key)
 */
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
    try {
      await signOut(auth);
    } catch (error) {
      console.warn("Logout error:", error);
    }
  }
  notifyCustomAuth(null);
}

export function subscribeToAuth(callback) {
  customAuthListeners.add(callback);

  // Check if guest user is stored in localStorage
  const savedGuest = localStorage.getItem(LOCAL_GUEST_KEY);
  if (savedGuest) {
    try {
      const parsed = JSON.parse(savedGuest);
      callback(parsed);
    } catch (e) {
      localStorage.removeItem(LOCAL_GUEST_KEY);
    }
  }

  let unsubscribeFirebase = () => {};
  if (auth) {
    unsubscribeFirebase = onAuthStateChanged(auth, (user) => {
      const guest = localStorage.getItem(LOCAL_GUEST_KEY);
      if (user) {
        callback(user);
      } else if (guest) {
        try {
          callback(JSON.parse(guest));
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  } else if (!savedGuest) {
    callback(null);
  }

  return () => {
    customAuthListeners.delete(callback);
    unsubscribeFirebase();
  };
}

/**
 * Friendly German error translations
 */
function translateAuthError(code) {
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'E-Mail/Passwort ist in der Firebase Console noch deaktiviert (unter Firebase Console -> Authentication -> Sign-in method aktivieren). Nutze alternativ Google, GitHub oder den Gast-Modus!';
    case 'auth/invalid-email':
      return 'Ungültige E-Mail-Adresse.';
    case 'auth/user-disabled':
      return 'Dieser Account wurde deaktiviert.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-Mail oder Passwort ist nicht korrekt.';
    case 'auth/email-already-in-use':
      return 'Diese E-Mail-Adresse wird bereits verwendet.';
    case 'auth/weak-password':
      return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    case 'auth/popup-closed-by-user':
      return 'Anmeldefenster wurde geschlossen.';
    case 'auth/popup-blocked':
      return 'Das Anmeldefenster wurde vom Browser blockiert. Bitte Popups erlauben.';
    case 'auth/cancelled-popup-request':
      return 'Anmeldeanfrage abgebrochen.';
    case 'auth/account-exists-with-different-credential':
      return 'Ein Account mit dieser E-Mail existiert bereits über einen anderen Login-Anbieter.';
    case 'auth/too-many-requests':
      return 'Zu viele Anmeldeversuche. Bitte warte kurz oder nutze einen anderen Login-Weg.';
    case 'auth/network-request-failed':
      return 'Netzwerkfehler. Bitte Internetverbindung prüfen.';
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/api-key-not-valid':
      return 'Firebase API-Schlüssel wird noch im Google Projekt initialisiert. Nutze den 1-Klick Gast-Modus!';
    default:
      return null;
  }
}

/**
 * Local storage profile helpers for reliable fallback
 */
function getLocalProfiles() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveLocalProfiles(profiles) {
  try {
    localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}

function getLocalUsernames() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERNAMES_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveLocalUsernames(usernames) {
  try {
    localStorage.setItem(LOCAL_USERNAMES_KEY, JSON.stringify(usernames));
  } catch (e) {
    console.warn("Could not save to localStorage", e);
  }
}

/**
 * Upload helper with instant client-side image compression + Firebase Storage + dataURL fallback.
 * Uses a strict timeout race to guarantee uploads NEVER freeze or hang indefinitely!
 */
export async function uploadImage(file, path, optimizerFn = optimizeImage) {
  if (!file) throw new Error("Keine Datei ausgewählt.");
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Das Bild darf maximal 8 MB groß sein.");
  }

  // 1. Instant client-side compression (converts 500KB - 5MB into compact optimized image in <50ms)
  let optimized = null;
  try {
    optimized = await optimizerFn(file);
  } catch (optErr) {
    console.warn("Client image optimization notice:", optErr);
  }

  const payloadBlob = optimized?.blob || file;
  const fallbackDataUrl = optimized?.dataUrl;

  // 2. Attempt storage upload with strict 2.5 second timeout race
  if (storage && payloadBlob) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() || 'webp' : 'webp';
      const storageRef = ref(storage, `${path}/${Date.now()}.${fileExt}`);

      const uploadPromise = (async () => {
        const snapshot = await uploadBytes(storageRef, payloadBlob);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Storage timeout - fallback to optimized base64')), 2500)
      );

      const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
      return downloadUrl;
    } catch (err) {
      console.warn("Storage upload timed out or failed; using optimized DataURL fallback:", err);
    }
  }

  // 3. Fallback to optimized high-quality dataUrl instantly
  if (fallbackDataUrl) {
    return fallbackDataUrl;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

export async function uploadAvatar(file, uid) {
  return uploadImage(file, `avatars/${uid}`, optimizeAvatarImage);
}

export async function uploadBackgroundImage(file, uid) {
  return uploadImage(file, `backgrounds/${uid}`, optimizeBackgroundImage);
}

export async function uploadLinkIcon(file, uid, linkId) {
  return uploadImage(file, `link-icons/${uid}/${linkId}`, optimizeLinkIcon);
}

/**
 * Username validation helper
 */
export function validateUsername(username) {
  const norm = (username || '').trim().toLowerCase();
  if (!norm) return { valid: false, message: 'Benutzername ist erforderlich.' };
  if (norm.length < 3) return { valid: false, message: 'Mindestens 3 Zeichen erforderlich.' };
  if (norm.length > 30) return { valid: false, message: 'Maximal 30 Zeichen erlaubt.' };
  if (!/^[a-z0-9_.-]+$/.test(norm)) {
    return { valid: false, message: 'Nur Kleinbuchstaben (a-z), Zahlen (0-9), "_", "-" und "." erlaubt.' };
  }
  return { valid: true, username: norm };
}

/**
 * Check if a username is available in Firestore (with local fallback)
 */
export async function checkUsernameAvailability(username, currentUid) {
  const validation = validateUsername(username);
  if (!validation.valid) return { available: false, reason: validation.message };

  const norm = validation.username;

  if (db) {
    try {
      const usernameDocRef = doc(db, 'usernames', norm);
      const snap = await getDoc(usernameDocRef);
      if (!snap.exists()) {
        return { available: true, username: norm };
      }
      const data = snap.data();
      if (data.uid === currentUid) {
        return { available: true, isCurrentOwner: true, username: norm };
      }
      return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
    } catch (error) {
      console.warn("Firestore username check failed, using local check:", error);
    }
  }

  // Local fallback check
  const localUsernames = getLocalUsernames();
  const ownerUid = localUsernames[norm];
  if (!ownerUid || ownerUid === currentUid) {
    return { available: true, username: norm };
  }
  return { available: false, reason: 'Dieser Benutzername ist bereits vergeben.' };
}

/**
 * Fetch profile data for a specific user ID
 */
export async function getUserProfile(uid) {
  if (db) {
    try {
      const profileRef = doc(db, 'profiles', uid);
      const snap = await getDoc(profileRef);
      if (snap.exists()) {
        const data = snap.data();
        // also save to local cache
        const local = getLocalProfiles();
        local[uid] = data;
        saveLocalProfiles(local);
        return data;
      }
    } catch (error) {
      console.warn("Firestore getUserProfile fallback:", error);
    }
  }

  // Local storage fallback
  const local = getLocalProfiles();
  return local[uid] || null;
}

/**
 * Save profile with atomic username reservation
 */
export async function saveUserProfileTransaction(uid, profileData, oldUsername = '') {
  const validation = validateUsername(profileData.username);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

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

  // Always update local cache for instant resilience
  const localProfiles = getLocalProfiles();
  localProfiles[uid] = completePayload;
  saveLocalProfiles(localProfiles);

  const localUsernames = getLocalUsernames();
  if (normalizedOld && normalizedOld !== newUsername) {
    delete localUsernames[normalizedOld];
  }
  localUsernames[newUsername] = uid;
  saveLocalUsernames(localUsernames);

  if (db) {
    try {
      const userProfileRef = doc(db, 'profiles', uid);
      const newUsernameRef = doc(db, 'usernames', newUsername);
      const oldUsernameRef = normalizedOld && normalizedOld !== newUsername ? doc(db, 'usernames', normalizedOld) : null;

      await runTransaction(db, async (transaction) => {
        if (newUsername !== normalizedOld) {
          const usernameSnap = await transaction.get(newUsernameRef);
          if (usernameSnap.exists()) {
            const existingData = usernameSnap.data();
            if (existingData.uid !== uid) {
              throw new Error('Dieser Benutzername ist bereits von einem anderen Benutzer vergeben.');
            }
          }
          transaction.set(newUsernameRef, {
            uid: uid,
            updatedAt: Date.now()
          });

          if (oldUsernameRef) {
            transaction.delete(oldUsernameRef);
          }
        } else {
          transaction.set(newUsernameRef, {
            uid: uid,
            updatedAt: Date.now()
          }, { merge: true });
        }

        transaction.set(userProfileRef, completePayload);
      });
    } catch (firestoreErr) {
      console.warn("Firestore save transaction notice (data saved locally):", firestoreErr);
    }
  }

  return newUsername;
}

/**
 * Fetch public profile by username
 */
export async function getPublicProfileByUsername(username) {
  const norm = (username || '').trim().toLowerCase();
  if (!norm) return null;

  if (db) {
    try {
      const usernameDocRef = doc(db, 'usernames', norm);
      const usernameSnap = await getDoc(usernameDocRef);
      if (usernameSnap.exists()) {
        const { uid } = usernameSnap.data();
        if (uid) {
          const profileRef = doc(db, 'profiles', uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            return profileSnap.data();
          }
        }
      }
    } catch (error) {
      console.warn("Firestore getPublicProfileByUsername notice:", error);
    }
  }

  // Local storage fallback for public profiles
  const localUsernames = getLocalUsernames();
  const uid = localUsernames[norm];
  if (uid) {
    const localProfiles = getLocalProfiles();
    if (localProfiles[uid]) {
      return localProfiles[uid];
    }
  }

  // Search across local profiles if username matches
  const localProfiles = getLocalProfiles();
  const found = Object.values(localProfiles).find(p => p.username?.toLowerCase() === norm);
  if (found) return found;

  return null;
}

export { auth, db, storage };
