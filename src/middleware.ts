
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/admin'], // Protects /admin and /admin/* routes
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Simple log to show middleware is running for a path
  console.log(`Middleware: Path: ${pathname} - No cookie check performed.`);

  // If you want to re-implement protection later, you'd add logic here
  // For now, all admin paths (including /admin/login) will pass through.
  // A more specific check would be needed if /admin/login itself shouldn't be accessed
  // by already "logged-in" users based on Firebase's client-side state.
  // But since we removed the cookie, middleware has no server-side session info.

  // Example: If trying to access /admin/login and Firebase client-side says logged in,
  // you might want to redirect to /admin, but middleware can't know Firebase state.
  // This kind of logic usually lives on the /admin/login page itself using client-side checks.

  return NextResponse.next();
}
