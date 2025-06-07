
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUJnJxMGJ0SljmEmejEWrwVXgruXxnp3k",
  authDomain: "blog-bac0b.firebaseapp.com",
  projectId: "blog-bac0b",
  storageBucket: "blog-bac0b.appspot.com", // Corrected from .firebasestorage.app to .appspot.com
  messagingSenderId: "166033617628",
  appId: "1:166033617628:web:f8e0d32bc234eb3b3f7a19",
  measurementId: "G-Q0W58R1ZZR"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined' && !getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
  analytics = getAnalytics(firebaseApp);
} else if (getApps().length > 0) {
  firebaseApp = getApps()[0];
  // Check if analytics is already initialized for this app instance
  try {
    analytics = getAnalytics(firebaseApp);
  } catch (e) {
    // Analytics might not be supported or already initialized, fine to ignore
  }
}

// Export a function to get the app instance, useful for server components or later initialization
export const getFirebaseApp = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

// Export analytics instance directly if needed
export { analytics };

// Export app instance directly (primarily for client-side use where it's guaranteed to be initialized)
// It's generally safer to use getFirebaseApp() if there's any doubt.
// For this setup, we'll export what's available after client-side check.
// @ts-ignore
export { firebaseApp };
