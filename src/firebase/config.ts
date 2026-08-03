import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyArofa6652iumhArxlcItzqnZByy59rOX0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kelas-digital-bahasa-arab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kelas-digital-bahasa-arab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kelas-digital-bahasa-arab.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "796218290643",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:796218290643:web:bcf4c7a70f7f3f698b7f26",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DLXY72BF43"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, appletConfig.firestoreDatabaseId || '(default)');

// Ensure user is authenticated anonymously so firestore rules with auth work seamlessly
signInAnonymously(auth).catch((err) => {
  console.warn('Anonymous auth failed:', err);
});

