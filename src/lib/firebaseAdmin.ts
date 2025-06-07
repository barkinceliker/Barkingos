
// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!admin.apps.length) {
  if (projectId && privateKeyRaw && clientEmail) {
    try {
      const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: clientEmail,
        }),
      });
      console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
      console.error(
        "Firebase Admin SDK initialization error: ",
        (error as Error).message
      );
    }
  } else {
    console.warn(
      "Firebase Admin SDK not initialized because one or more required environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) are missing. Server-side token verification will not work."
    );
  }
}

export { admin };

export async function verifyFirebaseIdToken(token: string) {
  if (!admin.apps.length || !admin.app()) {
    console.error(
      "Firebase Admin SDK not initialized. Cannot verify token."
    );
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
