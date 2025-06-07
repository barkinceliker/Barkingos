
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// Analytics can be added if needed, but removing for simplicity based on guide
// import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUJnJxMGJ0SljmEmejEWrwVXgruXxnp3k", // Replace with your actual API key
  authDomain: "blog-bac0b.firebaseapp.com", // Replace with your actual authDomain
  projectId: "blog-bac0b", // Replace with your actual projectId
  storageBucket: "blog-bac0b.appspot.com", // Replace with your actual storageBucket
  messagingSenderId: "166033617628", // Replace with your actual messagingSenderId
  appId: "1:166033617628:web:f8e0d32bc234eb3b3f7a19", // Replace with your actual appId
  measurementId: "G-Q0W58R1ZZR" // Optional: Replace with your actual measurementId
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
