
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/admin'], // Protects /admin and /admin/* routes
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const idTokenCookie = request.cookies.get('firebaseIdToken');
  const isLoggedIn = !!idTokenCookie?.value;

  console.log(`Middleware: Path: ${pathname}, isLoggedIn: ${isLoggedIn}`);
  if (idTokenCookie) {
     console.log(`Middleware: firebaseIdToken exists.`);
  } else {
     console.log(`Middleware: firebaseIdToken does NOT exist.`);
  }


  // If trying to access the login page
  if (pathname === '/admin/login') {
    if (isLoggedIn) {
      // If already logged in, redirect to the admin dashboard
      console.log("Middleware: User is logged in and trying to access /admin/login. Redirecting to /admin.");
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // If not logged in, allow access to the login page
    console.log("Middleware: Allowing access to /admin/login for non-logged-in user.");
    return NextResponse.next();
  }

  // For any other /admin/* route
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      // If not logged in, redirect to the login page
      console.log("Middleware: User is not logged in. Redirecting to /admin/login.");
      const loginUrl = new URL('/admin/login', request.url);
      // You can add a 'redirectedFrom' query parameter if you want to redirect back after login
      // loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // If logged in, allow access
    console.log("Middleware: User is logged in. Allowing access to", pathname);
    // Here you could add server-side token verification if needed
    // For example, by calling an API route that uses Firebase Admin SDK
  }

  return NextResponse.next();
}
