
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Using relative path for the stub to ensure it's picked up
import { admin, getAdminInitializationError } from './lib/firebaseAdmin'; 

export const runtime = 'nodejs'; // Specify Node.js runtime

export const config = {
  matcher: [
    '/admin/:path*', // Protect all admin routes
  ],
};

export async function middleware(request: NextRequest) {
  console.log(`Middleware: Path: ${request.nextUrl.pathname}`);
  
  if (typeof admin === 'undefined' || typeof getAdminInitializationError === 'undefined') {
    console.error("Middleware: CRITICAL - 'admin' or 'getAdminInitializationError' is undefined. This should not happen with the stub.");
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  console.log("Middleware: Successfully imported from firebaseAdmin STUB. Typeof admin:", typeof admin);


  const adminInitError = getAdminInitializationError(); // This will be null from the stub
  if (adminInitError) {
    // This case should not be hit with the current stub, but good practice to keep
    console.error("Middleware: Firebase Admin SDK (STUB) reported an initialization error (unexpected):", adminInitError);
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Basic check for the stubbed admin object structure
  if (!admin || typeof admin.auth !== 'function') {
    console.error("Middleware: Imported 'admin' object (STUB) is not valid. Admin object:", JSON.stringify(admin));
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  console.log("Middleware: STUBBED admin object appears valid.");

  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log("Middleware: Checking auth for /admin route (using STUBBED admin - verification bypassed).");
    const token = request.cookies.get('adminAuthToken')?.value;

    if (!token) {
      console.log("Middleware: No auth token cookie found. Redirecting to homepage.");
      const loginUrl = new URL('/admin/login', request.url); // Or redirect to a generic login page
      return NextResponse.redirect(loginUrl);
    }

    try {
      console.log("Middleware: Calling STUBBED admin.auth().verifyIdToken (will simulate success if token exists)...");
      // The stub's verifyIdToken will now effectively bypass real verification
      const decodedToken = await admin.auth().verifyIdToken(token); 
      if (decodedToken && decodedToken.uid) {
        console.log(`Middleware: STUBBED auth token check passed for UID: ${decodedToken.uid}. Allowing access.`);
        return NextResponse.next();
      }
      // This part should ideally not be reached if verifyIdToken in stub behaves as expected (throws if no token, or returns UID)
      console.log("Middleware: STUBBED auth token verification failed unexpectedly (e.g. stub didn't return UID). Redirecting.");
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    } catch (error) {
      console.warn("Middleware: Error during STUBBED auth token check:", (error as Error).message);
      console.log("Middleware: Deleting potentially invalid cookie and redirecting (due to STUB error/logic).");
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('adminAuthToken');
      return response;
    }
  }

  return NextResponse.next();
}
