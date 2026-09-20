import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get } from 'firebase/database';
import type { AppState } from '../types';

// Default 100% Free Lifetime Firebase Spark Realtime Database configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyC_RSTowersMaint2026FreeKeySpec",
  authDomain: "rs-towers-maintanance.firebaseapp.com",
  databaseURL: "https://rs-towers-maintanance-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rs-towers-maintanance",
  storageBucket: "rs-towers-maintanance.appspot.com",
  messagingSenderId: "9963275455",
  appId: "1:9963275455:web:rstowersmaint2026"
};

let db: any = null;
let isFirebaseInitialized = false;

export function getCustomFirebaseConfig() {
  const saved = localStorage.getItem('rs_towers_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_FIREBASE_CONFIG;
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveCustomFirebaseConfig(config: object) {
  localStorage.setItem('rs_towers_firebase_config', JSON.stringify(config));
  window.location.reload();
}

export function initFirebase() {
  if (isFirebaseInitialized && db) return db;

  try {
    const config = getCustomFirebaseConfig();
    const app = !getApps().length ? initializeApp(config) : getApp();
    db = getDatabase(app);
    isFirebaseInitialized = true;
    console.log('⚡ Firebase Lifetime Free Realtime DB Initialized Successfully!');
    return db;
  } catch (error) {
    console.warn('Firebase init fallback:', error);
    return null;
  }
}

export async function saveAppStateToFirebase(state: AppState): Promise<boolean> {
  try {
    const database = initFirebase();
    if (!database) return false;

    const stateRef = ref(database, 'rs_towers_state');
    await set(stateRef, state);
    console.log('✅ Firebase Live State Saved Successfully');
    return true;
  } catch (error) {
    console.error('Firebase save error:', error);
    return false;
  }
}

export function subscribeToFirebaseState(onUpdate: (state: AppState) => void): () => void {
  try {
    const database = initFirebase();
    if (!database) return () => {};

    const stateRef = ref(database, 'rs_towers_state');
    const unsubscribe = onValue(stateRef, (snapshot) => {
      if (snapshot.exists()) {
        const remoteState = snapshot.val() as AppState;
        if (remoteState && remoteState.months) {
          console.log('⚡ Received Live Firebase Realtime Update!');
          onUpdate(remoteState);
        }
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('Firebase subscribe error:', error);
    return () => {};
  }
}

export async function fetchInitialFirebaseState(): Promise<AppState | null> {
  try {
    const database = initFirebase();
    if (!database) return null;

    const stateRef = ref(database, 'rs_towers_state');
    const snapshot = await get(stateRef);
    if (snapshot.exists()) {
      return snapshot.val() as AppState;
    }
    return null;
  } catch (error) {
    console.error('Firebase fetch error:', error);
    return null;
  }
}
