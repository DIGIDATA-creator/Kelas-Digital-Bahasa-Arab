import { app, auth, db } from '../firebase/config';
import { getStorage } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';

export async function runFirebaseDiagnostics() {
  console.group('🔥 [FIREBASE DIAGNOSTICS REPORT]');
  console.log('⏰ Diagnostic timestamp:', new Date().toISOString());

  // 1. Config Check
  const options = app.options as Record<string, string>;
  const maskedConfig = {
    projectId: options.projectId,
    authDomain: options.authDomain,
    storageBucket: options.storageBucket,
    messagingSenderId: options.messagingSenderId,
    appId: options.appId,
    apiKey: options.apiKey ? `${options.apiKey.substring(0, 6)}...${options.apiKey.slice(-4)}` : 'MISSING',
  };
  console.log('📋 1. FIREBASE CONFIGURATION:', maskedConfig);

  // 2. Auth Check
  const currentUser = auth.currentUser;
  console.log('🔐 2. AUTHENTICATION STATUS:', {
    isInitialized: !!auth,
    currentUser: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      isAnonymous: currentUser.isAnonymous,
      emailVerified: currentUser.emailVerified,
      providerData: currentUser.providerData,
    } : 'No active Firebase Auth user',
  });

  // 3. Firestore Connection Check
  let firestoreStatus = 'UNKNOWN';
  try {
    const testDocRef = doc(db, 'app_collections', 'materi');
    let docSnap;
    try {
      docSnap = await getDoc(testDocRef);
    } catch (firstErr: any) {
      if (firstErr?.code === 'unavailable' || firstErr?.message?.includes('offline')) {
        console.warn('🔄 Initial Firestore connection establishing, retrying in 1.5s...');
        await new Promise(r => setTimeout(r, 1500));
        docSnap = await getDoc(testDocRef);
      } else {
        throw firstErr;
      }
    }
    firestoreStatus = '✅ CONNECTED (Doc exists: ' + docSnap.exists() + ')';
    console.log('📊 3. FIRESTORE DATABASE STATUS:', firestoreStatus);
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
      firestoreStatus = '⚠️ ONLINE PENDING (Client initializing or offline cache active)';
      console.warn('📊 3. FIRESTORE DATABASE STATUS:', firestoreStatus, '- Data will automatically sync when connection is live.');
    } else {
      firestoreStatus = `❌ ERROR (${err?.code || 'UNKNOWN'}): ${err?.message || err}`;
      console.error('📊 3. FIRESTORE DATABASE ERROR:', firestoreStatus);
      if (err?.message?.includes('Database') && err?.message?.includes('not found')) {
        console.warn('💡 ACTION REQUIRED: Firestore database not created or database ID mismatch. Ensure default Firestore database is provisioned in Firebase Console for project:', options.projectId);
      } else if (err?.code === 'permission-denied') {
        console.warn('💡 PERMISSION DENIED: Check firestore.rules security rules or Auth token status.');
      }
    }
  }

  // 4. Storage Check
  let storageStatus = 'UNKNOWN';
  try {
    const storage = getStorage(app);
    if (storage) {
      storageStatus = `✅ INITIALIZED (Bucket: ${storage.app.options.storageBucket || 'default'})`;
      console.log('🗄️ 4. FIREBASE STORAGE STATUS:', storageStatus);
    }
  } catch (err: any) {
    storageStatus = `❌ ERROR: ${err?.message || err}`;
    console.error('🗄️ 4. FIREBASE STORAGE ERROR:', storageStatus);
  }

  console.log('🏁 SUMMARY REPORT:', {
    ProjectId: options.projectId,
    AuthState: currentUser ? (currentUser.isAnonymous ? 'Anonymous' : 'Authenticated') : 'Logged Out',
    Firestore: firestoreStatus,
    Storage: storageStatus,
  });

  console.groupEnd();
  return {
    config: maskedConfig,
    auth: currentUser,
    firestore: firestoreStatus,
    storage: storageStatus,
  };
}

// Auto-run diagnostics on module import in browser environment
if (typeof window !== 'undefined') {
  setTimeout(() => {
    runFirebaseDiagnostics().catch(console.error);
  }, 1000);
}
