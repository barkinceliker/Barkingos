
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Import the potentially stubbed admin object and error getter
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs'; // Specify Node.js runtime

const COOKIE_NAME = 'adminAuthToken';

console.log("Middleware: Module execution started.");

if (!admin || typeof admin.auth !== 'function') {
  const initError = getAdminInitializationError ? getAdminInitializationError() : new Error("Admin object malformed");
  console.error("Middleware: CRITICAL - Firebase Admin SDK ('admin' from firebaseAdmin.ts) is not correctly formed or is a STUB.");
  if (initError) {
    console.error("Middleware: Underlying Admin SDK status from firebaseAdmin.ts:", initError.message);
  }
  // If it's a stub, admin.apps might be manipulated by the stub for basic checks,
  // but actual auth operations will fail or return stubbed values.
} else {
  console.log("Middleware: 'admin' object imported. Checking initialization status (admin.apps.length).");
}


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware: Executing for path: ${pathname}.`);

  let firebaseAdminFullyInitialized = false;
  if (admin && typeof admin.auth === 'function' && admin.apps && admin.apps.length > 0 && admin.apps[0]?.name === '[DEFAULT]') {
      // Check if it's not the stub's "simulated" app from initializeApp,
      // or rely on a more robust check if the real init succeeded (which is harder with a stub).
      // For now, if admin.apps.length > 0, we assume it's "initialized" for the stub or real.
      // The STUB message from verifyIdToken will tell us if it's the stub.
      if (getAdminInitializationError && getAdminInitializationError().message.includes("STUB")) {
        console.warn("Middleware: Running with STUB Firebase Admin SDK. Real authentication will not occur.");
        firebaseAdminFullyInitialized = false;
      } else {
        console.log("Middleware: Firebase Admin SDK appears to be initialized (admin.apps.length > 0).");
        firebaseAdminFullyInitialized = true;
      }
  } else {
    const initErrorMsg = getAdminInitializationError ? getAdminInitializationError().message : "Admin object malformed or not initialized";
    console.warn(`Middleware: Firebase Admin SDK not available or not initialized. Admin object: ${admin ? 'exists' : 'null'}, apps length: ${admin?.apps?.length}. Error: ${initErrorMsg}`);
  }


  const cookie = request.cookies.get(COOKIE_NAME);
  const token = cookie?.value;
  let isAuthenticated = false;

  if (token && admin && typeof admin.auth === 'function') { // Ensure admin.auth is a function
    try {
      // verifyIdToken will be the stubbed version if firebaseAdmin.ts is the stub
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken && decodedToken.uid) {
        isAuthenticated = true;
        console.log(`Middleware: Token is valid for UID: ${decodedToken.uid}. User is authenticated.`);
      } else {
        console.log("Middleware: Token found but was invalid upon verification (no UID or verification failed).");
      }
    } catch (error) {
      console.warn("Middleware: Error verifying token. Invalidating session.", (error as Error).message);
      // Potentially delete cookie if verification fails
      // const response = NextResponse.redirect(new URL('/', request.url));
      // response.cookies.delete(COOKIE_NAME);
      // return response; // Be careful with returning responses directly from here if admin is stubbed.
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
      // Avoid redirect loop if already on homepage due to some other issue
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
