
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const { pathname } = request.nextUrl;

  console.log(`Middleware: Request to ${pathname}. isLoggedIn cookie: ${request.cookies.get('isLoggedIn')?.value}`);

  // If trying to access admin routes and not logged in, redirect to login
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    console.log('Middleware: Access to admin denied. Redirecting to /login.');
    const loginUrl = new URL('/login', request.url)
    // If trying to access a specific admin sub-page, we can redirect back to it after login
    // For now, just redirect to /login without remembering original target.
    // loginUrl.searchParams.set('redirect', pathname); // Example if we want to redirect back
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access login page, redirect to admin
  if (isLoggedIn && pathname === '/login') {
    console.log('Middleware: Already logged in. Redirecting from /login to /admin.');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  console.log('Middleware: Allowing request to proceed for', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files in public folder (e.g. resume-placeholder.pdf)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|resume-placeholder.pdf).*)',
    // Apply middleware to these specific paths for auth logic.
    // The general matcher above is broad, so specific paths for auth are also listed.
    '/admin/:path*',
    '/login',
  ],
};
