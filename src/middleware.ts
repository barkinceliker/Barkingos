
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const { pathname } = request.nextUrl;

  console.log(`Middleware: Request to ${pathname}. isLoggedIn cookie: ${request.cookies.get('isLoggedIn')?.value}`);

  // If trying to access admin routes and not logged in, redirect to login
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    console.log('Middleware: Access to admin denied. Redirecting to /login.');
    return NextResponse.redirect(new URL('/login', request.url));
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
    '/admin/:path*',
    '/login',
  ],
};
