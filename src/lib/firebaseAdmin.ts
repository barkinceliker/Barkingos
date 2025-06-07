
import * as firebaseAdminSDKOriginal from 'firebase-admin';

// Create a non-configurable, non-writable copy to prevent modification of the SDK's top-level export
// This helps ensure that if the SDK is loaded, we're dealing with its intended structure.
const firebaseAdminSDK = Object.freeze({...firebaseAdminSDKOriginal});

console.log("FirebaseAdmin: Top of firebaseAdmin.ts - SDK module imported.");

// Very early check to see if the 'firebase-admin' module loaded correctly
if (!firebaseAdminSDK || typeof firebaseAdminSDK.initializeApp !== 'function') {
    console.error("FirebaseAdmin CRITICAL_SDK_LOAD_FAILURE: The 'firebase-admin' SDK module itself could not be loaded correctly or is not structured as expected. This is a severe issue. Check your 'node_modules' and 'package.json'.");
    console.error("FirebaseAdmin SDK_LOAD_FAILURE: typeof firebaseAdminSDK is", typeof firebaseAdminSDK);
    if (firebaseAdminSDK) {
        console.error("FirebaseAdmin SDK_LOAD_FAILURE: firebaseAdminSDK.initializeApp is", firebaseAdminSDK.initializeApp);
        console.error("FirebaseAdmin SDK_LOAD_FAILURE: keys in firebaseAdminSDK are", Object.keys(firebaseAdminSDK));
    }
    // This error means the problem is likely with the firebase-admin package installation itself or a corrupted node_modules.
    throw new Error("CRITICAL_SDK_LOAD_FAILURE: 'firebase-admin' module did not load as expected. Please reinstall dependencies and check the firebase-admin package.");
} else {
    console.log("FirebaseAdmin: SDK_LOAD_CHECK_PASSED: 'firebase-admin' module appears to be loaded correctly.");
}

let firebaseAdminApp: firebaseAdminSDK.app.App;

