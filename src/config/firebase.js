/**
 * Firebase Configuration for Q-Gambit
 * Uses environment variables for production, falls back to localStorage mock for dev
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, linkWithCredential } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = Object.values(firebaseConfig).every(val => val !== undefined && val !== '');

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let analytics = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  // analytics = getAnalytics(app); // Optional: Enable if you need analytics
  console.log('[Firebase] Initialized with real configuration');
} else {
  console.warn('[Firebase] No configuration found - running in offline/mock mode');
}

// App ID for Firestore paths
export const appId = import.meta.env.VITE_APP_ID || 'q-gambit-dev';

export { app, auth, db, signInAnonymously, onAuthStateChanged, isFirebaseConfigured, googleProvider, signInWithPopup, linkWithCredential, GoogleAuthProvider, analytics };
