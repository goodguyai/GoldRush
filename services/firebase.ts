import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/analytics";

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyC1zGyBxsdlJNKes_LJB5rxMwFl5ZXsKX0",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "gold-hunt---fantasy-olympics.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "gold-hunt---fantasy-olympics",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "gold-hunt---fantasy-olympics.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "833678716605",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:833678716605:web:5cfce470240e1a69e411d4",
  measurementId: (import.meta as any).env?.VITE_FIREBASE_MEASUREMENT_ID || "G-7ENM3SNH9V",
};

// Initialize Firebase (Compat)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const app = firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();

// Optional Analytics
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = firebase.analytics();
  } catch (e) {
    console.warn("Analytics failed to load:", e);
  }
}
export { analytics };