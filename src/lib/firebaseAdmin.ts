// src/lib/firebaseAdmin.ts
console.log("FirebaseAdmin: STUB MODULE LOADED. THIS IS FOR DIAGNOSIS. Firebase Admin SDK is NOT initialized.");

// This is a stub and does not represent a functional Firebase Admin SDK.
export const admin = {
  apps: [], // Simulate no initialized apps
  auth: () => ({
    verifyIdToken: async (token: string): Promise<any> => {
      console.warn("FirebaseAdmin STUB: verifyIdToken called. Returning null (unauthenticated).");
      return null;
    },
  }),
  credential: { // Add a stub for credential if it's accessed during type checking or early init
    cert: (serviceAccount: any) => {
      console.warn("FirebaseAdmin STUB: credential.cert called.");
      return {}; // Return a dummy credential object
    }
  },
  initializeApp: (options: any) => {
    console.warn("FirebaseAdmin STUB: initializeApp called. Doing nothing.");
    // @ts-ignore
    admin.apps = [{ name: '[DEFAULT]' }]; // Simulate an app being "initialized" for checks
    return { name: '[DEFAULT]' }; // Return a dummy app object
  }
  // Add other minimal stubs here if other parts of 'admin' are accessed by middleware/actions
  // before admin.apps.length is checked.
};

export async function verifyFirebaseIdToken(token: string) {
  console.warn("FirebaseAdmin STUB: verifyFirebaseIdToken called. Returning null (unauthenticated).");
  return null;
}

// Helper to indicate that this is a stub and real initialization might have failed
export const getAdminInitializationError = () => new Error("Firebase Admin SDK is a STUB and not truly initialized.");

console.log("FirebaseAdmin: STUB MODULE finished loading.");
