
// STUB VERSION - Does not initialize real Firebase Admin SDK
console.log("FirebaseAdmin: STUB MODULE LOADED. This version does NOT initialize the real Firebase Admin SDK.");

const mockAuth = {
  verifyIdToken: async (token: string) => {
    console.log("FirebaseAdmin STUB: verifyIdToken called with token:", token ? token.substring(0,10) + "..." : "undefined/empty");
    // Simulate a successful verification for testing middleware flow
    if (token && token.startsWith("valid-")) {
      console.log("FirebaseAdmin STUB: Mock token is 'valid-', simulating success.");
      return { uid: 'stub-uid-verified' };
    }
    console.log("FirebaseAdmin STUB: Mock token is not 'valid-', simulating failure by throwing.");
    throw new Error("Stub: Invalid token provided to mock verifyIdToken");
  }
};

export const admin = {
  apps: [{name: "stubApp"}], 
  app: () => {
    console.log("FirebaseAdmin STUB: admin.app() called");
    return {
      name: "stubAppInstance",
      auth: () => mockAuth,
    };
  },
  auth: () => {
    console.log("FirebaseAdmin STUB: admin.auth() called");
    return mockAuth;
  },
};

export function getFirebaseAdminApp() {
  console.log("FirebaseAdmin STUB: getFirebaseAdminApp() called");
  return {
    name: "stubAppFromGetter",
    auth: () => mockAuth,
  };
}

export function getAdminInitializationError(): string | null {
    console.log("FirebaseAdmin STUB: getAdminInitializationError() called, returning null.");
    return null; 
}

console.log("FirebaseAdmin: STUB admin object created:", typeof admin);
console.log("FirebaseAdmin: STUB getFirebaseAdminApp function defined:", typeof getFirebaseAdminApp);
console.log("FirebaseAdmin: STUB getAdminInitializationError function defined:", typeof getAdminInitializationError);
