import { app, auth } from "../firebase/config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Authentication Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("ℹ️ [FIREBASE AUTH] Google Popup Auth note:", error?.code || error?.message || error);
    if (error?.code === 'auth/unauthorized-domain') {
      const domain = typeof window !== 'undefined' ? window.location.hostname : 'domain Anda';
      const customErr = new Error(
        `Domain "${domain}" belum terdaftar di Authorized Domains Firebase Console. Silakan gunakan Login Email / Username di bawah atau masuk lewat Verifikasi Akun Google.`
      );
      (customErr as any).code = 'auth/unauthorized-domain';
      throw customErr;
    }
    if (
      error?.code === 'auth/api-key-not-valid' ||
      error?.code === 'auth/invalid-api-key' ||
      error?.message?.includes('API key not valid') ||
      error?.message?.includes('api-key-not-valid')
    ) {
      const customErr = new Error("Firebase Auth API Key belum aktif di Google Cloud/Firebase Console.");
      (customErr as any).code = 'auth/api-key-not-valid';
      throw customErr;
    }
    if (error?.code === 'auth/popup-closed-by-user') {
      const customErr = new Error("Proses login dibatalkan karena jendela pop-up Google ditutup.");
      (customErr as any).code = 'auth/popup-closed-by-user';
      throw customErr;
    }
    if (error?.code === 'auth/popup-blocked') {
      const customErr = new Error("Pop-up Google diblokir oleh browser. Harap izinkan pop-up untuk situs ini.");
      (customErr as any).code = 'auth/popup-blocked';
      throw customErr;
    }
    throw error;
  }
};

export const registerUser = async (email: string, pass: string, name: string) => {
  try {
    const authPromise = createUserWithEmailAndPassword(auth, email, pass);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Auth timeout')), 3000)
    );

    const userCred = (await Promise.race([authPromise, timeoutPromise])) as any;
    if (userCred?.user) {
      await updateProfile(userCred.user, { displayName: name }).catch(console.warn);
    }
    return userCred?.user || null;
  } catch (error: any) {
    console.warn("Firebase Register error/warning:", error?.code || error?.message || error);
    if (
      error?.code === 'auth/operation-not-allowed' ||
      error?.code === 'auth/admin-restricted-operation' ||
      error?.code === 'auth/configuration-not-found' ||
      error?.code === 'auth/email-already-in-use' ||
      error?.message === 'Firebase Auth timeout'
    ) {
      console.warn("Firebase Email Auth provider skipped/handled. Proceeding with local & Firestore registration.");
      return null;
    }
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key not valid')) {
      console.warn("Firebase API Key issue. Proceeding with local registration.");
      return null;
    }
    throw error;
  }
};

export const loginUser = async (email: string, pass: string) => {
  try {
    const authPromise = signInWithEmailAndPassword(auth, email, pass);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Auth login timeout')), 3000)
    );

    const userCred = (await Promise.race([authPromise, timeoutPromise])) as any;
    return userCred?.user || null;
  } catch (error: any) {
    console.warn("Firebase Login error/warning:", error?.code || error?.message || error);
    if (
      error?.code === 'auth/operation-not-allowed' ||
      error?.code === 'auth/admin-restricted-operation' ||
      error?.code === 'auth/configuration-not-found' ||
      error?.code === 'auth/user-not-found' ||
      error?.code === 'auth/wrong-password' ||
      error?.code === 'auth/invalid-credential' ||
      error?.message === 'Firebase Auth login timeout'
    ) {
      return null;
    }
    if (error?.code === 'auth/api-key-not-valid' || error?.message?.includes('API key not valid')) {
      return null;
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
