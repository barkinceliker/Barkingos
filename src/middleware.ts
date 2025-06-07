
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Login functionality has been removed.
// Middleware is currently not enforcing any authentication checks.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Middleware: Path: ${pathname}. Login checks are disabled.`);
  return NextResponse.next();
}

export const config = {
  // Matcher can be kept to log access to admin paths, or removed if middleware is fully disabled.
  // For now, it will log access to admin paths but not block them.
  matcher: ['/admin/:path*', '/admin'],
};
