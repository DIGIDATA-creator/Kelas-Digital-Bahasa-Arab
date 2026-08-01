import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyArofa6652iumhArxlcItzqnZByy59rOX0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kelas-digital-bahasa-arab.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kelas-digital-bahasa-arab",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kelas-digital-bahasa-arab.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "796218290643",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:796218290643:web:bcf4c7a70f7f3f698b7f26",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DLXY72BF43"
};

// Initialize Firebase safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Authentication Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google Auth error:", error);
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key not valid')) {
      throw new Error("API Key Firebase tidak valid. Silakan gunakan Login Email/Password atau perbarui API Key di Firebase Console.");
    }
    throw error;
  }
};

export const registerUser = async (email: string, pass: string, name: string) => {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, pass);
    if (userCred.user) {
      await updateProfile(userCred.user, { displayName: name });
    }
    return userCred.user;
  } catch (error: any) {
    console.error("Firebase Register error:", error);
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key not valid')) {
      throw new Error("API Key Firebase belum diaktifkan/valid. Periksa konfigurasi Firebase Console.");
    }
    throw error;
  }
};

export const loginUser = async (email: string, pass: string) => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, pass);
    return userCred.user;
  } catch (error: any) {
    console.error("Firebase Login error:", error);
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key not valid')) {
      throw new Error("API Key Firebase belum diaktifkan/valid. Periksa konfigurasi Firebase Console.");
    }
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Firebase Signout error:", error);
    throw error;
  }
};

export { onAuthStateChanged };
export type { User };
