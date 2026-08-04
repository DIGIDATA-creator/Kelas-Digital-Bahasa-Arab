import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "AIzaSyAKXBdPB7SAIq318t1OuQ18GoihHrmRxm8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "peta-stack-st3g1-37135.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "peta-stack-st3g1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "peta-stack-st3g1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "86947705571",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:86947705571:web:2dee1e33c3144ebe104bd6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId || ""
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, appletConfig.firestoreDatabaseId || '(default)');

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


