
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { ServiceAccount } from 'firebase-admin';

let firebaseAdminApp: App | undefined = undefined;
let initializationError: string | null = null;

const serviceAccountKeyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
const projectIdEnv = process.env.FIREBASE_PROJECT_ID;
const clientEmailEnv = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;

console.log("FirebaseAdmin: Module loading. Attempting to initialize Firebase Admin SDK.");

if (!admin.apps.length) {
  console.log("FirebaseAdmin: No existing Firebase Admin app found. Initializing a new one.");
  let serviceAccount: ServiceAccount | undefined = undefined;

  if (serviceAccountKeyString) {
    console.log(`FirebaseAdmin: FIREBASE_SERVICE_ACCOUNT_KEY_JSON IS SET. Length: ${serviceAccountKeyString.length}. First 20 chars of content: "${serviceAccountKeyString.substring(0, 20)}..."`);
    try {
      serviceAccount = JSON.parse(serviceAccountKeyString);
    } catch (e: any) {
      const parseErrorMsg = `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON: ${e.message}`;
      console.error("FirebaseAdmin: CRITICAL_JSON_PARSE_ERROR -", parseErrorMsg);
      initializationError = parseErrorMsg;
    }
  } else if (projectIdEnv && clientEmailEnv && privateKeyEnv) {
    console.log("FirebaseAdmin: FIREBASE_SERVICE_ACCOUNT_KEY_JSON is undefined. Attempting to use individual Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).");
    serviceAccount = {
      projectId: projectIdEnv,
      clientEmail: clientEmailEnv,
      // Replace \n literals in private key from environment variable
      privateKey: privateKeyEnv.replace(/\\n/g, '\n'),
    };
    console.log("FirebaseAdmin: Service account object created from individual environment variables. Project ID:", serviceAccount.projectId);
  } else {
    let baseMessage = "Firebase Admin SDK could not be initialized: Critical Firebase environment variables are missing. ";
    if (process.env.NETLIFY === 'true') {
      baseMessage += "Please ensure FIREBASE_SERVICE_ACCOUNT_KEY_JSON (or individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) is correctly set in your Netlify site's 'Build & deploy' > 'Environment' settings. ";
    } else {
      baseMessage += "Ensure FIREBASE_SERVICE_ACCOUNT_KEY_JSON (or individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) is set in your environment. ";
    }
    baseMessage += "The SDK needs either the full JSON key or all three individual project_id, client_email, and private_key variables.";
    initializationError = baseMessage;
    console.error("FirebaseAdmin: CRITICAL_ENV_VARIABLES_MISSING -", initializationError);
  }

  if (serviceAccount && !initializationError) {
    try {
      console.log("FirebaseAdmin: PRE_INITIALIZATION - Using Service Account. Project ID from SA:", serviceAccount.projectId);
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        const missingFieldsMsg = "Service account credentials object is missing one or more required fields (project_id, client_email, private_key).";
        console.error("FirebaseAdmin: CRITICAL_SA_VALIDATION_ERROR -", missingFieldsMsg);
        initializationError = missingFieldsMsg;
        throw new Error(missingFieldsMsg); // Throw to prevent initialization attempt
      }

      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("FirebaseAdmin: POST_INITIALIZATION - Firebase Admin SDK initialized successfully. App name:", firebaseAdminApp.name);

      // A simple check to see if the app object seems valid
      if (firebaseAdminApp && typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) {
        console.log("FirebaseAdmin: POST_INITIALIZATION_CHECK - firebaseAdminApp.INTERNAL is defined. SDK likely initialized correctly.");
      } else {
        const internalErrorMsg = "Post-initialization Firebase Admin App INTERNAL object is undefined. This usually indicates an issue with credentials or the core setup of the SDK.";
        console.error("FirebaseAdmin: CRITICAL POST_INITIALIZATION_CHECK -", internalErrorMsg);
        initializationError = initializationError || internalErrorMsg; // Preserve earlier error if any
      }
    } catch (error: any) {
      if (!initializationError) { // Only set if not already set by a more specific check
        initializationError = `Firebase Admin SDK Initialization Error: ${error.message}`;
      }
      console.error("FirebaseAdmin: CRITICAL INITIALIZATION_FAILURE - ", initializationError, "Error details:", error);
    }
  } else if (!initializationError) { // serviceAccount is undefined but no specific error was set
     initializationError = "Could not form service account credentials for Firebase Admin SDK.";
     console.error("FirebaseAdmin: CRITICAL -", initializationError);
  }

} else {
  console.log("FirebaseAdmin: Firebase Admin app already initialized. Using existing app.");
  firebaseAdminApp = admin.app();
  if (firebaseAdminApp && !(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null) && !initializationError) {
    // This case is less likely if admin.apps.length > 0, but good to have a check
    initializationError = "Existing Firebase Admin App's INTERNAL object is undefined. SDK might not be fully functional.";
    console.warn("FirebaseAdmin: WARNING -", initializationError);
  }
}

export { admin, firebaseAdminApp };

export function getAdminInitializationError(): string | null {
  if (initializationError) {
    return initializationError;
  }
  // If no specific error was caught during init, check app validity
  if (!firebaseAdminApp) {
    return "Firebase Admin App (firebaseAdminApp) is undefined. Initialization likely failed silently or was not attempted.";
  }
  // This check for `INTERNAL` is a heuristic. A more robust check might involve trying a simple Firebase Admin operation.
  if (!(typeof firebaseAdminApp.INTERNAL === 'object' && firebaseAdminApp.INTERNAL !== null)) {
    return "Firebase Admin App's INTERNAL object is undefined. SDK might not be fully functional (credentials or setup issue).";
  }
  return null; // No error
}
