
// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Log the state of the imported 'admin' object immediately
if (!admin || typeof admin.initializeApp !== 'function') {
  console.error("CRITICAL_ADMIN_SDK_IMPORT_FAILURE: 'firebase-admin' module (imported as 'admin') could not be imported correctly, or 'initializeApp' is not a function on it. Import result:", admin);
  // If this occurs, 'admin' is problematic, but we still export it.
  // Consumers (middleware, auth actions) MUST check admin.apps.length.
} else {
  console.log("FirebaseAdmin: 'firebase-admin' module (imported as 'admin') appears to be imported successfully.");
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

console.log("FirebaseAdmin: Attempting to initialize Firebase Admin SDK...");
console.log(`FirebaseAdmin: ENV - FIREBASE_PROJECT_ID (raw from env): '${projectId}' (Type: ${typeof projectId})`);
console.log(`FirebaseAdmin: ENV - FIREBASE_CLIENT_EMAIL (raw from env): '${clientEmail}' (Type: ${typeof clientEmail})`);
console.log(`FirebaseAdmin: ENV - FIREBASE_PRIVATE_KEY is ${privateKeyRaw ? 'SET' : 'NOT SET'} (Type: ${typeof privateKeyRaw})`);

if (privateKeyRaw && typeof privateKeyRaw === 'string' && privateKeyRaw.length > 0) {
  console.log(`FirebaseAdmin: ENV - Raw FIREBASE_PRIVATE_KEY starts with: '${privateKeyRaw.substring(0, 30)}...'`);
  console.log(`FirebaseAdmin: ENV - Raw FIREBASE_PRIVATE_KEY ends with: '...${privateKeyRaw.substring(privateKeyRaw.length - 30)}'`);
} else if (privateKeyRaw) {
  console.warn(`FirebaseAdmin: ENV - FIREBASE_PRIVATE_KEY is set but might not be a string or is empty. Actual value (type ${typeof privateKeyRaw}): ${privateKeyRaw}`);
}


// Check if admin object is valid AND if no apps are initialized yet
if (admin && admin.apps && !admin.apps.length) {
  if (projectId && privateKeyRaw && clientEmail) {
    try {
      if (typeof privateKeyRaw !== 'string') {
        console.error('FirebaseAdmin Error: FIREBASE_PRIVATE_KEY from .env is not a string. Initialization aborted.');
        throw new Error('FIREBASE_PRIVATE_KEY from .env is not a string.');
      }
      // Replace escaped newlines for the Admin SDK
      const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
      
      console.log(`FirebaseAdmin: Processed privateKey for initialization starts with: '${privateKey.substring(0, 30)}...'`);
      console.log(`FirebaseAdmin: Processed privateKey for initialization ends with: '...${privateKey.substring(privateKey.length - 30)}'`);
      console.log(`FirebaseAdmin: Type of processed privateKey: ${typeof privateKey}`);

      if (typeof projectId !== 'string' || projectId.trim() === '') {
        console.error('FirebaseAdmin Error: FIREBASE_PROJECT_ID is not a valid string or is empty. Initialization aborted.');
        throw new Error('FIREBASE_PROJECT_ID is not a valid string or is empty.');
      }
      if (typeof clientEmail !== 'string' || clientEmail.trim() === '') {
        console.error('FirebaseAdmin Error: FIREBASE_CLIENT_EMAIL is not a valid string or is empty. Initialization aborted.');
        throw new Error('FIREBASE_CLIENT_EMAIL is not a valid string or is empty.');
      }
      if (typeof privateKey !== 'string' || privateKey.trim() === '' || !privateKey.includes("-----BEGIN PRIVATE KEY-----") || !privateKey.includes("-----END PRIVATE KEY-----")) {
        console.error("FirebaseAdmin Error: Processed FIREBASE_PRIVATE_KEY validation failed. Key content (check for BEGIN/END markers, ensure it's not empty after processing). Initialization aborted.");
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
      console.error("FirebaseAdmin: Detailed error stack for initialization failure:", error.stack);
      console.error("FirebaseAdmin: Critical - Check the format of FIREBASE_PRIVATE_KEY in your .env file. It must be enclosed in quotes, and all newline characters (\\n) within the key must be escaped as \\\\n. Also ensure projectId and clientEmail are correct and that the server was restarted after .env changes.");
      // Even if initialization fails, the 'admin' object (the import) is still exported.
      // Consumers MUST check admin.apps.length.
    }
  } else {
    let missingVars = [];
    if (!projectId) missingVars.push("FIREBASE_PROJECT_ID");
    if (!privateKeyRaw) missingVars.push("FIREBASE_PRIVATE_KEY");
    if (!clientEmail) missingVars.push("FIREBASE_CLIENT_EMAIL");
    console.warn(
      `FirebaseAdmin: Firebase Admin SDK NOT initialized because one or more required environment variables are missing: [${missingVars.join(', ')}]. Server-side token verification will not work. The 'admin' object is exported but will be uninitialized.`
    );
  }
} else if (admin && admin.apps && admin.apps.length > 0) {
  console.log("FirebaseAdmin: Firebase Admin SDK already has an initialized app.");
} else if (!admin || !admin.apps) {
    // This case is covered by the initial check for 'admin' import,
    // but as a fallback log.
    console.error("FirebaseAdmin: 'admin' object from 'firebase-admin' import is not as expected (null, undefined, or no 'apps' property) even after import attempt. Cannot proceed with initialization checks.");
}

// Always export the admin object, even if it's uninitialized or the import was problematic.
// Consumers must check its status (e.g., admin.apps.length > 0) before use.
export { admin };

// This function is used by middleware and auth actions to verify tokens.
// It relies on 'admin' being correctly initialized.
export async function verifyFirebaseIdToken(token: string) {
  // Check if admin is usable and initialized
  if (!admin || typeof admin.auth !== 'function' || !admin.apps || !admin.apps.length) {
    console.error("verifyFirebaseIdToken: Firebase Admin SDK ('admin') is not initialized or not available. Cannot verify token.");
    console.error(`verifyFirebaseIdToken: Admin object details: admin is ${admin ? 'defined' : 'undefined'}, admin.auth is type ${typeof admin?.auth}, admin.apps length is ${admin?.apps?.length}`);
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
