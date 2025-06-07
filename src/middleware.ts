
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedInCookie = request.cookies.get('isLoggedIn');
  const isLoggedIn = isLoggedInCookie?.value === 'true';
  const { pathname } = request.nextUrl;

  console.log(`Middleware: Path: ${pathname}, isLoggedIn Cookie Value: ${isLoggedInCookie?.value} (parsed as isLoggedIn: ${isLoggedIn})`);
  // Log all cookies received by the middleware for this request
  const allCookies = request.cookies.getAll();
  console.log(`Middleware: All cookies received by middleware for path ${pathname}:`, JSON.stringify(allCookies));


  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      console.log('Middleware: Access to admin denied (user not logged in or cookie missing/invalid). Redirecting to /login.');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname); // Optional: pass where user was going
      return NextResponse.redirect(loginUrl);
    }
    console.log('Middleware: Access to admin granted. Allowing request to proceed for admin path.');
  }

  // If logged in and trying to access /login, redirect to admin
  if (pathname === '/login' && isLoggedIn) {
    console.log('Middleware: Logged in user accessing /login. Redirecting to /admin.');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  console.log('Middleware: No specific redirection rule matched. Allowing request to proceed.');
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
  ],
};