if (!firebaseAdminSDK.apps.length) {
  console.log("FirebaseAdmin: No Firebase app initialized yet. Attempting to initialize...");
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY; // Raw from env

  console.log(`FirebaseAdmin ENV_CHECK: FIREBASE_PROJECT_ID (from env): ${projectId ? 'SET' : 'NOT SET'}`);
  console.log(`FirebaseAdmin ENV_CHECK: FIREBASE_CLIENT_EMAIL (from env): ${clientEmail ? 'SET' : 'NOT SET'}`);
  console.log(`FirebaseAdmin ENV_CHECK: FIREBASE_PRIVATE_KEY (raw from env) starts with: ${privateKeyEnv ? privateKeyEnv.substring(0, 30) + "..." : 'NOT SET'}`);

  if (!projectId || projectId.trim() === "") {
    console.error("FirebaseAdmin CRITICAL ERROR: FIREBASE_PROJECT_ID environment variable is missing or empty.");
    throw new Error("Firebase Admin SDK environment variable FIREBASE_PROJECT_ID is not set or empty.");
  }
  if (!clientEmail || clientEmail.trim() === "") {
    console.error("FirebaseAdmin CRITICAL ERROR: FIREBASE_CLIENT_EMAIL environment variable is missing or empty.");
    throw new Error("Firebase Admin SDK environment variable FIREBASE_CLIENT_EMAIL is not set or empty.");
  }
  if (!privateKeyEnv || privateKeyEnv.trim() === "") {
    console.error("FirebaseAdmin CRITICAL ERROR: FIREBASE_PRIVATE_KEY environment variable is missing or empty.");
    throw new Error("Firebase Admin SDK environment variable FIREBASE_PRIVATE_KEY is not set or empty.");
  }

  const privateKey = privateKeyEnv.replace(/\\n/g, '\n');
  console.log(`FirebaseAdmin ENV_CHECK: Processed privateKey for initialization starts with: ${privateKey ? privateKey.substring(0, 30) + "..." : 'NOT SET'}`);
  
  if (privateKey.trim() === "") {
      console.error("FirebaseAdmin CRITICAL ERROR: FIREBASE_PRIVATE_KEY became an empty string after processing newlines. This likely means it was malformed in the .env file (e.g., only contained '\\n' characters or was empty after quotes).");
      throw new Error("FIREBASE_PRIVATE_KEY is effectively empty after processing. Please check its value in .env.");
  }
  
  if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
      console.error("FirebaseAdmin CRITICAL ERROR: Processed FIREBASE_PRIVATE_KEY does not seem to be in the correct PKCS#8 format. It should start with '-----BEGIN PRIVATE KEY-----' and include '-----END PRIVATE KEY-----'.");
      console.error("FirebaseAdmin HINT: Ensure the .env value for FIREBASE_PRIVATE_KEY is wrapped in quotes and all literal 'n' characters preceded by a backslash (like in the original key) are escaped as '\\\\n'.");
      throw new Error("Processed FIREBASE_PRIVATE_KEY format error. Check .env and ensure newlines are escaped as '\\\\n'.");
  }
  
  try {
    console.log("FirebaseAdmin: PRE-INITIALIZATION - Attempting firebaseAdminSDK.initializeApp()...");
    firebaseAdminApp = firebaseAdminSDK.initializeApp({
      credential: firebaseAdminSDK.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("FirebaseAdmin: POST-INITIALIZATION - firebaseAdminSDK.initializeApp() completed.");
    console.log("FirebaseAdmin: Firebase Admin SDK initialized successfully. App name:", firebaseAdminApp.name);

    // Check for the INTERNAL object immediately after initialization
    if (typeof (firebaseAdminApp as any).INTERNAL === 'undefined') {
        console.error("FirebaseAdmin CRITICAL POST-INIT_CHECK: firebaseAdminApp.INTERNAL IS UNDEFINED IMMEDIATELY AFTER INITIALIZATION! This indicates a severe initialization problem.");
    } else {
        console.log("FirebaseAdmin POST-INIT_CHECK: firebaseAdminApp.INTERNAL is defined after initialization.");
    }

  } catch (error: any) {
    console.error("FirebaseAdmin CRITICAL INITIALIZATION ERROR: Failed to initialize Firebase Admin SDK during initializeApp call.");
    console.error("FirebaseAdmin: Error Message:", error.message);
    console.error("FirebaseAdmin: Error Stack:", error.stack);
    console.error("FirebaseAdmin: Ensure your .env variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are correct and the private key is properly formatted (especially newline characters as '\\\\n' in the .env file).");
    throw error; 
  }
} else {
  console.log("FirebaseAdmin: Firebase app already initialized. Using existing app.");
  firebaseAdminApp = firebaseAdminSDK.app();
   // Also check INTERNAL on existing app instance for sanity
    if (typeof (firebaseAdminApp as any).INTERNAL === 'undefined') {
        console.warn("FirebaseAdmin EXISTING_APP_CHECK: firebaseAdminApp.INTERNAL IS UNDEFINED on existing app instance!");
    } else {
        console.log("FirebaseAdmin EXISTING_APP_CHECK: firebaseAdminApp.INTERNAL is defined on existing app instance.");
    }
}

export { firebaseAdminApp as admin };

export function getFirebaseAdminApp() {
  if (!firebaseAdminApp) {
    console.error("FirebaseAdmin: getFirebaseAdminApp called but app (firebaseAdminApp) is not initialized. This should not happen if module was imported correctly and initialization succeeded/failed clearly.");
    throw new Error("Firebase Admin App (firebaseAdminApp) not initialized. Check server logs for initialization errors.");
  }
  // Add a check here too
  if (typeof (firebaseAdminApp as any).INTERNAL === 'undefined') {
     console.error("FirebaseAdmin GETTER_CHECK: firebaseAdminApp.INTERNAL IS UNDEFINED when getFirebaseAdminApp is called!");
  }
  return firebaseAdminApp;
}
