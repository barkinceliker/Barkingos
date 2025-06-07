
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Import the STUBBED admin object and error getter
import { admin, getAdminInitializationError } from '@/lib/firebaseAdmin'; // Using alias

export const runtime = 'nodejs'; // Specify Node.js runtime

export const config = {
  matcher: [
    '/admin/:path*', // Protect all admin routes
  ],
};

export async function middleware(request: NextRequest) {
  console.log(`Middleware: Path: ${request.nextUrl.pathname}`);
  
  if (typeof admin === 'undefined' || typeof getAdminInitializationError === 'undefined') {
    console.error("Middleware: CRITICAL - 'admin' or 'getAdminInitializationError' is undefined after import from STUBBED firebaseAdmin.ts. This should not happen.");
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  console.log("Middleware: Successfully imported from STUBBED firebaseAdmin.ts. Type of admin:", typeof admin);
  console.log("Middleware: Attempting to use 'admin' object from firebaseAdmin (STUBBED). Admin object apps length (if admin.apps exists):", admin && admin.apps ? admin.apps.length : "admin.apps is undefined");


  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error("Middleware: Firebase Admin SDK (STUB) reported an initialization error:", adminInitError);
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Basic check for the stubbed admin object structure
  if (!admin || typeof admin.app !== 'function' || typeof admin.auth !== 'function') {
    console.error("Middleware: Imported 'admin' object (STUB) is not valid. Admin object:", JSON.stringify(admin));
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log("Middleware: Checking auth for /admin route (using STUBBED admin).");
    const token = request.cookies.get('adminAuthToken')?.value;

    if (!token) {
      console.log("Middleware: No auth token cookie found. Redirecting to homepage.");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    try {
      console.log("Middleware: Verifying token with STUBBED admin.auth().verifyIdToken...");
      const decodedToken = await admin.auth().verifyIdToken(token); // This will call the mock
      if (decodedToken && decodedToken.uid) {
        console.log(`Middleware: STUBBED auth token cookie is valid for UID: ${decodedToken.uid}. Allowing access.`);
        return NextResponse.next();
      }
      // This part should ideally not be reached if verifyIdToken throws on bad token
      console.log("Middleware: STUBBED auth token verification failed (no UID) or mock didn't throw. Redirecting.");
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    } catch (error) {
      console.warn("Middleware: Error verifying auth token cookie with STUBBED admin:", (error as Error).message);
      console.log("Middleware: Deleting potentially invalid cookie and redirecting (due to STUB error).");
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('adminAuthToken');
      return response;
    }
  }

  return NextResponse.next();
}
