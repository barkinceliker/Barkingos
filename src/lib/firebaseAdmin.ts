
// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Log environment variables for debugging
console.log("FirebaseAdmin: Attempting to initialize...");
console.log(`FirebaseAdmin: FIREBASE_PROJECT_ID (raw from env): '${projectId}' (type: ${typeof projectId})`);
console.log(`FirebaseAdmin: FIREBASE_CLIENT_EMAIL (raw from env): '${clientEmail}' (type: ${typeof clientEmail})`);
console.log(`FirebaseAdmin: FIREBASE_PRIVATE_KEY (raw from env) is ${privateKeyRaw ? 'SET' : 'NOT SET'} (type: ${typeof privateKeyRaw})`);

if (privateKeyRaw) {
  console.log(`FirebaseAdmin: FIREBASE_PRIVATE_KEY (raw from env) starts with: ${privateKeyRaw.substring(0, 30)}...`);
  console.log(`FirebaseAdmin: FIREBASE_PRIVATE_KEY (raw from env) ends with: ...${privateKeyRaw.substring(privateKeyRaw.length - 30)}`);
}


if (!admin.apps.length) {
  if (projectId && privateKeyRaw && clientEmail) {
    try {
      // This is the crucial step: replace escaped newlines with actual newlines
      const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
      
      console.log("FirebaseAdmin: Processed privateKey for initialization starts with: " + privateKey.substring(0, 30) + "...");
      console.log("FirebaseAdmin: Processed privateKey for initialization ends with: ..." + privateKey.substring(privateKey.length - 30));
      console.log("FirebaseAdmin: Type of processed privateKey: " + typeof privateKey);

      if (typeof projectId !== 'string' || projectId.trim() === '') {
        throw new Error('FIREBASE_PROJECT_ID is not a valid string or is empty.');
      }
      if (typeof clientEmail !== 'string' || clientEmail.trim() === '') {
        throw new Error('FIREBASE_CLIENT_EMAIL is not a valid string or is empty.');
      }
      if (typeof privateKey !== 'string' || privateKey.trim() === '' || !privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
        throw new Error('Processed FIREBASE_PRIVATE_KEY is not a valid string, is empty, or does not seem to be a valid PEM key.');
      }

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
      console.error("Firebase Admin SDK - Detailed error stack:", error);
      console.error("FirebaseAdmin: Check the format of FIREBASE_PRIVATE_KEY in your .env file. It must be enclosed in quotes and all newline characters (\\n) within the key must be escaped as \\\\n. Also ensure projectId and clientEmail are correct.");
    }
  } else {
    console.warn(
      "Firebase Admin SDK not initialized because one or more required environment variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL) are missing. Server-side token verification will not work."
    );
    console.warn("Please ensure these variables are correctly set in your .env file and that the server has been restarted after changes.");
    console.warn("FIREBASE_PRIVATE_KEY must be enclosed in quotes and all newline characters (\\n) within the key must be escaped as \\\\n.");
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
