import type { AppState } from '../types';
import { INITIAL_APP_STATE } from '../data/initialData';
import { saveAppStateToFirebase, fetchInitialFirebaseState } from './firebaseStorage';

const LOCAL_STORAGE_KEY = 'rs_towers_maintenance_app_state_v1';
const REMOTE_ENDPOINT = 'https://kvdb.io/4y7PZrNnE62L825e36fR6v/rs_towers_maintenance_state';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.months && parsed.activeMonthId) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading local state:', err);
  }
  return INITIAL_APP_STATE;
}

export function saveAppStateLocal(state: AppState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('rs_towers_maintenance_sync');
      bc.postMessage({ type: 'STATE_UPDATE', state });
      bc.close();
    }
  } catch (err) {
    console.error('Error saving local state:', err);
  }
}

export async function fetchLatestCloudState(): Promise<AppState | null> {
  const hasLocalStorage = typeof localStorage !== 'undefined' && !!localStorage.getItem(LOCAL_STORAGE_KEY);

  // First try Firebase 100% Free Lifetime Realtime Database
  try {
    const fbState = await fetchInitialFirebaseState();
    if (fbState && fbState.months && fbState.activeMonthId) {
      const localState = loadAppState();
      if (!hasLocalStorage || !localState || (fbState.lastUpdated && fbState.lastUpdated >= (localState.lastUpdated || 0))) {
        saveAppStateLocal(fbState);
        return fbState;
      }
    }
  } catch (err) {
    // Fallback to KVDB if offline
  }

  // Secondary Fallback endpoint
  try {
    const response = await fetch(REMOTE_ENDPOINT, { cache: 'no-store' });
    if (response.ok) {
      const cloudState = await response.json();
      if (cloudState && cloudState.months && cloudState.activeMonthId) {
        const localState = loadAppState();
        if (!hasLocalStorage || !localState || (cloudState.lastUpdated && cloudState.lastUpdated >= (localState.lastUpdated || 0))) {
          saveAppStateLocal(cloudState);
          return cloudState;
        }
      }
    }
  } catch (err) {
    // Silent fallback
  }
  return null;
}

export async function syncToCloudRemote(state: AppState): Promise<void> {
  saveAppStateLocal(state);

  // Sync to Firebase 100% Free Lifetime Realtime Database
  saveAppStateToFirebase(state).catch(() => {});

  // Backup sync to KVDB endpoint
  try {
    await fetch(REMOTE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch (err) {
    // Silent error handling
  }
}


export function exportAppStateJSON(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `RS_Towers_Maintenance_Backup_${state.activeMonthId}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importAppStateJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.months && parsed.activeMonthId) {
          saveAppStateLocal(parsed);
          syncToCloudRemote(parsed);
          resolve(parsed);
        } else {
          reject(new Error('Invalid backup file format.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

const LOGIN_SESSION_KEY = 'rs_towers_maint_login_session_v1';

export interface LoginSession {
  isLoggedIn: boolean;
  flatNo: string;
}

export function getStoredLoginSession(): LoginSession {
  try {
    const raw = localStorage.getItem(LOGIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isLoggedIn === 'boolean' && parsed.flatNo) {
        return parsed;
      }
    }
    // Backward compatibility check for legacy keys
    const isLegacyAdmin = localStorage.getItem('rs_towers_maint_is_admin') === 'true';
    const legacyFlat = localStorage.getItem('rs_towers_maint_admin_flat') || '302';
    if (isLegacyAdmin) {
      return { isLoggedIn: true, flatNo: legacyFlat };
    }
  } catch (err) {
    console.error('Error loading login session:', err);
  }
  return { isLoggedIn: false, flatNo: '302' };
}

export function saveLoginSession(flatNo: string): void {
  try {
    const session: LoginSession = { isLoggedIn: true, flatNo };
    localStorage.setItem(LOGIN_SESSION_KEY, JSON.stringify(session));
    localStorage.setItem('rs_towers_maint_is_admin', 'true');
    localStorage.setItem('rs_towers_maint_admin_flat', flatNo);

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('rs_towers_maintenance_sync');
      bc.postMessage({ type: 'LOGIN_SESSION_UPDATE', session });
      bc.close();
    }
  } catch (err) {
    console.error('Error saving login session:', err);
  }
}

export function clearLoginSession(): void {
  try {
    const session: LoginSession = { isLoggedIn: false, flatNo: '302' };
    localStorage.removeItem(LOGIN_SESSION_KEY);
    localStorage.setItem('rs_towers_maint_is_admin', 'false');
    localStorage.removeItem('rs_towers_maint_admin_flat');

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('rs_towers_maintenance_sync');
      bc.postMessage({ type: 'LOGIN_SESSION_UPDATE', session });
      bc.close();
    }
  } catch (err) {
    console.error('Error clearing login session:', err);
  }
}
