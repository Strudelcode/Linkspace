import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
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

// Default config fallback from provisioned Firebase project
const defaultConfig = {
  projectId: "gen-lang-client-0499920163",
  appId: "1:397941216736:web:60ab9d156c2bd00951c785",
  apiKey: "AIzaSyC0KXJmVDT_eQxrH592IhjR09NJCBUnuYg",
  authDomain: "gen-lang-client-0499920163.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-linktree-1a6148bd-0bbb-468c-9c99-3d7da1722460",
  storageBucket: "gen-lang-client-0499920163.firebasestorage.app",
  messagingSenderId: "397941216736"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
};

let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Support custom databaseId if configured, or default firestore instance
  db = defaultConfig.firestoreDatabaseId && defaultConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, defaultConfig.firestoreDatabaseId)
    : getFirestore(app);
  storage = getStorage(app);
} catch (err) {
  console.error("Firebase init error:", err);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Authentication methods
 */
export async function loginWithEmail(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function registerWithEmail(email, password, displayName = '') {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && res.user) {
      await updateProfile(res.user, { displayName });
    }
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function loginWithGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (error) {
    throw new Error(translateAuthError(error.code) || error.message);
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Friendly German error translations
 */
function translateAuthError(code) {
  switch (code) {
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
      return 'Google-Anmeldefenster wurde geschlossen.';
    case 'auth/network-request-failed':
      return 'Netzwerkfehler. Bitte Internetverbindung prüfen.';
    default:
      return null;
  }
}

/**
 * Avatar upload with Firebase Storage + base64 fallback
 */
export async function uploadAvatar(file, uid) {
  if (!file) throw new Error("Keine Datei ausgewählt.");
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Das Bild darf maximal 5 MB groß sein.");
  }

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `avatars/${uid}/${Date.now()}.${fileExt}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn("Storage upload failed, using local base64 fallback:", err);
    // Fallback to data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Bild konnte nicht konvertiert werden."));
      reader.readAsDataURL(file);
    });
  }
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
 * Check if a username is available in Firestore
 */
export async function checkUsernameAvailability(username, currentUid) {
  const validation = validateUsername(username);
  if (!validation.valid) return { available: false, reason: validation.message };

  const norm = validation.username;
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
    console.error("Error checking username:", error);
    return { available: false, reason: 'Fehler bei der Verfügbarkeitsprüfung.' };
  }
}

/**
 * Fetch profile data for a specific user ID
 */
export async function getUserProfile(uid) {
  try {
    const profileRef = doc(db, 'profiles', uid);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Error loading user profile:", error);
    throw error;
  }
}

/**
 * Save profile with atomic username reservation transaction
 */
export async function saveUserProfileTransaction(uid, profileData, oldUsername = '') {
  const validation = validateUsername(profileData.username);
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const newUsername = validation.username;
  const normalizedOld = (oldUsername || '').trim().toLowerCase();

  const userProfileRef = doc(db, 'profiles', uid);
  const newUsernameRef = doc(db, 'usernames', newUsername);
  const oldUsernameRef = normalizedOld && normalizedOld !== newUsername ? doc(db, 'usernames', normalizedOld) : null;

  await runTransaction(db, async (transaction) => {
    // 1. If username changed, check availability in transaction
    if (newUsername !== normalizedOld) {
      const usernameSnap = await transaction.get(newUsernameRef);
      if (usernameSnap.exists()) {
        const existingData = usernameSnap.data();
        if (existingData.uid !== uid) {
          throw new Error('Dieser Benutzername ist bereits von einem anderen Benutzer vergeben.');
        }
      }
      // Reserve new username
      transaction.set(newUsernameRef, {
        uid: uid,
        updatedAt: Date.now()
      });

      // Release old username if previously owned
      if (oldUsernameRef) {
        transaction.delete(oldUsernameRef);
      }
    } else {
      // Ensure username document exists
      transaction.set(newUsernameRef, {
        uid: uid,
        updatedAt: Date.now()
      }, { merge: true });
    }

    // 2. Save profile data
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

    transaction.set(userProfileRef, completePayload);
  });

  return newUsername;
}

/**
 * Fetch public profile by username
 */
export async function getPublicProfileByUsername(username) {
  const norm = (username || '').trim().toLowerCase();
  if (!norm) return null;

  try {
    const usernameDocRef = doc(db, 'usernames', norm);
    const usernameSnap = await getDoc(usernameDocRef);
    if (!usernameSnap.exists()) {
      return null;
    }

    const { uid } = usernameSnap.data();
    if (!uid) return null;

    const profileRef = doc(db, 'profiles', uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      return null;
    }

    return profileSnap.data();
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

export { auth, db, storage };
