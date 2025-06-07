
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Import the potentially stubbed admin object and error getter
import { admin, getAdminInitializationError } from './lib/firebaseAdmin';

export const runtime = 'nodejs'; // Specify Node.js runtime

console.log("Middleware: Module execution started.");

// Initial check for admin object availability from the imported module
if (!admin || typeof admin.auth !== 'function') {
  const initError = getAdminInitializationError ? getAdminInitializationError() : new Error("Imported 'admin' object from firebaseAdmin.ts is malformed or not available.");
  console.error("Middleware: CRITICAL - The 'admin' object from firebaseAdmin.ts could not be used.");
  if (initError) {
    console.error("Middleware: Underlying Admin SDK status from firebaseAdmin.ts:", initError.message);
  }
  // If admin is not usable, we cannot proceed with auth checks.
  // Depending on policy, we might block all admin routes or log and allow (less secure).
  // For now, we will log and let requests pass, as the stub would do.
} else {
  console.log("Middleware: 'admin' object imported successfully from firebaseAdmin.ts. Checking initialization status (admin.apps.length if not stub).");
}


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware: Executing for path: ${pathname}.`);

  let firebaseAdminFullyInitialized = false;
  // This check is mostly for the real SDK; the stub will have admin.apps.length > 0 after its "initializeApp" is called
  if (admin && typeof admin.auth === 'function' && admin.apps && admin.apps.length > 0 ) {
      if (getAdminInitializationError && getAdminInitializationError().message.includes("STUB")) {
        console.warn("Middleware: Running with STUB Firebase Admin SDK. Real authentication will not occur.");
        firebaseAdminFullyInitialized = false; // Technically, it's "initialized" as a stub
      } else {
        console.log("Middleware: Firebase Admin SDK appears to be initialized (admin.apps.length > 0).");
        firebaseAdminFullyInitialized = true;
      }
  } else {
    const initErrorMsg = getAdminInitializationError ? getAdminInitializationError().message : "Admin object malformed or not initialized";
    console.warn(`Middleware: Firebase Admin SDK not available or not initialized. Admin object: ${admin ? 'exists' : 'null'}, apps length: ${admin?.apps?.length}. Error: ${initErrorMsg}`);
  }


  const COOKIE_NAME = 'adminAuthToken';
  const cookie = request.cookies.get(COOKIE_NAME);
  const token = cookie?.value;
  let isAuthenticated = false;

  if (token && admin && typeof admin.auth === 'function') { 
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken && decodedToken.uid) {
        isAuthenticated = true;
        console.log(`Middleware: Token is valid for UID: ${decodedToken.uid}. User is authenticated.`);
      } else {
        console.log("Middleware: Token found but was invalid upon verification (no UID or verification failed). Stub 'verifyIdToken' likely returned null.");
      }
    } catch (error) {
      console.warn("Middleware: Error verifying token. Invalidating session.", (error as Error).message);
    }
  } else if (token && (!admin || typeof admin.auth !== 'function')) {
    console.warn(`Middleware: Token '${COOKIE_NAME}' found, but Firebase Admin SDK is not available/initialized properly. Cannot verify token. Treating as unauthenticated.`);
  } else if (!token) {
    console.log(`Middleware: Auth cookie '${COOKIE_NAME}' does NOT exist.`);
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isAdminLoginPage) {
    if (!isAuthenticated) {
      console.log("Middleware: User is not authenticated for admin route. Redirecting to homepage.");
      const homeUrl = new URL('/', request.url);
      if (pathname !== '/') {
        return NextResponse.redirect(homeUrl);
      }
    }
    console.log("Middleware: User is authenticated or protection is bypassed by STUB. Allowing access to admin route:", pathname);
  }
  
  if (isAuthenticated && isAdminLoginPage) {
      console.log("Middleware: Authenticated user trying to access deprecated login page. Redirecting to /admin.");
      return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};

