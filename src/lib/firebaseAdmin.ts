
// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

// Ensure that environment variables are set in your .env.local file or deployment environment
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error: ", error);
    // Potentially throw the error or handle it as per your application's needs
    // For now, we'll log it. The app might still function for client-side auth
    // but server-side verification will fail.
  }
}

export { admin };

export async function verifyFirebaseIdToken(token: string) {
  if (!admin.apps.length || !admin.app()) {
    console.error("Firebase Admin SDK not initialized. Cannot verify token.");
    return null;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return null;
  }
}
