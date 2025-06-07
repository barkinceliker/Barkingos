
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Matcher for admin routes, can be kept or removed if no other middleware logic is planned.
// For this change, we are effectively disabling protection for these routes.
export const config = {
  matcher: ['/admin/:path*', '/admin'],
};

export function middleware(request: NextRequest) {
  // Login functionality has been removed.
  // Allowing all requests to pass through.
  console.log(`Middleware: Path: ${request.nextUrl.pathname} - Login checks removed.`);
  return NextResponse.next();
}
