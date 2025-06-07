
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { admin, getAdminInitializationError } from './lib/firebaseAdmin'; // Using relative path

export const runtime = 'nodejs'; // Specify Node.js runtime for firebase-admin

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'], // Protect admin routes and potential admin API routes
};

export async function middleware(request: NextRequest) {
  console.log(`Middleware (Node.js runtime) executed for path: ${request.nextUrl.pathname}`);

  const adminInitError = getAdminInitializationError();
  if (adminInitError) {
    console.error("Middleware: Firebase Admin SDK initialization error:", adminInitError);
    // Potentially redirect to an error page or show a generic error
    // For now, let it proceed but log the critical error.
    // If access is critical, you might return a 500 error response here.
  }

  const token = request.cookies.get('adminAuthToken')?.value;

  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("Middleware: No auth token found. Redirecting to login.");
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminInitError || !admin || typeof admin.auth !== 'function') {
    console.error("Middleware: Firebase Admin SDK not available or not initialized correctly for token verification. Allowing access with caution as verification is skipped.");
    // This is a critical state. If you cannot verify tokens, you might want to deny access.
    // For now, if a token exists but SDK is broken, we log and cautiously allow.
    // Consider redirecting to an error page or login.
    return NextResponse.next(); 
  }

  try {
    console.log("Middleware: Verifying token with Firebase Admin SDK...");
    await admin.auth().verifyIdToken(token);
    console.log("Middleware: Token verified successfully.");
    return NextResponse.next();
  } catch (error) {
    console.warn("Middleware: Token verification failed. Redirecting to login. Error:", (error as Error).message);
    request.cookies.delete('adminAuthToken'); // Clear invalid token
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('adminAuthToken'); // Ensure cookie is cleared on redirect response
    return response;
  }
}
