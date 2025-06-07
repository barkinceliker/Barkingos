
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';

let firebaseAdminApp: App | undefined = undefined;
let initializationError: string | null = null;

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;

console.log("FirebaseAdmin: Module loading. Attempting to initialize Firebase Admin SDK.");

if (!admin.apps.length) {
  console.log("FirebaseAdmin: No existing Firebase Admin apps. Initializing a new one.");
  try {
    if (!serviceAccountKeyString) {
      initializationError = "FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable is not set.";
      console.error("FirebaseAdmin: CRITICAL_ENV_VAR_MISSING -", initializationError);
      throw new Error(initializationError);
    }
    
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
      const parseErrorMsg = `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON: ${e.message}`;
      console.error("FirebaseAdmin: CRITICAL_JSON_PARSE_FAILURE -", parseErrorMsg);
      initializationError = parseErrorMsg;
      throw new Error(initializationError);
    }

    console.log("FirebaseAdmin: PRE-INITIALIZATION - Service Account Parsed. Project ID from SA:", serviceAccount.project_id);
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      const missingFieldsMsg = "Service account JSON is missing one or more required fields (project_id, client_email, private_key).";
      console.error("FirebaseAdmin: CRITICAL_SA_VALIDATION_FAILURE -", missingFieldsMsg);
      initializationError = missingFieldsMsg;
      throw new Error(initializationError);
    }

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // projectId is inferred from the credential
    });

    console.log("FirebaseAdmin: POST-INITIALIZATION - Firebase Admin SDK initialized successfully. App name:", firebaseAdminApp.name);

    // Check for the INTERNAL property as a sanity check for successful initialization
    if (firebaseAdminApp && typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) {
        console.log("FirebaseAdmin: POST-INIT_CHECK - firebaseAdminApp.INTERNAL is defined. SDK likely initialized correctly.");
    } else {
        const internalErrorMsg = "Firebase Admin App INTERNAL object is undefined after initialization. This often indicates a problem with credentials or the SDK's core setup. Authentication features will likely fail.";
        console.error("FirebaseAdmin: CRITICAL POST-INIT_CHECK -", internalErrorMsg);
        initializationError = initializationError || internalErrorMsg; // Preserve earlier error if one existed
    }

  } catch (error: any) {
    if (!initializationError) { // If not already set by a more specific check
        initializationError = `Firebase Admin SDK Initialization Error: ${error.message}`;
    }
    console.error("FirebaseAdmin: CRITICAL INITIALIZATION ERROR - ", initializationError);
    // To prevent overly verbose logs, avoid logging the full 'error' object here unless needed for deep debugging.
    // console.error("FirebaseAdmin: Full error object during initialization:", error); 
  }
} else {
  console.log("FirebaseAdmin: Firebase Admin app already initialized. Using existing app.");
  firebaseAdminApp = admin.app(); // Get the default app
  // Perform post-init check for existing app too, in case it was initialized elsewhere poorly
  if (firebaseAdminApp && !(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) && !initializationError) {
    initializationError = "Existing Firebase Admin App's INTERNAL object is undefined. SDK may not be fully functional.";
    console.warn("FirebaseAdmin: WARNING -", initializationError);
  }
}

export { admin, firebaseAdminApp }; // firebaseAdminApp can be undefined if initialization failed

export function getAdminInitializationError(): string | null {
  // This function is the single source of truth for initialization status.
  // It prioritizes any error caught during the explicit initialization attempt.
  if (initializationError) {
    return initializationError;
  }
  // If no explicit error, but app or its INTERNAL property is missing, report that.
  if (!firebaseAdminApp) {
    return "Firebase Admin App (firebaseAdminApp) is undefined. Initialization likely failed silently or was not attempted.";
  }
  if (!(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null)) {
    return "Firebase Admin App's INTERNAL object is undefined. SDK may not be fully functional (credentials or setup issue).";
  }
  return null; // No error
}
