import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { FirebaseConfigSettings } from '../types';

const STORAGE_KEY = 'rawdah_custom_firebase_config';

/**
 * Standard Firebase project configuration for rawdah-5b0b0
 */
export const DEFAULT_FIREBASE_TEMPLATE: FirebaseConfigSettings = {
  apiKey: "AIzaSyBsU4Z_Jnp5zQ058K1Jir6WZRILgclekR4",
  authDomain: "rawdah-5b0b0.firebaseapp.com",
  projectId: "rawdah-5b0b0",
  storageBucket: "rawdah-5b0b0.firebasestorage.app",
  messagingSenderId: "777017327604",
  appId: "1:777017327604:web:6b0967e64a1003f50603a1",
  measurementId: "",
};

export function getStoredFirebaseConfig(): FirebaseConfigSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to parse custom Firebase config from localStorage", err);
  }

  // Use the project default configuration
  if (DEFAULT_FIREBASE_TEMPLATE.apiKey && DEFAULT_FIREBASE_TEMPLATE.projectId) {
    return DEFAULT_FIREBASE_TEMPLATE;
  }

  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

export function initializeFirebaseServices(): {
  isConfigured: boolean;
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  config: FirebaseConfigSettings | null;
} {
  const config = getStoredFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return {
      isConfigured: false,
      app: null,
      db: null,
      auth: null,
      config: null,
    };
  }

  try {
    if (getApps().length === 0) {
      cachedApp = initializeApp(config);
    } else {
      cachedApp = getApp();
    }

    cachedDb = getFirestore(cachedApp);
    cachedAuth = getAuth(cachedApp);

    return {
      isConfigured: true,
      app: cachedApp,
      db: cachedDb,
      auth: cachedAuth,
      config,
    };
  } catch (error) {
    console.error("Error initializing Firebase SDK with supplied credentials:", error);
    return {
      isConfigured: false,
      app: null,
      db: null,
      auth: null,
      config,
    };
  }
}
