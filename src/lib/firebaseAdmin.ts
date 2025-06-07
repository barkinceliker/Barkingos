
// STUB VERSION - Does not initialize real Firebase Admin SDK
console.log("FirebaseAdmin: STUB MODULE LOADED. This version does NOT initialize the real Firebase Admin SDK and bypasses token verification.");

const mockAuth = {
  verifyIdToken: async (token: string) => {
    console.log("FirebaseAdmin STUB: verifyIdToken called with token:", token ? token.substring(0,20) + "..." : "undefined/empty");
    if (token) {
      // If a token is provided, simulate successful verification (bypass)
      console.log("FirebaseAdmin STUB: Token present, simulating successful verification (bypassed).");
      return { uid: 'stub-uid-verified-bypassed' };
    }
    // If no token, simulate failure
    console.log("FirebaseAdmin STUB: No token provided, simulating failure by throwing.");
    throw new Error("Stub: No token provided to mock verifyIdToken");
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
    console.log("FirebaseAdmin STUB: getAdminInitializationError() called, returning null (stub is active).");
    return null; 
}

console.log("FirebaseAdmin: STUB admin object created:", typeof admin);
console.log("FirebaseAdmin: STUB getFirebaseAdminApp function defined:", typeof getFirebaseAdminApp);
console.log("FirebaseAdmin: STUB getAdminInitializationError function defined:", typeof getAdminInitializationError);
