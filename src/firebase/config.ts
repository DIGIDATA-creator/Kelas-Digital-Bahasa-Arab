import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyArofa6652iumhArxlcItzqnZByy59rOX0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "kelas-digital-bahasa-arab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "kelas-digital-bahasa-arab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "kelas-digital-bahasa-arab.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "796218290643",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:796218290643:web:bcf4c7a70f7f3f698b7f26",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId || "G-DLXY72BF43"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

let firestoreDb: Firestore | null = null;
try {
  firestoreDb = getFirestore(app);
} catch (err: any) {
  try {
    firestoreDb = initializeFirestore(app, {});
  } catch (err2: any) {
    console.warn("⚠️ [FIREBASE CONFIG] Firestore service fallback note:", err2?.message || err2);
    firestoreDb = null;
  }
}

export const db = firestoreDb;

// Set explicit Auth local persistence so login sessions persist across browser restarts & tabs
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('🔒 [FIREBASE CONFIG] Auth persistence set to LOCAL.');
  })
  .catch((err) => {
    console.warn('⚠️ [FIREBASE CONFIG] Error setting persistence:', err);
  });

// Ensure user is authenticated anonymously if not logged in, so firestore rules with auth work seamlessly
if (!auth.currentUser) {
  signInAnonymously(auth)
    .then((cred) => {
      console.log('🔑 [FIREBASE CONFIG] Anonymous Auth initialized successfully (UID:', cred.user.uid, ')');
    })
    .catch((err) => {
      console.warn('⚠️ [FIREBASE CONFIG] Anonymous Auth note:', err?.message || err);
    });
}


