
// lib/firebaseAdmin.ts
import * as tiềmNăngAdmin from 'firebase-admin'; // Use a different name to check if 'admin' itself is problematic

if (!tiềmNăngAdmin || typeof tiềmNăngAdmin.initializeApp !== 'function') {
  console.error("CRITICAL_ADMIN_SDK_LOAD_FAILURE: 'firebase-admin' module could not be imported correctly, or 'initializeApp' is not a function. Import result:", tiềmNăngAdmin);
  // If this log appears, it's a fundamental issue with firebase-admin package or its import.
} else {
  console.log("FirebaseAdmin: 'firebase-admin' module (aliased as tiềmNăngAdmin) imported successfully. Actual admin object will use this.");
}

// Use the standard 'admin' name for the rest of the module
const admin = tiềmNăngAdmin;

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

console.log("FirebaseAdmin: Attempting to initialize Firebase Admin SDK...");
console.log(`FirebaseAdmin: ENV - FIREBASE_PROJECT_ID: '${projectId}' (Type: ${typeof projectId})`);
console.log(`FirebaseAdmin: ENV - FIREBASE_CLIENT_EMAIL: '${clientEmail}' (Type: ${typeof clientEmail})`);
console.log(`FirebaseAdmin: ENV - FIREBASE_PRIVATE_KEY is ${privateKeyRaw ? 'SET' : 'NOT SET'} (Type: ${typeof privateKeyRaw})`);

if (privateKeyRaw && typeof privateKeyRaw === 'string' && privateKeyRaw.length > 0) {
  console.log(`FirebaseAdmin: Raw FIREBASE_PRIVATE_KEY starts with: '${privateKeyRaw.substring(0, 30)}...'`);
  console.log(`FirebaseAdmin: Raw FIREBASE_PRIVATE_KEY ends with: '...${privateKeyRaw.substring(privateKeyRaw.length - 30)}'`);
} else if (privateKeyRaw) {
  console.warn(`FirebaseAdmin: FIREBASE_PRIVATE_KEY is set but might not be a string or is empty. Actual value (type ${typeof privateKeyRaw}): ${privateKeyRaw}`);
}


if (admin && admin.apps && !admin.apps.length) { // Check if admin object is valid before checking apps
  if (projectId && privateKeyRaw && clientEmail) {
    try {
      if (typeof privateKeyRaw !== 'string') {
        throw new Error('FIREBASE_PRIVATE_KEY from .env is not a string.');
      }
      const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
      
      console.log(`FirebaseAdmin: Processed privateKey for initialization starts with: '${privateKey.substring(0, 30)}...'`);
      console.log(`FirebaseAdmin: Processed privateKey for initialization ends with: '...${privateKey.substring(privateKey.length - 30)}'`);
      console.log(`FirebaseAdmin: Type of processed privateKey: ${typeof privateKey}`);

      if (typeof projectId !== 'string' || projectId.trim() === '') {
        throw new Error('FIREBASE_PROJECT_ID is not a valid string or is empty.');
      }
      if (typeof clientEmail !== 'string' || clientEmail.trim() === '') {
        throw new Error('FIREBASE_CLIENT_EMAIL is not a valid string or is empty.');
      }
      if (typeof privateKey !== 'string' || privateKey.trim() === '' || !privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
        console.error("FirebaseAdmin: Processed FIREBASE_PRIVATE_KEY validation failed. Key content (check for BEGIN/END markers).");
        throw new Error('Processed FIREBASE_PRIVATE_KEY is not a valid string, is empty, or does not seem to be a valid PEM key.');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: clientEmail,
        }),
      });
      console.log("FirebaseAdmin: Firebase Admin SDK initialized successfully with default app.");
    } catch (error: any) {
      console.error("FirebaseAdmin: Firebase Admin SDK initialization error:", error.message);
      console.error("FirebaseAdmin: Detailed error stack:", error.stack);
      console.error("FirebaseAdmin: Critical - Check the format of FIREBASE_PRIVATE_KEY in your .env file. It must be enclosed in quotes, and all newline characters (\\n) within the key must be escaped as \\\\n. Also ensure projectId and clientEmail are correct and that the server was restarted after .env changes.");
    }
  } else {
    let missingVars = [];
    if (!projectId) missingVars.push("FIREBASE_PROJECT_ID");
    if (!privateKeyRaw) missingVars.push("FIREBASE_PRIVATE_KEY");
    if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
    console.warn(
      `FirebaseAdmin: Firebase Admin SDK NOT initialized because one or more required environment variables are missing: [${missingVars.join(', ')}]. Server-side token verification will not work.`
    );
  }
} else if (admin && admin.apps && admin.apps.length > 0) {
  console.log("FirebaseAdmin: Firebase Admin SDK already has an initialized app.");
} else if (!admin || !admin.apps) {
    console.error("FirebaseAdmin: 'admin' object from 'firebase-admin' import is not as expected (null, undefined, or no 'apps' property). Cannot proceed with initialization checks.");
}

export { admin };

export async function verifyFirebaseIdToken(token: string) {
  if (!admin || !admin.apps || !admin.apps.length) { // Robust check
    console.error("verifyFirebaseIdToken: Firebase Admin SDK not initialized or 'admin' object is problematic. Cannot verify token.");
    return null;
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("verifyFirebaseIdToken: Error verifying Firebase ID token:", error);
    return null;
  }
}
