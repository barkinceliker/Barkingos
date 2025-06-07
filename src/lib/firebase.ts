
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth"; // Added
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUJnJxMGJ0SljmEmejEWrwVXgruXxnp3k",
  authDomain: "blog-bac0b.firebaseapp.com",
  projectId: "blog-bac0b",
  storageBucket: "blog-bac0b.appspot.com",
  messagingSenderId: "166033617628",
  appId: "1:166033617628:web:f8e0d32bc234eb3b3f7a19",
  measurementId: "G-Q0W58R1ZZR"
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
let analytics: Analytics | null = null;
let auth: Auth; // Added

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
    try {
      analytics = getAnalytics(firebaseApp);
    } catch (e) {
      console.warn("Firebase Analytics could not be initialized:", e);
    }
    auth = getAuth(firebaseApp); // Initialize Auth
  } else {
    firebaseApp = getApps()[0];
    try {
      analytics = getAnalytics(firebaseApp);
    } catch (e) {
      // Analytics might not be supported or already initialized
    }
    auth = getAuth(firebaseApp); // Initialize Auth if app already exists
  }
} else {
  // For server-side, or environments where window is not defined
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  // Auth might not be usable in the same way server-side without admin SDK
  // but getAuth() can be called. For client-side focus, this is fine.
  // @ts-ignore: auth might not be initialized if window is undefined and no apps exist
  if (!auth && firebaseApp) {
      auth = getAuth(firebaseApp);
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

// Export app instance and auth instance
export { firebaseApp, auth };
