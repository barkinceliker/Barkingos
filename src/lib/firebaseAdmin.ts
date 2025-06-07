
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

let firebaseAdminApp: App;
let initializationError: string | null = null;

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

console.log("FirebaseAdmin: Module loading. Attempting to initialize Firebase Admin SDK.");

if (!admin.apps.length) {
  console.log("FirebaseAdmin: No existing Firebase Admin apps. Initializing a new one.");
  try {
    if (!serviceAccountKeyString) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.");
    }
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
      console.error("FirebaseAdmin: CRITICAL_JSON_PARSE_FAILURE - Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON:", e.message);
      throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON: ${e.message}`);
    }

    console.log("FirebaseAdmin: PRE-INITIALIZATION - Service Account Parsed. Project ID from SA:", serviceAccount.project_id);

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id, // Ensure project ID is consistent
    });

    console.log("FirebaseAdmin: POST-INITIALIZATION - Firebase Admin SDK initialized successfully. App name:", firebaseAdminApp.name);

    if (firebaseAdminApp && typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) {
        console.log("FirebaseAdmin: POST-INIT_CHECK - firebaseAdminApp.INTERNAL is defined.");
    } else {
        console.error("FirebaseAdmin: CRITICAL POST-INIT_CHECK - firebaseAdminApp.INTERNAL IS UNDEFINED after initialization. This usually indicates a problem with credentials or SDK setup.");
        initializationError = "Firebase Admin App INTERNAL object is undefined after initialization. Check credentials and SDK setup.";
    }

  } catch (error: any) {
    initializationError = `Firebase Admin SDK Initialization Error: ${error.message}`;
    console.error("FirebaseAdmin: CRITICAL INITIALIZATION ERROR - ", initializationError);
    console.error("FirebaseAdmin: Full error object during initialization:", error);
  }
} else {
  console.log("FirebaseAdmin: Firebase Admin app already initialized.");
  firebaseAdminApp = admin.app();
}

export { admin, firebaseAdminApp };

export function getAdminInitializationError(): string | null {
  return initializationError;
}
